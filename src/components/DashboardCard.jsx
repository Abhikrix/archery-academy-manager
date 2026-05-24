import * as React from "react";
import { Circle } from "lucide-react";

export default function DashboardCard({ icon: Icon, label, value, helper }) {
  const CardIcon = typeof Icon === "function" || typeof Icon?.render === "function" ? Icon : Circle;

  return (
    <article className="surface min-h-[132px] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-academy-gold/12 text-academy-gold">
          <CardIcon size={20} />
        </span>
      </div>
      <p className="mt-4 text-sm text-neutral-500">{helper}</p>
    </article>
  );
}
