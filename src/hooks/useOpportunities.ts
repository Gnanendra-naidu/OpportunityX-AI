"use client";

import { useState, useEffect, useCallback } from "react";
import { Opportunity } from "@/types";
import { getOpportunities, FetchOpportunitiesOptions, FetchResult } from "@/lib/supabase/opportunities";

export function useOpportunities(initialOptions: FetchOpportunitiesOptions = {}) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"supabase" | "local_fallback">("local_fallback");
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchItems = useCallback(async (opts: FetchOpportunitiesOptions = initialOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const res: FetchResult = await getOpportunities(opts);
      setOpportunities(res.opportunities);
      setDataSource(res.source);
      setTotalCount(res.totalCount);
      if (res.errorMessage) {
        setError(res.errorMessage);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load opportunities");
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(initialOptions)]);

  useEffect(() => {
    fetchItems(initialOptions);
  }, [fetchItems]);

  return {
    opportunities,
    isLoading,
    error,
    dataSource,
    totalCount,
    reload: fetchItems,
  };
}
