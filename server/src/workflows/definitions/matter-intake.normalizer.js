export function normalizeMatterIntake(input) {
  return {
    client: {
      name: input.client.name.trim(),
      email: input.client.email?.trim().toLowerCase() || null,
      phone: input.client.phone?.trim() || null,
      address: input.client.address?.trim() || null,
    },

    matter: {
      title: input.matter.title.trim(),
      type: input.matter.type.trim().toUpperCase(),
      description: input.matter.description?.trim() || null,
      court: input.matter.court?.trim() || null,
      courtNumber: input.matter.courtNumber?.trim() || null,
    },

    intake: {
      source: input.intake.source?.trim() || null,
      summary: input.intake.summary.trim(),

      opposingParties: (input.intake.opposingParties ?? []).map(
        (party) => ({
          name: party.name.trim(),
        }),
      ),

      requestedServices: (
        input.intake.requestedServices ?? []
      ).map((service) => service.trim()),
    },
  };
}