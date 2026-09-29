import { ApplicationStage } from "@/types";

export interface StageConfig {
  key: ApplicationStage;
  label: string;
  shortLabel: string;
  description: string;
  stepNumber: number;
  percentage: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}

export const APPLICATION_STAGES: Record<ApplicationStage, StageConfig> = {
  saved: {
    key: "saved",
    label: "Saved",
    shortLabel: "Saved",
    description: "Bookmarked for eligibility review & deadline tracking",
    stepNumber: 1,
    percentage: 20,
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    badgeBorder: "border-slate-300",
    dotColor: "bg-slate-400",
  },
  planning_to_apply: {
    key: "planning_to_apply",
    label: "Planning to Apply",
    shortLabel: "Planning",
    description: "Reviewing eligibility guidelines & gathering required certificates",
    stepNumber: 2,
    percentage: 40,
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-800",
    badgeBorder: "border-blue-200",
    dotColor: "bg-blue-500",
  },
  application_started: {
    key: "application_started",
    label: "Application Started",
    shortLabel: "Started",
    description: "Registered on official portal & filling online forms/drafts",
    stepNumber: 3,
    percentage: 60,
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-800",
    badgeBorder: "border-indigo-200",
    dotColor: "bg-indigo-500",
  },
  submitted: {
    key: "submitted",
    label: "Submitted",
    shortLabel: "Submitted",
    description: "Final form submitted & application acknowledgement generated",
    stepNumber: 4,
    percentage: 80,
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    dotColor: "bg-amber-500",
  },
  completed: {
    key: "completed",
    label: "Completed",
    shortLabel: "Completed",
    description: "Application verified & scholarship/grant sanctioned or completed",
    stepNumber: 5,
    percentage: 100,
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-200",
    dotColor: "bg-emerald-500",
  },
};

export const STAGES_LIST: StageConfig[] = [
  APPLICATION_STAGES.saved,
  APPLICATION_STAGES.planning_to_apply,
  APPLICATION_STAGES.application_started,
  APPLICATION_STAGES.submitted,
  APPLICATION_STAGES.completed,
];

/**
 * Normalizes any database status string (or legacy status) to the canonical 5 ApplicationStage values.
 */
export function normalizeApplicationStage(status?: string, notes?: string): ApplicationStage {
  if (!status) return "saved";
  const s = status.toLowerCase();

  // Explicit stage matches
  if (s === "saved" || s === "bookmarked") return "saved";
  if (s === "planning_to_apply" || s === "planning") return "planning_to_apply";
  if (s === "application_started" || s === "started" || s === "in_progress") return "application_started";
  if (s === "submitted" || s === "applied") return "submitted";
  if (s === "completed" || s === "awarded" || s === "rejected") return "completed";

  // Check if status is preparing_documents, inspect notes if it's application_started
  if (s === "preparing_documents") {
    if (notes && notes.includes("[stage:application_started]")) {
      return "application_started";
    }
    return "planning_to_apply";
  }

  return "saved";
}

/**
 * Maps an ApplicationStage back to the allowed Supabase PostgreSQL status CHECK constraint:
 * ('bookmarked', 'preparing_documents', 'applied', 'awarded', 'rejected')
 */
export function mapStageToDbStatus(
  stage: ApplicationStage | "bookmarked" | "preparing_documents" | "applied" | "awarded" | "rejected",
  currentNotes?: string
): {
  dbStatus: "bookmarked" | "preparing_documents" | "applied" | "awarded" | "rejected";
  updatedNotes?: string;
} {
  // Strip old stage tags if any
  const cleanNotes = (currentNotes || "").replace(/\[stage:[a-z_]+\]/g, "").trim();

  switch (stage) {
    case "saved":
    case "bookmarked":
      return { dbStatus: "bookmarked", updatedNotes: cleanNotes || undefined };
    case "planning_to_apply":
    case "preparing_documents":
      return { dbStatus: "preparing_documents", updatedNotes: cleanNotes || undefined };
    case "application_started":
      return {
        dbStatus: "preparing_documents",
        updatedNotes: cleanNotes
          ? `[stage:application_started] ${cleanNotes}`
          : "[stage:application_started]",
      };
    case "submitted":
    case "applied":
      return { dbStatus: "applied", updatedNotes: cleanNotes || undefined };
    case "completed":
    case "awarded":
      return { dbStatus: "awarded", updatedNotes: cleanNotes || undefined };
    case "rejected":
      return { dbStatus: "rejected", updatedNotes: cleanNotes || undefined };
    default:
      return { dbStatus: "bookmarked", updatedNotes: cleanNotes || undefined };
  }
}
