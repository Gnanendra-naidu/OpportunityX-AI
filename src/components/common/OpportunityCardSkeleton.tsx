import React from "react";

interface OpportunityCardSkeletonProps {
  count?: number;
}

export const OpportunityCardSkeleton: React.FC<OpportunityCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between animate-pulse shadow-2xs"
          aria-hidden="true"
        >
          <div>
            {/* Top row: tags + bookmark */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
                <div className="h-4 w-14 bg-slate-200 rounded" />
              </div>
              <div className="h-7 w-16 bg-slate-200 rounded-xl" />
            </div>

            {/* Title */}
            <div className="space-y-2 mb-3">
              <div className="h-5 bg-slate-200 rounded-md w-11/12" />
              <div className="h-5 bg-slate-200 rounded-md w-3/4" />
            </div>

            {/* Provider */}
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />

            {/* Benefit Box */}
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-between mb-4">
              <div className="space-y-1.5">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-5 w-24 bg-slate-200 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>

            {/* Description lines */}
            <div className="space-y-2 mb-4">
              <div className="h-3.5 bg-slate-200 rounded w-full" />
              <div className="h-3.5 bg-slate-200 rounded w-5/6" />
            </div>

            {/* Criteria Bullets */}
            <div className="pt-3 border-t border-slate-100 space-y-2 mb-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-3 bg-slate-200 rounded w-4/5" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-16 bg-slate-200 rounded-lg" />
              <div className="h-7 w-24 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
