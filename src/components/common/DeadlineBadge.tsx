"use client";

import React from "react";
import { Opportunity } from "@/types";
import { DeadlineVisualIndicator } from "./DeadlineVisualIndicator";

export interface DeadlineBadgeProps {
  opportunity?: Opportunity;
  deadlineDate?: string;
  startDate?: string;
  isYearRound?: boolean;
  variant?: "badge" | "card" | "banner" | "mini";
  showProgressBar?: boolean;
  className?: string;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  opportunity,
  deadlineDate,
  startDate,
  isYearRound,
  variant = "badge",
  showProgressBar = false,
  className = "",
}) => {
  return (
    <DeadlineVisualIndicator
      opportunity={opportunity}
      deadlineDate={deadlineDate}
      startDate={startDate}
      isYearRound={isYearRound}
      variant={variant}
      showProgressBar={showProgressBar}
      className={className}
    />
  );
};
