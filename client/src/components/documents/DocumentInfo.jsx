import {
  CalendarDays,
  FileText,
  HardDrive,
  User,
} from "lucide-react";

import {
  formatDocumentDate,
  formatDocumentType,
  formatFileSize,
  getDocumentMatterName,
  getDocumentUploaderName,
} from "../../utils/document.utils.js";

import DocumentStatusBadge from "./DocumentStatusBadge.jsx";

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function DocumentInfo({ document }) {
  if (!document) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-slate-900">
              {document.name || "Unnamed document"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatDocumentType(document.type)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <InfoItem
          icon={<FileText size={16} />}
          label="Document type"
          value={formatDocumentType(document.type)}
        />

        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText size={16} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>

            <div className="mt-1">
              <DocumentStatusBadge status={document.status} />
            </div>
          </div>
        </div>

        <InfoItem
          icon={<FileText size={16} />}
          label="Matter"
          value={getDocumentMatterName(document.matter)}
        />

        <InfoItem
          icon={<User size={16} />}
          label="Uploaded by"
          value={getDocumentUploaderName(document.uploadedBy)}
        />

        <InfoItem
          icon={<HardDrive size={16} />}
          label="File size"
          value={formatFileSize(document.fileSize)}
        />

        <InfoItem
          icon={<FileText size={16} />}
          label="File type"
          value={document.mimeType}
        />

        <InfoItem
          icon={<CalendarDays size={16} />}
          label="Uploaded"
          value={formatDocumentDate(document.createdAt)}
        />

        <InfoItem
          icon={<CalendarDays size={16} />}
          label="Last updated"
          value={formatDocumentDate(document.updatedAt)}
        />
      </div>
    </section>
  );
}

export default DocumentInfo;