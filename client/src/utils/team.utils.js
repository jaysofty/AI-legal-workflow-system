export const TEAM_ROLES = [
  "SUPER_ADMIN",
  "FIRM_ADMIN",
  "PRINCIPAL_PARTNER",
  "SENIOR_ASSOCIATE",
  "CORPORATE_ASSOCIATE",
  "IN_HOUSE_COUNSEL",
  "LITIGATION_CLERK",
  "CHAMBERS_PUPIL",
  "NYSC_INTERN",
];

export const TEAM_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "INVITED",
];

const roleLabels = {
  SUPER_ADMIN: "Super Admin",
  FIRM_ADMIN: "Firm Admin",
  PRINCIPAL_PARTNER: "Principal Partner",
  SENIOR_ASSOCIATE: "Senior Associate",
  CORPORATE_ASSOCIATE: "Corporate Associate",
  IN_HOUSE_COUNSEL: "In-house Counsel",
  LITIGATION_CLERK: "Litigation Clerk",
  CHAMBERS_PUPIL: "Chambers Pupil",
  NYSC_INTERN: "NYSC Intern",
};

export function formatRole(role = "") {
  return (
    roleLabels[role] ||
    role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    ) ||
    "Member"
  );
}

export function getTeamMemberName(user) {
  if (!user) {
    return "Unknown member";
  }

  return (
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "Unknown member"
  );
}

export function getTeamMemberInitials(firstName, lastName) {
  return (
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() ||
    "U"
  );
}

export function formatTeamStatus(status = "") {
  return (
    status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    ) || "Unknown"
  );
}

export function getTeamStatusClass(status) {
  const statusClasses = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    SUSPENDED: "bg-red-50 text-red-700",
    INVITED: "bg-amber-50 text-amber-700",
  };

  return statusClasses[status] || "bg-slate-100 text-slate-600";
}

export function getTeamItems(response) {
  const payload = response?.data ?? response;

  return (
    payload?.users ||
    payload?.items ||
    (Array.isArray(payload) ? payload : [])
  );
}