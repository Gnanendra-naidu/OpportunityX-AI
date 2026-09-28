import React from "react";
import Link from "next/link";
import { LucideIcon, Search, RotateCcw, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
  isError?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  actionText,
  onAction,
  actionHref,
  secondaryText,
  secondaryHref,
  isError = false,
}) => {
  return (
    <div
      role="status"
      className={`rounded-3xl border p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xs ${
        isError
          ? "bg-rose-50/50 border-rose-200"
          : "bg-white border-slate-200"
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
          isError
            ? "bg-rose-100 text-rose-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {(actionText || secondaryText) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionText && (
            onAction ? (
              <button
                type="button"
                onClick={onAction}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-xs transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{actionText}</span>
              </button>
            ) : actionHref ? (
              <Link
                href={actionHref}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-xs transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <span>{actionText}</span>
              </Link>
            ) : null
          )}

          {secondaryText && secondaryHref && (
            <Link
              href={secondaryHref}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-2xs"
            >
              {secondaryText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
