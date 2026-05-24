import * as React from "react";

export default function FeeStatusBadge({ status }) {
  const isPaid = status === "paid";

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium uppercase ${
        isPaid
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
          : "border-amber-300/40 bg-amber-300/10 text-amber-100"
      }`}
    >
      {isPaid ? "Paid" : "Pending"}
    </span>
  );
}
