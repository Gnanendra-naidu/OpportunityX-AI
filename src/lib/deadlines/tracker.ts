import { Opportunity } from "@/types";

export type DeadlineStatus =
  | "closing_soon"
  | "upcoming"
  | "open"
  | "deadline_passed";

export type UrgencyLevel = "critical" | "warning" | "active" | "future" | "closed";

export interface DeadlineEvaluation {
  status: DeadlineStatus;
  statusLabel: "Closing Soon" | "Upcoming" | "Open" | "Deadline Passed";
  badgeText: string;
  formattedDeadline: string;
  formattedStartDate?: string;
  rawDeadlineDate?: string;
  rawStartDate?: string;
  daysRemaining: number | null; // null for year-round; negative for passed
  daysUntilOpen: number | null; // positive if upcoming, null otherwise
  isYearRound: boolean;
  cycleName?: string;
  academicYear?: string;
  isTentative: boolean;
  urgency: UrgencyLevel;
  progressPercentage: number; // 0 to 100% elapsed between start and deadline
  colorClasses: {
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dotColor: string;
    progressBar: string;
    alertBg: string;
    alertBorder: string;
    alertText: string;
  };
}

/**
 * Standard date formatting helper for Indian citizen context (e.g. 15 Oct 2026)
 */
export function formatDisplayDate(dateInput?: string | Date): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Evaluates the real deadline status of an opportunity using actual database dates.
 * Enforces the 4 exact statuses required:
 * - Closing Soon (0 to 30 days left)
 * - Upcoming (application start date is in the future)
 * - Open (active application with > 30 days, or open year-round)
 * - Deadline Passed (closing date is in the past)
 */
