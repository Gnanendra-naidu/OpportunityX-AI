import React from "react";
import { VerificationStatus } from "@/types";
import { ShieldCheck, AlertTriangle, FlaskConical, HelpCircle } from "lucide-react";

interface VerificationStatusBadgeProps {
  status: VerificationStatus | string;
  isDemo?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
  status,
  isDemo = false,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  if (status === "verified") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs ${sizeClasses[size]} ${className}`}
        title="Verified against official sovereign government / provider portal"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span>VERIFIED</span>
      </span>
    );
  }

  if (status === "under_review" || status === "source_updated") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs ${sizeClasses[size]} ${className}`}
        title="Recent guideline update pending re-audit or confirmation"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>NEEDS VERIFICATION</span>
      </span>
    );
  }

  // Fallback: unverified / demo prototype
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md bg-purple-50 text-purple-800 border border-purple-300 shadow-2xs ${sizeClasses[size]} ${className}`}
      title="Sample demo record for prototype presentation"
    >
      <FlaskConical className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
      <span>DEMO RECORD</span>
    </span>
  );
};
