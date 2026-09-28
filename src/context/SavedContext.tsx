"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Opportunity } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useOpportunities } from "@/hooks/useOpportunities";
import {
  fetchUserSavedOpportunities,
  saveOpportunityRecord,
  removeSavedOpportunityRecord,
  updateSavedOpportunityStatus,
  getLocalSavedIds,
  SavedOpportunityItem,
} from "@/lib/supabase/saved";

export interface SavedContextType {
  savedIds: string[];
  savedItems: SavedOpportunityItem[];
  savedOpportunities: Opportunity[];
  isLoading: boolean;
  isSaved: (opportunityId: string) => boolean;
  saveOpportunity: (opportunityId: string) => Promise<{ success: boolean; isDuplicate: boolean }>;
  removeOpportunity: (opportunityId: string) => Promise<{ success: boolean }>;
  toggleSave: (opportunityId: string) => Promise<boolean>;
  updateStatus: (
    opportunityId: string,
    status: "bookmarked" | "preparing_documents" | "applied" | "awarded" | "rejected",
    notes?: string
  ) => Promise<void>;
  refreshSaved: () => Promise<void>;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { opportunities: catalog } = useOpportunities();

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedItems, setSavedItems] = useState<SavedOpportunityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load saved opportunities for current user (or guest)
  const refreshSaved = useCallback(async () => {
    setIsLoading(true);
    try {
      const { items } = await fetchUserSavedOpportunities(user?.id, catalog);
      setSavedItems(items);
      setSavedIds(items.map((it) => it.opportunityId));
    } catch (err) {
      console.warn("Could not load saved opportunities:", err);
      // Fallback to local ids
      const ids = getLocalSavedIds(user?.id);
      setSavedIds(ids);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, catalog]);

  // Re-sync when user session or catalog changes
  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const isSaved = useCallback(
    (opportunityId: string) => {
      return savedIds.includes(opportunityId);
    },
    [savedIds]
  );

  const saveOpportunity = useCallback(
    async (opportunityId: string) => {
      // Duplicate prevention guard
      if (savedIds.includes(opportunityId)) {
        return { success: true, isDuplicate: true };
      }

      // Optimistic local state update
      setSavedIds((prev) => (prev.includes(opportunityId) ? prev : [opportunityId, ...prev]));

      const targetOpp = catalog.find((c) => c.id === opportunityId);
      if (targetOpp) {
        const newItem: SavedOpportunityItem = {
          id: `saved-${opportunityId}`,
          userId: user?.id || "guest",
          opportunityId,
          status: "bookmarked",
          reminderEnabled: true,
          savedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          opportunity: targetOpp,
        };
        setSavedItems((prev) => [newItem, ...prev.filter((i) => i.opportunityId !== opportunityId)]);
      }

      // Supabase & LocalStorage persistence
      const result = await saveOpportunityRecord(user?.id, opportunityId);
      return result;
    },
    [savedIds, catalog, user?.id]
  );

  const removeOpportunity = useCallback(
    async (opportunityId: string) => {
      // Optimistic local state update
      setSavedIds((prev) => prev.filter((id) => id !== opportunityId));
      setSavedItems((prev) => prev.filter((item) => item.opportunityId !== opportunityId));

      // Supabase & LocalStorage removal
      const result = await removeSavedOpportunityRecord(user?.id, opportunityId);
      return result;
    },
    [user?.id]
  );

  const toggleSave = useCallback(
    async (opportunityId: string) => {
      if (savedIds.includes(opportunityId)) {
        await removeOpportunity(opportunityId);
        return false;
      } else {
        await saveOpportunity(opportunityId);
        return true;
      }
    },
    [savedIds, removeOpportunity, saveOpportunity]
  );

  const updateStatus = useCallback(
    async (
      opportunityId: string,
      status: "bookmarked" | "preparing_documents" | "applied" | "awarded" | "rejected",
      notes?: string
    ) => {
      setSavedItems((prev) =>
        prev.map((item) =>
          item.opportunityId === opportunityId
            ? { ...item, status, userNotes: notes ?? item.userNotes, updatedAt: new Date().toISOString() }
            : item
        )
      );
      await updateSavedOpportunityStatus(user?.id, opportunityId, status, notes);
    },
    [user?.id]
  );

  const savedOpportunities = savedItems.map((item) => item.opportunity);

  return (
    <SavedContext.Provider
      value={{
        savedIds,
        savedItems,
        savedOpportunities,
        isLoading,
        isSaved,
        saveOpportunity,
        removeOpportunity,
        toggleSave,
        updateStatus,
        refreshSaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = (): SavedContextType => {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used within a SavedProvider");
  }
  return context;
};
