import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  formatClientType,
  getClientName,
} from "../../utils/client.utils.js";

function ClientInfo({ client }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
            {getClientName(client)
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              {getClientName(client)}
            </h2>

            <p className="text-sm text-slate-500">
              {formatClientType(client.type)}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <InfoRow
          icon={<Mail size={16} />}
          label="Email"
          value={client.email}
        />

        <InfoRow
          icon={<Phone size={16} />}
          label="Phone"
          value={client.phone}
        />

        <InfoRow
          icon={<MapPin size={16} />}
          label="Address"
          value={client.address}
        />
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3 px-6 py-4">
      <span className="mt-0.5 text-slate-400">
        {icon}
      </span>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default ClientInfo;