export function getDeadlineEvaluation(
  opportunity: Opportunity,
  referenceDate: Date = new Date()
): DeadlineEvaluation {
  const isYearRound =
    Boolean(opportunity.isYearRound) ||
    Boolean(opportunity.deadlineDate?.toLowerCase().includes("round")) ||
    Boolean(opportunity.deadlineDate?.toLowerCase().includes("always")) ||
    Boolean(opportunity.deadlineDate?.toLowerCase().includes("rolling"));

  const rawDeadline =
    opportunity.applicationDeadline?.closingDate ||
    (opportunity.deadlineDate && !isYearRound ? opportunity.deadlineDate : undefined);

  const rawStart =
    opportunity.applicationStartDate ||
    (opportunity.createdAt ? opportunity.createdAt.split("T")[0] : undefined);

  const cycleName =
    opportunity.applicationDeadline?.cycleName ||
    (opportunity.applicationDeadline?.academicYear
      ? `AY ${opportunity.applicationDeadline.academicYear} Cycle`
      : undefined);

  const academicYear = opportunity.applicationDeadline?.academicYear;
  const isTentative = Boolean(opportunity.applicationDeadline?.isTentative);

  // 1. Check Year-Round / Rolling Opportunity
  if (isYearRound || !rawDeadline) {
    return {
      status: "open",
      statusLabel: "Open",
      badgeText: "Open Year-Round",
      formattedDeadline: "Open Year-Round",
      formattedStartDate: rawStart ? formatDisplayDate(rawStart) : undefined,
      rawDeadlineDate: undefined,
      rawStartDate: rawStart,
      daysRemaining: null,
      daysUntilOpen: null,
      isYearRound: true,
      cycleName,
      academicYear,
      isTentative,
      urgency: "active",
      progressPercentage: 50,
      colorClasses: {
        badgeBg: "bg-emerald-50",
        badgeText: "text-emerald-800",
        badgeBorder: "border-emerald-200",
        dotColor: "bg-emerald-500",
        progressBar: "bg-emerald-500",
        alertBg: "bg-emerald-50/80",
        alertBorder: "border-emerald-200",
        alertText: "text-emerald-900",
      },
    };
  }

  // Parse actual deadline date
  const deadlineTime = new Date(rawDeadline).getTime();
  const nowTime = referenceDate.getTime();

  // If date parsing fails, fall back gracefully to open
  if (isNaN(deadlineTime)) {
    return {
      status: "open",
      statusLabel: "Open",
      badgeText: rawDeadline,
      formattedDeadline: rawDeadline,
      formattedStartDate: rawStart ? formatDisplayDate(rawStart) : undefined,
      rawDeadlineDate: rawDeadline,
      rawStartDate: rawStart,
      daysRemaining: null,
      daysUntilOpen: null,
      isYearRound: false,
      cycleName,
      academicYear,
      isTentative,
      urgency: "active",
      progressPercentage: 50,
      colorClasses: {
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-800",
        badgeBorder: "border-blue-200",
        dotColor: "bg-blue-500",
        progressBar: "bg-blue-500",
        alertBg: "bg-blue-50/80",
        alertBorder: "border-blue-200",
        alertText: "text-blue-900",
      },
    };
  }

  const diffMs = deadlineTime - nowTime;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const formattedDeadline = formatDisplayDate(rawDeadline);

  // Check if there is a defined start date in the future (Upcoming)
  let daysUntilOpen: number | null = null;
  if (opportunity.applicationStartDate) {
    const startTime = new Date(opportunity.applicationStartDate).getTime();
    if (!isNaN(startTime) && startTime > nowTime) {
      daysUntilOpen = Math.ceil((startTime - nowTime) / (1000 * 60 * 60 * 24));
    }
  }

  // Calculate timeline progress percentage
  let progressPercentage = 50;
  if (rawStart) {
    const startTime = new Date(rawStart).getTime();
    if (!isNaN(startTime) && deadlineTime > startTime) {
      const totalSpan = deadlineTime - startTime;
      const elapsed = nowTime - startTime;
      progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalSpan) * 100)));
    }
  }

  // 2. State: UPCOMING (Application window has not started yet)
  if (daysUntilOpen !== null && daysUntilOpen > 0) {
    const startStr = formatDisplayDate(opportunity.applicationStartDate);
    return {
      status: "upcoming",
      statusLabel: "Upcoming",
      badgeText:
        daysUntilOpen === 1
          ? "Opens Tomorrow"
          : `Opens in ${daysUntilOpen} days (${startStr})`,
      formattedDeadline,
      formattedStartDate: startStr,
      rawDeadlineDate: rawDeadline,
      rawStartDate: opportunity.applicationStartDate,
      daysRemaining,
      daysUntilOpen,
      isYearRound: false,
      cycleName,
      academicYear,
      isTentative,
      urgency: "future",
      progressPercentage: 0,
      colorClasses: {
        badgeBg: "bg-indigo-50",
        badgeText: "text-indigo-800",
        badgeBorder: "border-indigo-200",
        dotColor: "bg-indigo-500",
        progressBar: "bg-indigo-500",
        alertBg: "bg-indigo-50/80",
        alertBorder: "border-indigo-200",
        alertText: "text-indigo-900",
      },
    };
  }

  // 3. State: DEADLINE PASSED
  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);
    return {
      status: "deadline_passed",
      statusLabel: "Deadline Passed",
      badgeText: `Passed ${daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`} (${formattedDeadline})`,
      formattedDeadline,
      formattedStartDate: rawStart ? formatDisplayDate(rawStart) : undefined,
      rawDeadlineDate: rawDeadline,
      rawStartDate: rawStart,
      daysRemaining,
      daysUntilOpen: null,
      isYearRound: false,
      cycleName,
      academicYear,
      isTentative,
      urgency: "closed",
      progressPercentage: 100,
      colorClasses: {
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-600",
        badgeBorder: "border-slate-300",
        dotColor: "bg-slate-400",
        progressBar: "bg-slate-400",
        alertBg: "bg-slate-100",
        alertBorder: "border-slate-300",
        alertText: "text-slate-700",
      },
    };
  }

  // 4. State: CLOSING SOON (0 to 30 days left)
  if (daysRemaining <= 30) {
    const isCritical = daysRemaining <= 7;
    let badgeText = `Closes in ${daysRemaining} days`;
    if (daysRemaining === 0) badgeText = "Closes Today!";
    else if (daysRemaining === 1) badgeText = "Closes Tomorrow!";

    return {
      status: "closing_soon",
      statusLabel: "Closing Soon",
      badgeText,
      formattedDeadline,
      formattedStartDate: rawStart ? formatDisplayDate(rawStart) : undefined,
      rawDeadlineDate: rawDeadline,
      rawStartDate: rawStart,
      daysRemaining,
      daysUntilOpen: null,
      isYearRound: false,
      cycleName,
      academicYear,
      isTentative,
      urgency: isCritical ? "critical" : "warning",
      progressPercentage,
      colorClasses: isCritical
        ? {
            badgeBg: "bg-rose-50",
            badgeText: "text-rose-800",
            badgeBorder: "border-rose-300",
            dotColor: "bg-rose-600",
            progressBar: "bg-rose-600",
            alertBg: "bg-rose-50/90",
            alertBorder: "border-rose-200",
            alertText: "text-rose-950",
          }
        : {
            badgeBg: "bg-amber-50",
            badgeText: "text-amber-800",
            badgeBorder: "border-amber-300",
            dotColor: "bg-amber-500",
            progressBar: "bg-amber-500",
            alertBg: "bg-amber-50/90",
            alertBorder: "border-amber-200",
            alertText: "text-amber-950",
          },
    };
  }

  // 5. State: OPEN (> 30 days left)
  return {
    status: "open",
    statusLabel: "Open",
    badgeText: `Open • Closes ${formattedDeadline}`,
    formattedDeadline,
    formattedStartDate: rawStart ? formatDisplayDate(rawStart) : undefined,
    rawDeadlineDate: rawDeadline,
    rawStartDate: rawStart,
    daysRemaining,
    daysUntilOpen: null,
    isYearRound: false,
    cycleName,
    academicYear,
    isTentative,
    urgency: "active",
    progressPercentage,
    colorClasses: {
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-800",
      badgeBorder: "border-emerald-200",
      dotColor: "bg-emerald-500",
      progressBar: "bg-emerald-500",
      alertBg: "bg-emerald-50/80",
      alertBorder: "border-emerald-200",
      alertText: "text-emerald-900",
    },
  };
}

/**
 * Filter list of opportunities by specific deadline state
 */
export function filterOpportunitiesByDeadlineStatus(
  opportunities: Opportunity[],
  status: DeadlineStatus | "all",
  referenceDate: Date = new Date()
): Opportunity[] {
  if (status === "all") return opportunities;
  return opportunities.filter((opp) => {
    const evalResult = getDeadlineEvaluation(opp, referenceDate);
    return evalResult.status === status;
  });
}

/**
 * Group opportunities into 4 buckets: Closing Soon, Upcoming, Open, Deadline Passed
 */
export function groupOpportunitiesByDeadline(
  opportunities: Opportunity[],
  referenceDate: Date = new Date()
): {
  closingSoon: Opportunity[];
  upcoming: Opportunity[];
  open: Opportunity[];
  deadlinePassed: Opportunity[];
  counts: {
    closingSoon: number;
    upcoming: number;
    open: number;
    deadlinePassed: number;
    total: number;
  };
} {
  const closingSoon: Opportunity[] = [];
  const upcoming: Opportunity[] = [];
  const open: Opportunity[] = [];
  const deadlinePassed: Opportunity[] = [];

  for (const opp of opportunities) {
    const evaluation = getDeadlineEvaluation(opp, referenceDate);
    switch (evaluation.status) {
      case "closing_soon":
        closingSoon.push(opp);
        break;
      case "upcoming":
        upcoming.push(opp);
        break;
      case "open":
        open.push(opp);
        break;
      case "deadline_passed":
        deadlinePassed.push(opp);
        break;
    }
  }

  // Sort closing soon by least days remaining
  closingSoon.sort((a, b) => {
    const diffA = getDeadlineEvaluation(a, referenceDate).daysRemaining ?? 999;
    const diffB = getDeadlineEvaluation(b, referenceDate).daysRemaining ?? 999;
    return diffA - diffB;
  });

  // Sort upcoming by opening earliest
  upcoming.sort((a, b) => {
    const openA = getDeadlineEvaluation(a, referenceDate).daysUntilOpen ?? 999;
    const openB = getDeadlineEvaluation(b, referenceDate).daysUntilOpen ?? 999;
    return openA - openB;
  });

  return {
    closingSoon,
    upcoming,
    open,
    deadlinePassed,
    counts: {
      closingSoon: closingSoon.length,
      upcoming: upcoming.length,
      open: open.length,
      deadlinePassed: deadlinePassed.length,
      total: opportunities.length,
    },
  };
}
