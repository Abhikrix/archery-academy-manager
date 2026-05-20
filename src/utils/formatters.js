export function formatCurrency(amount) {
  return `INR ${amount.toLocaleString("en-IN")}`;
}

export function formatDate(value) {
  if (!value) {
    return "Not added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function getLocalDateKey(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function getLocalMonthKey(date = new Date()) {
  return getLocalDateKey(date).slice(0, 7);
}

export function formatMonth(value) {
  if (!value) {
    return "Not added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}-01T00:00:00`));
}

export function getBatchById(batches, batchId) {
  return batches.find((batch) => batch.id === batchId);
}
