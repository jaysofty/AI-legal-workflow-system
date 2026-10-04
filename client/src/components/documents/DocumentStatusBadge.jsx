import {
  formatDocumentStatus,
  getDocumentStatusClass,
} from "../../utils/document.utils.js";

function DocumentStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getDocumentStatusClass(
        status,
      )}`}
    >
      {formatDocumentStatus(status)}
    </span>
  );
}

export default DocumentStatusBadge;