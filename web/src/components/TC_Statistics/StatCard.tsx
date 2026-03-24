import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "primary" | "success" | "warning";
}

const cardStyles: Record<string, string> = {
  default: "bg-white text-gray-800",
  primary: "bg-indigo-50 text-indigo-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
};

const iconStyles: Record<string, string> = {
  default: "bg-gray-100 text-gray-600",
  primary: "bg-indigo-500 text-white",
  success: "bg-emerald-500 text-white",
  warning: "bg-amber-500 text-white",
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 ${cardStyles[variant]} p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium tracking-wide text-slate-500">{title}</p>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${trend.positive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
              }`}>
              {trend.positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(trend.value)}% so với tháng trước
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 shadow-sm ${iconStyles[variant]}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-blue-500/5" />
    </div>
  );
};

export default StatCard;
