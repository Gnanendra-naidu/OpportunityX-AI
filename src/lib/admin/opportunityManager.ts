import { Opportunity, VerificationStatus, RequiredDocument, LifeStageKey, OpportunityType, ProviderType, GenderEligibility, SocialCategory } from "@/types";
import { MOCK_OPPORTUNITIES } from "@/data/mockOpportunities";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const LOCAL_STORAGE_ADMIN_OPPS_KEY = "opportunityx_admin_opportunities";
export const LOCAL_STORAGE_DELETED_OPPS_KEY = "opportunityx_admin_deleted_ids";

export interface OpportunityValidationError {
  field: string;
  message: string;
}

/**
 * Validates complete Opportunity record before saving
 */
export function validateOpportunityData(opp: Partial<Opportunity>): {
  isValid: boolean;
  errors: OpportunityValidationError[];
} {
  const errors: OpportunityValidationError[] = [];

  // 1. Basic Fields
  if (!opp.title || opp.title.trim().length < 5) {
    errors.push({ field: "title", message: "Title is required and must be at least 5 characters long." });
  }
  if (!opp.description || opp.description.trim().length < 15) {
    errors.push({ field: "description", message: "Description is required and must be at least 15 characters long." });
  }
  if (!opp.type) {
    errors.push({ field: "type", message: "Opportunity type is required." });
  }
  if (!opp.category || opp.category.trim().length === 0) {
    errors.push({ field: "category", message: "Category is required." });
  }
  if (!opp.provider || opp.provider.trim().length === 0) {
    errors.push({ field: "provider", message: "Provider organization name is required." });
  }
  if (!opp.state || opp.state.trim().length === 0) {
    errors.push({ field: "state", message: "State jurisdiction is required." });
  }
  if (!opp.amount || opp.amount.trim().length === 0) {
    errors.push({ field: "amount", message: "Financial benefit / grant summary is required." });
  }

  // 2. Official Source Validation
  if (!opp.officialWebsite && !opp.officialSource?.url) {
    errors.push({ field: "officialWebsite", message: "Official website or portal URL is required." });
  } else {
    const url = opp.officialWebsite || opp.officialSource?.url || "";
    try {
      new URL(url);
    } catch {
      errors.push({ field: "officialWebsite", message: "Official website must be a valid URL (e.g. https://...)." });
    }
  }

  if (opp.officialSource?.isGovernmentDomain) {
    const domain = (opp.officialSource?.domain || opp.officialSource?.url || "").toLowerCase();
    const isGov = domain.includes(".gov.in") || domain.includes(".nic.in") || domain.includes(".edu.in") || domain.includes(".ac.in");
    if (!isGov) {
      errors.push({
        field: "officialSource.domain",
        message: "Source marked as government domain must have a valid sovereign extension (e.g. .gov.in, .nic.in).",
      });
    }
  }

  // 3. Deadline Validation
  if (!opp.isYearRound && !opp.applicationDeadline?.closingDate && !opp.deadlineDate) {
    errors.push({
      field: "applicationDeadline.closingDate",
      message: "Please specify an application closing date or mark the opportunity as 'Open Year-Round'.",
    });
  }

  // 4. Eligibility Criteria Validation
  if (!opp.lifeStages || opp.lifeStages.length === 0) {
    errors.push({ field: "lifeStages", message: "Select at least one applicable Life Stage." });
  }
  if (!opp.genderEligibility || opp.genderEligibility.length === 0) {
    errors.push({ field: "genderEligibility", message: "Select at least one eligible gender (or 'all')." });
  }

  if (opp.incomeCriteria?.isRestricted) {
    if (!opp.incomeCriteria.maxAnnualIncome || opp.incomeCriteria.maxAnnualIncome <= 0) {
      errors.push({
        field: "incomeCriteria.maxAnnualIncome",
        message: "When income is restricted, please enter a valid positive annual income ceiling.",
      });
    }
  }

  if (opp.ageRange?.minAge !== undefined && opp.ageRange?.maxAge !== undefined) {
    if (opp.ageRange.minAge > opp.ageRange.maxAge) {
      errors.push({
        field: "ageRange",
        message: `Minimum age (${opp.ageRange.minAge}) cannot be greater than maximum age (${opp.ageRange.maxAge}).`,
      });
    }
  }

  // 5. Required Documents Validation
  if (opp.documents && opp.documents.length > 0) {
    opp.documents.forEach((doc, idx) => {
      if (!doc.name || doc.name.trim().length === 0) {
        errors.push({
          field: `documents[${idx}].name`,
          message: `Document #${idx + 1} must have a name.`,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Returns merged list of all opportunities including Admin local overrides
 */
export function getAdminLocalOpportunities(): Opportunity[] {
  if (typeof window === "undefined") {
    return MOCK_OPPORTUNITIES;
  }

  try {
    const deletedJson = localStorage.getItem(LOCAL_STORAGE_DELETED_OPPS_KEY);
    const deletedIds: string[] = deletedJson ? JSON.parse(deletedJson) : [];

    const customJson = localStorage.getItem(LOCAL_STORAGE_ADMIN_OPPS_KEY);
    const customOpps: Opportunity[] = customJson ? JSON.parse(customJson) : [];

    // Map existing by ID
    const oppMap = new Map<string, Opportunity>();
    MOCK_OPPORTUNITIES.forEach((opp) => {
      if (!deletedIds.includes(opp.id)) {
        oppMap.set(opp.id, opp);
      }
    });

    // Apply custom additions & edits
    customOpps.forEach((opp) => {
      if (!deletedIds.includes(opp.id)) {
        oppMap.set(opp.id, opp);
      }
    });

    return Array.from(oppMap.values());
  } catch (err) {
    console.error("Error reading admin local opportunities:", err);
    return MOCK_OPPORTUNITIES;
  }
}

/**
 * Saves a new or edited opportunity (syncs to Supabase if configured + updates LocalStorage)
 */
export async function saveOpportunityRecord(
  opportunity: Opportunity,
  isEdit: boolean = false
): Promise<{ success: boolean; data?: Opportunity; error?: string }> {
  // 1. Validation
  const validation = validateOpportunityData(opportunity);
  if (!validation.isValid) {
    const errorMsg = validation.errors.map((e) => `${e.field}: ${e.message}`).join(" | ");
    return { success: false, error: errorMsg };
  }

  const now = new Date().toISOString();
  const preparedRecord: Opportunity = {
    ...opportunity,
    id: opportunity.id || `opp-custom-${Date.now()}`,
    slug: opportunity.slug || opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    country: "India",
    updatedAt: now,
    createdAt: opportunity.createdAt || now,
    lastVerifiedAt: opportunity.lastVerifiedAt || now.split("T")[0],
    isDemoData: opportunity.isDemoData !== undefined ? opportunity.isDemoData : true,
    tags: opportunity.tags && opportunity.tags.length > 0 ? opportunity.tags : [opportunity.type, opportunity.category],
  };

  // 2. Sync to Supabase if client is active
  try {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      // Upsert into opportunities table
      const { error: oppError } = await supabase.from("opportunities").upsert({
        id: preparedRecord.id,
        slug: preparedRecord.slug,
        title: preparedRecord.title,
        description: preparedRecord.description,
        type: preparedRecord.type,
        category: preparedRecord.category,
        provider: preparedRecord.provider,
        provider_type: preparedRecord.providerType || "central_gov",
        state: preparedRecord.state,
        country: "India",
        benefits: preparedRecord.benefits,
        amount: preparedRecord.amount,
        amount_numeric: preparedRecord.amountNumeric || 0,
        application_start_date: preparedRecord.applicationStartDate || null,
        application_deadline_date: preparedRecord.applicationDeadline?.closingDate || null,
        is_year_round: preparedRecord.isYearRound || false,
        application_method: preparedRecord.applicationMethod || "online_portal",
        official_website: preparedRecord.officialWebsite || preparedRecord.officialSource?.url,
        verification_status: preparedRecord.verificationStatus,
        last_verified_at: preparedRecord.lastVerifiedAt,
        is_demo_data: preparedRecord.isDemoData,
        demo_disclaimer: preparedRecord.demoDisclaimer || "Admin Demo Record",
        tags: preparedRecord.tags,
        updated_at: now,
      });

      if (oppError) {
        console.warn("Supabase upsert warning (falling back to local):", oppError.message);
      }
    }
  } catch (err: any) {
    console.warn("Supabase sync exception (safe local fallback):", err.message);
  }

  // 3. Save to Local Storage Admin Store
  if (typeof window !== "undefined") {
    try {
      const customJson = localStorage.getItem(LOCAL_STORAGE_ADMIN_OPPS_KEY);
      let list: Opportunity[] = customJson ? JSON.parse(customJson) : [];

      // Remove previous version if exists
      list = list.filter((o) => o.id !== preparedRecord.id);
      list.push(preparedRecord);

      localStorage.setItem(LOCAL_STORAGE_ADMIN_OPPS_KEY, JSON.stringify(list));

      // Remove from deleted list if re-added
      const deletedJson = localStorage.getItem(LOCAL_STORAGE_DELETED_OPPS_KEY);
      if (deletedJson) {
        let deletedIds: string[] = JSON.parse(deletedJson);
        deletedIds = deletedIds.filter((id) => id !== preparedRecord.id);
        localStorage.setItem(LOCAL_STORAGE_DELETED_OPPS_KEY, JSON.stringify(deletedIds));
      }
    } catch (err: any) {
      console.error("Local storage update error:", err);
    }
  }

  return { success: true, data: preparedRecord };
}

/**
 * Updates only verification status of an opportunity
 */
export async function updateOpportunityStatus(
  id: string,
  newStatus: VerificationStatus
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  // 1. Supabase update
  try {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      await supabase
        .from("opportunities")
        .update({
          verification_status: newStatus,
          last_verified_at: now,
          updated_at: now,
        })
        .eq("id", id);
    }
  } catch (err) {
    console.warn("Supabase status update error (using local):", err);
  }

  // 2. Local storage update
  if (typeof window !== "undefined") {
    try {
      const currentList = getAdminLocalOpportunities();
      const target = currentList.find((o) => o.id === id);
      if (target) {
        const updatedTarget: Opportunity = {
          ...target,
          verificationStatus: newStatus,
          isVerified: newStatus === "verified",
          lastVerifiedAt: now.split("T")[0],
          updatedAt: now,
        };
        await saveOpportunityRecord(updatedTarget, true);
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Deletes an opportunity
 */
export async function deleteOpportunityRecord(id: string): Promise<{ success: boolean; error?: string }> {
  // 1. Supabase deletion
  try {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      await supabase.from("opportunities").delete().eq("id", id);
    }
  } catch (err) {
    console.warn("Supabase delete warning:", err);
  }

  // 2. Local storage deletion
  if (typeof window !== "undefined") {
    try {
      // Remove from custom list
      const customJson = localStorage.getItem(LOCAL_STORAGE_ADMIN_OPPS_KEY);
      if (customJson) {
        let list: Opportunity[] = JSON.parse(customJson);
        list = list.filter((o) => o.id !== id);
        localStorage.setItem(LOCAL_STORAGE_ADMIN_OPPS_KEY, JSON.stringify(list));
      }

      // Add to deleted IDs set
      const deletedJson = localStorage.getItem(LOCAL_STORAGE_DELETED_OPPS_KEY);
      const deletedIds: string[] = deletedJson ? JSON.parse(deletedJson) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(LOCAL_STORAGE_DELETED_OPPS_KEY, JSON.stringify(deletedIds));
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Resets local admin modifications back to factory default mock dataset
 */
export function resetAdminDataset(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_OPPS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DELETED_OPPS_KEY);
  }
}
