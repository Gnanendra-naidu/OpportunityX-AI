import { getSupabaseClient, isSupabaseConfigured } from "./client";
import { JoinedOpportunityRow } from "./types";
import { mapDbRowToOpportunity } from "./opportunities";
import { Opportunity, SavedOpportunity } from "@/types";
import { MOCK_OPPORTUNITIES, DEFAULT_USER_PROFILE } from "@/data/mockOpportunities";

export interface SavedOpportunityItem {
  id: string;
  userId: string;
  opportunityId: string;
  status: "bookmarked" | "preparing_documents" | "applied" | "awarded" | "rejected";
  userNotes?: string;
  reminderEnabled: boolean;
  targetDeadlineDate?: string;
  savedAt: string;
  updatedAt: string;
  opportunity: Opportunity;
}

const LOCAL_SAVED_KEY_PREFIX = "opportunityx_saved_ids_";
const DEFAULT_SAVED_IDS = ["sch-aicte-pragati", "opp-karnataka-raitha-vidya-nidhi"];

/**
 * Validates if a string is a valid UUID format
 */
export function isUuid(str: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Get storage key for a specific user ID
 */
function getStorageKey(userId?: string): string {
  if (!userId) return `${LOCAL_SAVED_KEY_PREFIX}guest`;
  return `${LOCAL_SAVED_KEY_PREFIX}${userId}`;
}

/**
 * Reads saved IDs from browser local storage with fallback
 */
export function getLocalSavedIds(userId?: string): string[] {
  if (typeof window === "undefined") return DEFAULT_SAVED_IDS;
  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    // Persona-specific initial bookmarks
    if (userId === "user-ramesh" || userId === "farmer") {
      const initial = ["opp-pm-kisan"];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    if (userId === "user-lakshmi" || userId === "entrepreneur") {
      const initial = ["opp-pmegp-micro-enterprise", "opp-tn-pudhumai-penn"];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    // Default student or guest persona
    if (!userId || userId === DEFAULT_USER_PROFILE.id || userId === "student" || userId === "guest") {
      localStorage.setItem(key, JSON.stringify(DEFAULT_SAVED_IDS));
      return DEFAULT_SAVED_IDS;
    }
    return DEFAULT_SAVED_IDS;
  } catch (err) {
    console.warn("Could not read local saved opportunities:", err);
    return DEFAULT_SAVED_IDS;
  }
}

/**
 * Writes saved IDs to browser local storage
 */
export function setLocalSavedIds(userId: string | undefined, ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    // Ensure duplicates are removed
    const uniqueIds = Array.from(new Set(ids));
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(uniqueIds));
  } catch (err) {
    console.warn("Could not persist local saved opportunities:", err);
  }
}

/**
 * Fetch all saved opportunities for a user, combining Supabase PostgreSQL
 * with local resiliency fallback.
 */
