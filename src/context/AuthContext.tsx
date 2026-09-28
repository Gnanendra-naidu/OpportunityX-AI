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
    preferredOpportunityTypes: ["scheme", "grant", "subsidy"],
    courseStream: "Commerce",
    occupation: "Micro-Enterprise Founder",
    savedOpportunityIds: ["opp-pmegp-micro-enterprise", "opp-tn-pudhumai-penn"],
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
              setProfile({
                id: dbProfile.id,
                name: dbProfile.name || dbProfile.full_name,
                fullName: dbProfile.name || dbProfile.full_name,
                email: dbProfile.email,
                age: dbProfile.age || 20,
                state: dbProfile.state,
                educationLevel: dbProfile.education_level || "Undergraduate",
                lifeStage: dbProfile.life_stage as LifeStageKey,
                incomeRange: dbProfile.income_range || "Below ₹2.5 Lakh",
                category: (dbProfile.category || dbProfile.caste_category || "General") as any,
                casteCategory: (dbProfile.category || dbProfile.caste_category || "General") as any,
                disabilityStatus: dbProfile.disability_status ?? false,
                isDisabled: dbProfile.disability_status ?? false,
                preferredOpportunityTypes: dbProfile.preferred_opportunity_types || ["scholarship", "scheme"],
                savedOpportunityIds: [],
              });
            }
          }
        } else {
          // Local mode: check browser storage
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
            // Guest mode: not logged in until user signs in or clicks a demo persona
            setUser(null);
            setProfile(null);
          }
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
            const mapped: UserProfile = {
              id: dbProfile.id,
              name: dbProfile.name || dbProfile.full_name,
              fullName: dbProfile.name || dbProfile.full_name,
              email: dbProfile.email,
              age: dbProfile.age || 20,
              state: dbProfile.state,
              educationLevel: dbProfile.education_level || "Undergraduate",
              lifeStage: dbProfile.life_stage as LifeStageKey,
              incomeRange: dbProfile.income_range || "Below ₹2.5 Lakh",
              category: (dbProfile.category || dbProfile.caste_category || "General") as any,
              disabilityStatus: dbProfile.disability_status ?? false,
              preferredOpportunityTypes: dbProfile.preferred_opportunity_types || ["scholarship"],
              savedOpportunityIds: [],
            };
            setProfile(mapped);
          }
          return { success: true };
        }
      }

      // Local / Offline fallback authentication
      const userObj = { id: `user-${Date.now()}`, email };
      const fallbackProfile: UserProfile = {
        id: userObj.id,
        name: email.split("@")[0],
        email,
        age: 21,
        state: "Karnataka",
        educationLevel: "Undergraduate (Degree / Diploma)",
        lifeStage: "college_students",
        incomeRange: "Below ₹2.5 Lakh",
        category: "General",
        disabilityStatus: false,
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
            age: profileData.age,
            state: profileData.state,
            educationLevel: profileData.educationLevel,
            lifeStage: profileData.lifeStage,
            incomeRange: profileData.incomeRange,
            category: profileData.category,
            casteCategory: profileData.category,
            disabilityStatus: profileData.disabilityStatus,
            isDisabled: profileData.disabilityStatus,
            preferredOpportunityTypes: profileData.preferredOpportunityTypes,
            savedOpportunityIds: [],
          };

          await supabase.from("user_profiles").upsert({
            id: data.user.id,
            name: profileData.name,
            full_name: profileData.name,
            email,
            age: profileData.age,
            state: profileData.state,
            education_level: profileData.educationLevel,
            life_stage: profileData.lifeStage,
            income_range: profileData.incomeRange,
            category: profileData.category,
            disability_status: profileData.disabilityStatus,
            preferred_opportunity_types: profileData.preferredOpportunityTypes,
          });

          setProfile(newProfile);
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
        age: profileData.age,
        state: profileData.state,
        educationLevel: profileData.educationLevel,
        lifeStage: profileData.lifeStage,
        incomeRange: profileData.incomeRange,
        category: profileData.category,
        casteCategory: profileData.category,
        disabilityStatus: profileData.disabilityStatus,
        isDisabled: profileData.disabilityStatus,
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

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: "No user logged in" };

    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      fullName: updates.name || profile.name,
      casteCategory: updates.category || profile.category,
      isDisabled: updates.disabilityStatus ?? profile.disabilityStatus,
    };

    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));

    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured() && user) {
        await supabase.from("user_profiles").upsert({
          id: user.id,
          name: updatedProfile.name,
          full_name: updatedProfile.name,
          email: updatedProfile.email,
          age: updatedProfile.age,
          state: updatedProfile.state,
          education_level: updatedProfile.educationLevel,
          life_stage: updatedProfile.lifeStage,
          income_range: updatedProfile.incomeRange,
          category: updatedProfile.category,
          disability_status: updatedProfile.disabilityStatus,
          preferred_opportunity_types: updatedProfile.preferredOpportunityTypes,
        });
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
