"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserProfile, LifeStageKey } from "@/types";
import { DEFAULT_USER_PROFILE } from "@/data/mockOpportunities";

export interface SignUpProfileData {
  name: string;
  age: number;
  state: string;
  educationLevel: string;
  lifeStage: LifeStageKey;
  incomeRange: string;
  category: "General" | "OBC" | "SC" | "ST" | "EWS";
  disabilityStatus: boolean;
  preferredOpportunityTypes: string[];
  gender?: "male" | "female" | "transgender" | "other";
  district?: string;
  courseStream?: string;
  academicPercentage?: number;
  annualFamilyIncome?: number;
  phone?: string;
  occupation?: string;
  isMinority?: boolean;
}

export interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, profileData: SignUpProfileData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoPersona: (persona: "student" | "farmer" | "entrepreneur") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "opportunityx_auth_user";
const LOCAL_STORAGE_PROFILE_KEY = "opportunityx_user_profile";

const DEMO_PERSONAS: Record<string, UserProfile> = {
  student: {
    ...DEFAULT_USER_PROFILE,
  },
  farmer: {
    id: "user-ramesh",
    name: "Ramesh Patil",
    fullName: "Ramesh Patil",
    email: "ramesh.patil.demo@opportunityx.in",
    phone: "+91 94220 12345",
    age: 44,
    gender: "male",
    lifeStage: "farmers",
    state: "Maharashtra",
    district: "Kolhapur",
    educationLevel: "Class 10 Passed",
    incomeRange: "Below ₹2.5 Lakh",
    annualFamilyIncome: 180000,
    category: "General",
    casteCategory: "General",
    disabilityStatus: false,
    isDisabled: false,
    isMinority: false,
    preferredOpportunityTypes: ["scheme", "subsidy", "skill_training"],
    courseStream: "Agriculture / Farming",
    occupation: "Small Landholding Farmer (3 Acres)",
    savedOpportunityIds: ["opp-pm-kisan"],
  },
  entrepreneur: {
    id: "user-lakshmi",
    name: "Lakshmi Narayanan",
    fullName: "Lakshmi Narayanan",
    email: "lakshmi.narayanan.demo@opportunityx.in",
    phone: "+91 97890 54321",
    age: 33,
    gender: "female",
    lifeStage: "entrepreneurs",
    state: "Tamil Nadu",
    district: "Madurai",
    educationLevel: "Graduate (B.Com)",
    incomeRange: "₹2.5L - ₹8L",
    annualFamilyIncome: 350000,
    category: "OBC",
    casteCategory: "OBC",
    disabilityStatus: false,
    isDisabled: false,
    isMinority: false,
    preferredOpportunityTypes: ["scheme", "grant", "subsidy"],
    courseStream: "Commerce / Business Administration",
    occupation: "Micro-Enterprise Founder",
    savedOpportunityIds: ["opp-pmegp-micro-enterprise", "opp-tn-pudhumai-penn"],
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to map DB row to UserProfile
  const mapDbProfileToUserProfile = (db: any): UserProfile => ({
    id: db.id,
    name: db.name || db.full_name || "OpportunityX User",
    fullName: db.full_name || db.name || "OpportunityX User",
    email: db.email || "",
    phone: db.phone || "",
    age: db.age || 20,
    gender: db.gender || undefined,
    state: db.state || "Karnataka",
    district: db.district || "",
    educationLevel: db.education_level || "Undergraduate (Degree / B.Tech / B.Sc)",
    courseStream: db.course_stream || "",
    academicPercentage: db.academic_percentage != null ? Number(db.academic_percentage) : undefined,
    lifeStage: (db.life_stage as LifeStageKey) || "college_students",
    incomeRange: db.income_range || "Below ₹2.5 Lakh",
    annualFamilyIncome: db.annual_family_income != null ? Number(db.annual_family_income) : undefined,
    category: (db.category || db.caste_category || "General") as any,
    casteCategory: (db.caste_category || db.category || "General") as any,
    disabilityStatus: db.disability_status ?? db.is_disabled ?? false,
    isDisabled: db.is_disabled ?? db.disability_status ?? false,
    isMinority: db.is_minority ?? false,
    occupation: db.occupation || "",
    preferredOpportunityTypes: db.preferred_opportunity_types?.length
      ? db.preferred_opportunity_types
      : ["scholarship", "scheme"],
    savedOpportunityIds: [],
  });

  // Initialize session from Supabase or Local Storage
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        if (supabase && isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || "" });
            // Fetch profile from Supabase
            const { data: dbProfile } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (dbProfile) {
              const mapped = mapDbProfileToUserProfile(dbProfile);
              setProfile(mapped);
              localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(mapped));
              return;
            }
          }
        }

        // Local storage fallback (for offline, demo personas, or guest profiles)
        const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        const storedProfile = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
        if (storedUser && storedProfile) {
          try {
            setUser(JSON.parse(storedUser));
            setProfile(JSON.parse(storedProfile));
          } catch {
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err: any) {
        console.warn("Auth initialization notice:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Sign In
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (authError) throw authError;

        if (data.user) {
          const userObj = { id: data.user.id, email: data.user.email || email };
          setUser(userObj);

          // Fetch profile
          const { data: dbProfile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (dbProfile) {
            const mapped = mapDbProfileToUserProfile(dbProfile);
            setProfile(mapped);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(mapped));
          }
          return { success: true };
        }
      }

      // Local / Offline fallback authentication
      const userObj = { id: `user-${Date.now()}`, email };
      const fallbackProfile: UserProfile = {
        id: userObj.id,
        name: email.split("@")[0],
        fullName: email.split("@")[0],
        email,
        age: 21,
        state: "Karnataka",
        educationLevel: "Undergraduate (Degree / B.Tech / B.Sc)",
        courseStream: "Engineering / Technology",
        academicPercentage: 75.0,
        lifeStage: "college_students",
        incomeRange: "₹1.5 Lakh - ₹2.5 Lakh / year",
        annualFamilyIncome: 200000,
        category: "General",
        casteCategory: "General",
        disabilityStatus: false,
        isDisabled: false,
        isMinority: false,
        preferredOpportunityTypes: ["scholarship", "scheme"],
        savedOpportunityIds: [],
      };

      setUser(userObj);
      setProfile(fallbackProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(fallbackProfile));
      return { success: true };
    } catch (err: any) {
      const msg = err.message || "Invalid email or password";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up
  const signUp = async (
    email: string,
    pass: string,
    profileData: SignUpProfileData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              name: profileData.name,
              age: profileData.age,
              state: profileData.state,
            },
          },
        });

        if (authError) throw authError;

        if (data.user) {
          const userObj = { id: data.user.id, email: data.user.email || email };
          setUser(userObj);

          // Save profile in user_profiles table
          const newProfile: UserProfile = {
            id: data.user.id,
            name: profileData.name,
            fullName: profileData.name,
            email,
            phone: profileData.phone || "",
            age: profileData.age,
            gender: profileData.gender,
            state: profileData.state,
            district: profileData.district || "",
            educationLevel: profileData.educationLevel,
            courseStream: profileData.courseStream || "",
            academicPercentage: profileData.academicPercentage,
            lifeStage: profileData.lifeStage,
            incomeRange: profileData.incomeRange,
            annualFamilyIncome: profileData.annualFamilyIncome,
            category: profileData.category,
            casteCategory: profileData.category,
            disabilityStatus: profileData.disabilityStatus,
            isDisabled: profileData.disabilityStatus,
            isMinority: profileData.isMinority ?? false,
            occupation: profileData.occupation || "",
            preferredOpportunityTypes: profileData.preferredOpportunityTypes,
            savedOpportunityIds: [],
          };

          await supabase.from("user_profiles").upsert({
            id: data.user.id,
            name: profileData.name,
            full_name: profileData.name,
            email,
            phone: profileData.phone || null,
            age: profileData.age,
            gender: profileData.gender || null,
            state: profileData.state,
            district: profileData.district || null,
            education_level: profileData.educationLevel,
            course_stream: profileData.courseStream || null,
            academic_percentage: profileData.academicPercentage != null ? Number(profileData.academicPercentage) : null,
            occupation: profileData.occupation || null,
            life_stage: profileData.lifeStage,
            income_range: profileData.incomeRange,
            annual_family_income: profileData.annualFamilyIncome != null ? Number(profileData.annualFamilyIncome) : null,
            category: profileData.category,
            caste_category: profileData.category,
            disability_status: profileData.disabilityStatus,
            is_disabled: profileData.disabilityStatus,
            is_minority: profileData.isMinority ?? false,
            preferred_opportunity_types: profileData.preferredOpportunityTypes,
          });

          setProfile(newProfile);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
          return { success: true };
        }
      }

      // Local / Offline fallback signup
      const userObj = { id: `user-${Date.now()}`, email };
      const newProfile: UserProfile = {
        id: userObj.id,
        name: profileData.name,
        fullName: profileData.name,
        email,
        phone: profileData.phone || "",
        age: profileData.age,
        gender: profileData.gender,
        state: profileData.state,
        district: profileData.district || "",
        educationLevel: profileData.educationLevel,
        courseStream: profileData.courseStream || "",
        academicPercentage: profileData.academicPercentage,
        lifeStage: profileData.lifeStage,
        incomeRange: profileData.incomeRange,
        annualFamilyIncome: profileData.annualFamilyIncome,
        category: profileData.category,
        casteCategory: profileData.category,
        disabilityStatus: profileData.disabilityStatus,
        isDisabled: profileData.disabilityStatus,
        isMinority: profileData.isMinority ?? false,
        occupation: profileData.occupation || "",
        preferredOpportunityTypes: profileData.preferredOpportunityTypes,
        savedOpportunityIds: [],
      };

      setUser(userObj);
      setProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
      return { success: true };
    } catch (err: any) {
      const msg = err.message || "Failed to create account";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("SignOut notice:", err);
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
      setIsLoading(false);
    }
  };

  // Update Profile (works seamlessly for authenticated and guest users)
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    const baseProfile: UserProfile = profile || {
      id: user?.id || `user-guest-${Date.now()}`,
      name: user?.email ? user.email.split("@")[0] : "OpportunityX User",
      fullName: user?.email ? user.email.split("@")[0] : "OpportunityX User",
      email: user?.email || "citizen@opportunityx.in",
      age: 20,
      state: "Karnataka",
      educationLevel: "Undergraduate (Degree / B.Tech / B.Sc)",
      courseStream: "Computer Science & Engineering",
      academicPercentage: 75.0,
      lifeStage: "college_students",
      incomeRange: "₹1.5 Lakh - ₹2.5 Lakh / year",
      annualFamilyIncome: 200000,
      category: "General",
      casteCategory: "General",
      disabilityStatus: false,
      isDisabled: false,
      isMinority: false,
      preferredOpportunityTypes: ["scholarship", "scheme"],
      savedOpportunityIds: [],
    };

    const updatedProfile: UserProfile = {
      ...baseProfile,
      ...updates,
      name: updates.name || baseProfile.name,
      fullName: updates.fullName || updates.name || baseProfile.fullName || baseProfile.name,
      casteCategory: updates.casteCategory || updates.category || baseProfile.category,
      category: updates.category || baseProfile.category,
      disabilityStatus: updates.disabilityStatus ?? baseProfile.disabilityStatus,
      isDisabled: updates.isDisabled ?? updates.disabilityStatus ?? baseProfile.isDisabled,
      updatedAt: new Date().toISOString(),
    };

    // Ensure user session exists so downstream components know an active profile is present
    if (!user) {
      const guestUser = { id: updatedProfile.id, email: updatedProfile.email };
      setUser(guestUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(guestUser));
    }

    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));

    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured() && user) {
        // Validate if ID is a valid Postgres UUID before hitting Supabase table
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id);
        if (isUuid) {
          const { error: upsertErr } = await supabase.from("user_profiles").upsert({
            id: user.id,
            name: updatedProfile.name,
            full_name: updatedProfile.fullName || updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone || null,
            age: updatedProfile.age,
            gender: updatedProfile.gender || null,
            state: updatedProfile.state,
            district: updatedProfile.district || null,
            education_level: updatedProfile.educationLevel,
            course_stream: updatedProfile.courseStream || null,
            academic_percentage: updatedProfile.academicPercentage != null ? Number(updatedProfile.academicPercentage) : null,
            occupation: updatedProfile.occupation || null,
            life_stage: updatedProfile.lifeStage,
            income_range: updatedProfile.incomeRange,
            annual_family_income: updatedProfile.annualFamilyIncome != null ? Number(updatedProfile.annualFamilyIncome) : null,
            category: updatedProfile.category,
            caste_category: updatedProfile.casteCategory || updatedProfile.category,
            disability_status: updatedProfile.disabilityStatus,
            is_disabled: updatedProfile.isDisabled ?? updatedProfile.disabilityStatus,
            is_minority: updatedProfile.isMinority ?? false,
            preferred_opportunity_types: updatedProfile.preferredOpportunityTypes,
          });

          if (upsertErr) {
            console.warn("Supabase user_profiles upsert notice:", upsertErr.message);
          }
        }
      }
      return { success: true };
    } catch (err: any) {
      console.warn("Profile update remote notice:", err.message);
      return { success: true }; // Local state updated successfully
    }
  };

  // Quick Demo Persona Switcher (Student, Farmer, Entrepreneur)
  const loginAsDemoPersona = (personaType: "student" | "farmer" | "entrepreneur") => {
    const selected = DEMO_PERSONAS[personaType];
    if (selected) {
      const userObj = { id: selected.id, email: selected.email };
      setUser(userObj);
      setProfile(selected);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(selected));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        updateProfile,
        loginAsDemoPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
