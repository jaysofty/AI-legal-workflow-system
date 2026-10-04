
const EMPTY_FORM = {
  type: "INDIVIDUAL",
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};


export function getInitialClientForm(client) {
  if (!client) {
    return EMPTY_FORM;
  }

  return {
    type: client.type || "INDIVIDUAL",
    firstName: client.firstName || "",
    lastName: client.lastName || "",
    companyName: client.companyName || "",
    email: client.email || "",
    phone: client.phone || "",
    address: client.address || "",
    notes: client.notes || "",
  };
}


export function getInitialMatterForm(matter) {
  if (!matter) {
    return EMPTY_FORM;
  }

  return {
    title: matter.title || "",
    type: matter.type || "LITIGATION",
    jurisdiction: matter.jurisdiction || "",
    court: matter.court || "",
    courtNumber: matter.courtNumber || "",
    description: matter.description || "",
  };
}