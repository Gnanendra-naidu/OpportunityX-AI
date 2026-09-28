import React from "react";
import Link from "next/link";
import { LifeStageInfo } from "@/types";
import {
  Baby,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  HeartHandshake,
  Sprout,
  Building2,
  Home,
  Accessibility,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface LifeStageCardProps {
  stage: LifeStageInfo;
  count?: number;
}

export const LifeStageCard: React.FC<LifeStageCardProps> = ({ stage, count = 12 }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case "Baby":
        return <Baby className="w-6 h-6 text-blue-600" />;
      case "GraduationCap":
        return <GraduationCap className="w-6 h-6 text-sky-600" />;
      case "BookOpen":
        return <BookOpen className="w-6 h-6 text-emerald-600" />;
      case "Award":
        return <Award className="w-6 h-6 text-purple-600" />;
      case "Briefcase":
        return <Briefcase className="w-6 h-6 text-amber-600" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-6 h-6 text-rose-600" />;
      case "Sprout":
        return <Sprout className="w-6 h-6 text-lime-700" />;
      case "Building2":
        return <Building2 className="w-6 h-6 text-cyan-700" />;
      case "Home":
        return <Home className="w-6 h-6 text-teal-700" />;
      case "Accessibility":
        return <Accessibility className="w-6 h-6 text-indigo-700" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-slate-700" />;
      default:
        return <BookOpen className="w-6 h-6 text-brand-600" />;
    }
  };

  return (
    <Link
      href={`/opportunities?stage=${stage.key}`}
      className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-brand-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
            {getIcon(stage.iconName)}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {stage.ageRange}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
          {stage.title}
        </h3>

        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {stage.subtitle}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {stage.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200/70 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600 group-hover:text-brand-700">
        <span>Explore Schemes</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
