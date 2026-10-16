import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    // Single line on small screens: earlier crumbs keep their width, the last
    // one (usually a long product name) truncates instead of overflowing.
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-xs sm:text-sm">
      {items.map((item, i) => (
        <span
          key={i}
          className={i === items.length - 1 ? "flex min-w-0 items-center gap-1" : "flex flex-shrink-0 items-center gap-1"}
        >
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-brand-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate font-medium text-gray-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
