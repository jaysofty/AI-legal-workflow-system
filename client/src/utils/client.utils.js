export const CLIENT_TYPES = [
  "INDIVIDUAL",
  "COMPANY",
  "GOVERNMENT",
  "NGO",
  "OTHER",
];

export function formatClientType(type = "") {
  return type
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export function getClientName(client) {
  if (!client) {
    return "Unnamed client";
  }

  if (client.type === "COMPANY" && client.companyName) {
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

export function getClientInitial(client) {
  const name = getClientName(client);
  return name.charAt(0).toUpperCase();
}

export function formatClientDate(date) {
  if (!date) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getClientItems(response) {
  const payload = response?.data ?? response;

  return (
    payload?.clients ||
    payload?.items ||
    payload?.data ||
    (Array.isArray(payload) ? payload : [])
  );
}