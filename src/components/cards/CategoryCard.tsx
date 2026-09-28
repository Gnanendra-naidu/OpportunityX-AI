import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  count: number;
  description: string;
  href: string;
  iconBg: string;
  iconText: string;
  icon: React.ReactNode;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  count,
  description,
  href,
  iconBg,
  iconText,
  icon,
}) => {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-brand-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconText} flex items-center justify-center`}>
            {icon}
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {count}+ Opportunities
          </span>
        </div>
        <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600 group-hover:text-brand-600">
        <span>Browse Category</span>
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </Link>
  );
};
