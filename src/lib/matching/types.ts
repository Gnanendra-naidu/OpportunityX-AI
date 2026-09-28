import { Opportunity, UserProfile } from "@/types";

export type MatchCategory =
  | "likely_match"
  | "needs_verification"
  | "does_not_match";

export interface RuleEvaluation {
  ruleName: string; // e.g., "State Domicile", "Social Category", "Income Ceiling", "Life Stage", "Age Range"
  status: "pass" | "needs_verification" | "fail";
  userValue: string;
  schemeRequirement: string;
  explanation: string;
}

export interface MatchResult {
  opportunity: Opportunity;
  category: MatchCategory;
  matchScore: number; // 0 - 100 confidence score based on deterministic rules
  summaryReason: string;
  profileAttributesUsed: {
    attribute: string;
    value: string;
    impact: "matched" | "verified" | "unverified" | "mismatched" | "unspecified";
  }[];
  verificationChecklist: string[];
  ruleEvaluations: RuleEvaluation[];
  officialSource: {
    portalName: string;
    department: string;
    url: string;
    isGovernmentDomain: boolean;
  };
  deadline: {
    formattedDate: string;
    cycleName?: string;
    isTentative: boolean;
    isYearRound: boolean;
  };
  disclaimer: string;
}
