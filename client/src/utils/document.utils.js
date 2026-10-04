export const DOCUMENT_TYPES = [
  "PLEADING",
  "MOTION",
  "AFFIDAVIT",
  "WRITTEN_ADDRESS",
  "WITNESS_STATEMENT",
  "CONTRACT",
  "AGREEMENT",
  "COURT_ORDER",
  "JUDGMENT",
  "CTC",
  "CERTIFICATE",
  "REGULATORY",
  "IDENTIFICATION",
  "CORRESPONDENCE",
  "LEGAL_RESEARCH",
  "INTERNAL_MEMO",
  "TEMPLATE",
  "OTHER",
];

export const DOCUMENT_STATUSES = [
  "UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
  "ARCHIVED",
];

export const DOCUMENT_MIME_TYPES = {
  PDF: "application/pdf",
  DOCX:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function formatDocumentType(type = "") {
  return type
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDocumentStatus(status = "") {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDocumentDate(date) {
  if (!date) return "Not provided";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatFileSize(bytes) {
  if (!bytes || bytes < 0) return "Not provided";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getDocumentMatterName(matter) {
  if (!matter) return "No matter";

  if (matter.referenceNumber && matter.title) {
    return `${matter.referenceNumber} — ${matter.title}`;
  }

  return matter.title || matter.referenceNumber || "Unnamed matter";
}

export function getDocumentUploaderName(user) {
  if (!user) return "Unknown user";

  return (
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "Unknown user"
  );
}

export function getDocumentItems(response) {
  const payload = response?.data ?? response;

  return (
    payload?.documents ||
    payload?.items ||
    payload?.data ||
    (Array.isArray(payload) ? payload : [])
  );
}

export function getDocument(response) {
  return (
    response?.data?.document ??
    response?.document ??
    response?.data ??
    response ??
    null
  );
}

export function getDocumentStatusClass(status = "") {
  const classes = {
    UPLOADED: "bg-slate-100 text-slate-600",
    PROCESSING: "bg-amber-50 text-amber-700",
    READY: "bg-emerald-50 text-emerald-700",
    FAILED: "bg-red-50 text-red-700",
    ARCHIVED: "bg-slate-100 text-slate-500",
  };

  return classes[status] || "bg-slate-100 text-slate-600";
}

export function getDocumentTypeClass(type = "") {
  const classes = {
    PLEADING: "bg-blue-50 text-blue-700",
    MOTION: "bg-purple-50 text-purple-700",
    AFFIDAVIT: "bg-amber-50 text-amber-700",
    CONTRACT: "bg-emerald-50 text-emerald-700",
    AGREEMENT: "bg-emerald-50 text-emerald-700",
    JUDGMENT: "bg-slate-100 text-slate-700",
    COURT_ORDER: "bg-slate-100 text-slate-700",
    LEGAL_RESEARCH: "bg-indigo-50 text-indigo-700",
    INTERNAL_MEMO: "bg-slate-100 text-slate-600",
  };

  return classes[type] || "bg-slate-100 text-slate-600";
}