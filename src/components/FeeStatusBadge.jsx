import * as React from "react";

export default function FeeStatusBadge({ status }) {
  const isPaid = status === "paid";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] ${
        isPaid
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
          : "border-amber-300/40 bg-amber-300/10 text-amber-100"
      }`}
    >
      {isPaid ? "Paid" : "Pending"}
    </span>
  );
}
