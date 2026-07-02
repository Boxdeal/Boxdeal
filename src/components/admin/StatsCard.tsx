import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "warning" | "danger" | "success";
  /** When set, the whole card becomes a link to this route. */
  href?: string;
}

const variantMap = {
  default: { bg: "bg-blue-50",   icon: "text-blue-600",   badge: "bg-blue-100 text-blue-700" },
  success: { bg: "bg-green-50",  icon: "text-green-600",  badge: "bg-green-100 text-green-700" },
  warning: { bg: "bg-yellow-50", icon: "text-yellow-600", badge: "bg-yellow-100 text-yellow-700" },
  danger:  { bg: "bg-red-50",    icon: "text-red-600",    badge: "bg-red-100 text-red-700" },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  href,
}: StatsCardProps) {
  const v = variantMap[variant];

  const inner = (
    <div className="flex items-start justify-between">
      <div>
        <p className="flex items-center gap-1 text-sm text-gray-500">
          {title}
          {href && <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-brand-500" />}
        </p>
        <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
        {trend && (
          <p className="mt-1 text-xs text-gray-400">
            <span
              className={cn(
                "inline-block rounded px-1 font-medium",
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>{" "}
            {trend.label}
          </p>
        )}
      </div>
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", v.bg)}>
        <Icon className={cn("h-5 w-5", v.icon)} />
      </div>
    </div>
  );

  const base = "block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, "group transition-all hover:border-brand-200 hover:shadow-md")}
      >
        {inner}
      </Link>
    );
  }

  return <div className={base}>{inner}</div>;
}