export async function fetchUserSavedOpportunities(
  userId?: string,
  catalog: Opportunity[] = MOCK_OPPORTUNITIES
): Promise<{ items: SavedOpportunityItem[]; source: "supabase" | "local" }> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured() && userId && isUuid(userId)) {
    try {
      const { data, error } = await supabase
        .from("saved_opportunities")
        .select(`
          id,
          user_id,
          opportunity_id,
          status,
          user_notes,
          reminder_enabled,
          target_deadline_date,
          created_at,
          updated_at,
          opportunities (
            *,
            eligibility_criteria (*),
            required_documents (*),
            opportunity_deadlines (*),
            official_sources (*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const items: SavedOpportunityItem[] = [];
        const syncedIds: string[] = [];

        for (const row of data) {
          let opp: Opportunity | undefined;
          if (row.opportunities) {
            opp = mapDbRowToOpportunity(row.opportunities as unknown as JoinedOpportunityRow);
          } else {
            // Find in local catalog as backup
            opp = catalog.find((c) => c.id === row.opportunity_id);
          }

          if (opp) {
            syncedIds.push(row.opportunity_id);
            items.push({
              id: row.id,
              userId: row.user_id,
              opportunityId: row.opportunity_id,
              status: row.status as any,
              userNotes: row.user_notes || undefined,
              reminderEnabled: row.reminder_enabled ?? true,
              targetDeadlineDate: row.target_deadline_date || undefined,
              savedAt: row.created_at,
              updatedAt: row.updated_at,
              opportunity: opp,
            });
          }
        }

        // Cache synced IDs in local storage
        setLocalSavedIds(userId, syncedIds);
        return { items, source: "supabase" };
      }
    } catch (err) {
      console.warn("Supabase saved opportunities fetch fallback notice:", err);
    }
  }

  // Local storage mode (Guest, Demo persona, or offline fallback)
  const localIds = getLocalSavedIds(userId);
  const items: SavedOpportunityItem[] = [];

  for (const oppId of localIds) {
    const opp = catalog.find((c) => c.id === oppId);
    if (opp) {
      items.push({
        id: `saved-${oppId}`,
        userId: userId || "guest",
        opportunityId: oppId,
        status: "bookmarked",
        reminderEnabled: true,
        savedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        opportunity: opp,
      });
    }
  }

  return { items, source: "local" };
}

/**
 * Save an opportunity for a user.
 * PREVENTS DUPLICATE SAVES at both database and application level.
 */
export async function saveOpportunityRecord(
  userId: string | undefined,
  opportunityId: string
): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
  if (!opportunityId) {
    return { success: false, isDuplicate: false, error: "Invalid opportunity ID" };
  }

  // 1. Check local storage duplicate guard
  const existingIds = getLocalSavedIds(userId);
  if (existingIds.includes(opportunityId)) {
    return { success: true, isDuplicate: true };
  }

  // Update local storage
  const updatedIds = [opportunityId, ...existingIds];
  setLocalSavedIds(userId, updatedIds);

  // 2. Persist to Supabase PostgreSQL if configured and valid UUID user
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured() && userId && isUuid(userId)) {
    try {
      // Use ON CONFLICT DO NOTHING to strictly prevent duplicate saves in DB
      const { error } = await supabase
        .from("saved_opportunities")
        .upsert(
          {
            user_id: userId,
            opportunity_id: opportunityId,
            status: "bookmarked",
            reminder_enabled: true,
          },
          { onConflict: "user_id,opportunity_id" }
        );

      if (error) {
        console.warn("Supabase save record notice:", error.message);
      }
    } catch (err: any) {
      console.warn("Supabase save exception notice:", err.message);
    }
  }

  return { success: true, isDuplicate: false };
}

/**
 * Remove an opportunity from saved list for a user.
 */
export async function removeSavedOpportunityRecord(
  userId: string | undefined,
  opportunityId: string
): Promise<{ success: boolean; error?: string }> {
  if (!opportunityId) {
    return { success: false, error: "Invalid opportunity ID" };
  }

  // 1. Remove from local storage
  const existingIds = getLocalSavedIds(userId);
  const filtered = existingIds.filter((id) => id !== opportunityId);
  setLocalSavedIds(userId, filtered);

  // 2. Delete from Supabase PostgreSQL if configured and valid UUID
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured() && userId && isUuid(userId)) {
    try {
      const { error } = await supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", userId)
        .eq("opportunity_id", opportunityId);

      if (error) {
        console.warn("Supabase remove record notice:", error.message);
      }
    } catch (err: any) {
      console.warn("Supabase remove exception notice:", err.message);
    }
  }

  return { success: true };
}

/**
 * Update tracking status of a saved opportunity (e.g., preparing_documents, applied)
 */
export async function updateSavedOpportunityStatus(
  userId: string | undefined,
  opportunityId: string,
  status: "bookmarked" | "preparing_documents" | "applied" | "awarded" | "rejected",
  userNotes?: string
): Promise<{ success: boolean }> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured() && userId && isUuid(userId)) {
    try {
      await supabase
        .from("saved_opportunities")
        .update({
          status,
          user_notes: userNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("opportunity_id", opportunityId);
    } catch (err) {
      console.warn("Supabase status update notice:", err);
    }
  }
  return { success: true };
}
