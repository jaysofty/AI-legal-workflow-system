export const TOOL_ACCESS = {
  READ: "READ",
  WRITE: "WRITE",
  DESTRUCTIVE: "DESTRUCTIVE",
};

export const TOOL_PERMISSION = {
  getMatter: {
    access: TOOL_ACCESS.READ,

    allowedRoles: [
      "SUPER_ADMIN",
      "FIRM_ADMIN",
      "PRINCIPAL_PARTNER",
      "SENIOR_ASSOCIATE",
      "CORPORATE_ASSOCIATE",
      "IN_HOUSE_COUNSEL",
      "LITIGATION_CLERK",
      "CHAMBERS_PUPIL",
      "NYSC_INTERN",
    ],

    requiresApproval: false,
  },

  searchMatterDocuments: {
    access: TOOL_ACCESS.READ,

    allowedRoles: [
      "SUPER_ADMIN",
      "FIRM_ADMIN",
      "PRINCIPAL_PARTNER",
      "SENIOR_ASSOCIATE",
      "CORPORATE_ASSOCIATE",
      "IN_HOUSE_COUNSEL",
      "LITIGATION_CLERK",
      "CHAMBERS_PUPIL",
      "NYSC_INTERN",
    ],

    requiresApproval: false,
  },

  getMatterTimeline: {
    access: TOOL_ACCESS.READ,

    allowedRoles: [
      "SUPER_ADMIN",
      "FIRM_ADMIN",
      "PRINCIPAL_PARTNER",
      "SENIOR_ASSOCIATE",
      "CORPORATE_ASSOCIATE",
      "IN_HOUSE_COUNSEL",
      "LITIGATION_CLERK",
      "CHAMBERS_PUPIL",
      "NYSC_INTERN",
    ],

    requiresApproval: false,
  },

  createTask: {
    access: TOOL_ACCESS.WRITE,
    allowedRoles: [
      "SUPER_ADMIN",
      "FIRM_ADMIN",
      "PRINCIPAL_PARTNER",
      "SENIOR_ASSOCIATE",
      "CORPORATE_ASSOCIATE",
      "IN_HOUSE_COUNSEL",
      "LITIGATION_CLERK",
      "CHAMBERS_PUPIL",
      "NYSC_INTERN",
    ],
    requiresApproval: false,
  },

  generateDocument: {
    access: TOOL_ACCESS.WRITE,

    allowedRoles: [
      "SUPER_ADMIN",
      "FIRM_ADMIN",
      "PRINCIPAL_PARTNER",
      "SENIOR_ASSOCIATE",
      "CORPORATE_ASSOCIATE",
      "IN_HOUSE_COUNSEL",
      "LITIGATION_CLERK",
      "CHAMBERS_PUPIL",
      "NYSC_INTERN",
    ],

    requiresApproval: true,
  },
};
