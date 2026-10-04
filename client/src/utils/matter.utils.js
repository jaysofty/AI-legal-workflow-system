export const MATTER_TYPES = [
  "LITIGATION",
  "CORPORATE",
  "COMMERCIAL",
  "EMPLOYMENT",
  "REAL_ESTATE",
  "REGULATORY",
  "TAX",
  "INTELLECTUAL_PROPERTY",
  "TECHNOLOGY",
  "ADR",
  "CRIMINAL",
  "FAMILY",
  "OTHER",
];

export const MATTER_STATUSES = [
  "INTAKE",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
];

export function formatMatterType(type = "") {
  return type
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export function formatMatterStatus(status = "") {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export function formatMatterDate(date) {
  if (!date) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getMatterClientName(client) {
  if (!client) {
    return "No client";
  }

  if (
    client.type === "COMPANY" &&
    client.companyName
  ) {
    return client.companyName;
  }

  return (
    `${client.firstName || ""} ${
      client.lastName || ""
    }`.trim() ||
    client.companyName ||
    "Unnamed client"
  );
}

export function getMatterStatusClass(status = "") {
  const classes = {
    INTAKE: "bg-amber-50 text-amber-700",
    ACTIVE: "bg-emerald-50 text-emerald-700",
    CLOSED: "bg-slate-100 text-slate-600",
    ARCHIVED: "bg-slate-100 text-slate-500",
  };

  return (
    classes[status] ||
    "bg-slate-100 text-slate-600"
  );
}