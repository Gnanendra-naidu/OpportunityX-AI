"use client";

import React from "react";
import { FilterState } from "@/types";
import { Filter, RotateCcw } from "lucide-react";
import { LIFE_STAGES } from "@/data/lifeStages";
import { STATES_LIST } from "@/data/mockOpportunities";

interface FilterPanelProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults?: number;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
  className = "",
}) => {
  const updateField = (key: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const isFiltered =
    filters.lifeStage !== "" ||
    filters.type !== "" ||
    filters.state !== "" ||
    filters.casteCategory !== "" ||
    filters.gender !== "" ||
    filters.maxIncome !== "";

  const activeCount = [
    filters.lifeStage,
    filters.type,
    filters.state,
    filters.casteCategory,
    filters.gender,
    filters.maxIncome,
  ].filter(Boolean).length;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            Filter Opportunities
          </h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-200">
              {activeCount}
            </span>
          )}
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline cursor-pointer"
            aria-label="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      <div className="space-y-4 text-xs sm:text-sm">
        {/* Opportunity Type */}
        <div>
          <label htmlFor="filter-type" className="block font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">
            Opportunity Type
          </label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(e) => updateField("type", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="">All Types (Scholarships & Schemes)</option>
            <option value="scholarship">Scholarships Only</option>
            <option value="scheme">Government Schemes</option>
            <option value="fellowship">Research Fellowships</option>
            <option value="skill_training">Skill & Vocational Training</option>
            <option value="grant">Higher Education Grants</option>
          </select>
        </div>

        {/* Life Stage */}
        <div>
          <label htmlFor="filter-lifestage" className="block font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">
            Target Life Stage
          </label>
          <select
            id="filter-lifestage"
            value={filters.lifeStage}
            onChange={(e) => updateField("lifeStage", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="">All Life Stages</option>
            {LIFE_STAGES.map((ls) => (
              <option key={ls.key} value={ls.key}>
                {ls.title} ({ls.ageRange})
              </option>
            ))}
          </select>
        </div>

        {/* State / Jurisdiction */}
        <div>
          <label htmlFor="filter-state" className="block font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">
            State / Jurisdiction
          </label>
          <select
            id="filter-state"
            value={filters.state}
            onChange={(e) => updateField("state", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="">All Regions</option>
            {STATES_LIST.map((st) => (
              <option key={st.name} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category / Reservation */}
        <div>
          <label htmlFor="filter-category" className="block font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">
            Social Category
          </label>
          <select
            id="filter-category"
            value={filters.casteCategory}
            onChange={(e) => updateField("casteCategory", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC (Other Backward Classes)</option>
            <option value="SC">SC (Scheduled Caste)</option>
            <option value="ST">ST (Scheduled Tribe)</option>
            <option value="EWS">EWS (Economically Weaker Section)</option>
          </select>
        </div>

        {/* Gender Eligibility */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">
            Gender Eligibility
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "", label: "All" },
              { id: "female", label: "Female" },
              { id: "male", label: "Male" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField("gender", item.id)}
                className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  filters.gender === item.id
                    ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Income Ceiling Filter */}
        <div>
          <label htmlFor="filter-income" className="block font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">
            Max Annual Family Income
          </label>
          <select
            id="filter-income"
            value={filters.maxIncome}
            onChange={(e) => updateField("maxIncome", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="">No Income Restriction</option>
            <option value="250000">Up to ₹2.5 Lakhs / yr</option>
            <option value="500000">Up to ₹5.0 Lakhs / yr</option>
            <option value="800000">Up to ₹8.0 Lakhs / yr</option>
          </select>
        </div>
      </div>

      {typeof totalResults === "number" && (
        <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs text-slate-500 text-center font-medium">
          Showing <span className="font-bold text-slate-900">{totalResults}</span> matching opportunities
        </div>
      )}
    </div>
  );
};
