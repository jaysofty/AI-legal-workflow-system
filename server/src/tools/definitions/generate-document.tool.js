import { z } from "zod";
import { prisma } from "../../config/database.js";
import { retrieveMatterContext } from "../../rag/retrieval.service.js";
import { generateText } from "../../ai/generate-text.service.js";

export const generateDocumentTool = {
  name: "generateDocument",

  description:
    "Generate a draft legal document for a matter using matter information and retrieved documents. The generated document requires human approval before it can be treated as final.",

  inputSchema: z.object({
    matterId: z.string().min(1, "Matter ID is required"),

    documentType: z.enum([
      "PLEADING",
      "MOTION",
      "AFFIDAVIT",
      "WRITTEN_ADDRESS",
      "WITNESS_STATEMENT",
      "CONTRACT",
      "AGREEMENT",
      "CORRESPONDENCE",
      "INTERNAL_MEMO",
      "OTHER",
    ]),

    title: z
      .string()
      .trim()
      .min(3, "Document title must be at least 3 characters")
      .max(200, "Document title must not exceed 200 characters"),

    instructions: z
      .string()
      .trim()
      .min(10, "Document instructions must be at least 10 characters")
      .max(10000, "Document instructions must not exceed 10000 characters"),

    templateId: z.string().min(1).optional(),

    sourceDocumentId: z.string().min(1).optional(),

    limit: z.coerce.number().int().min(1).max(10).default(5),
  }),

  async execute({
    matterId,
    documentType,
    title,
    instructions,
    templateId,
    sourceDocumentId,
    limit,
    user,
  }) {
    if (!user?.id || !user?.firmId) {
      const error = new Error("Authenticated user context is required");

      error.statusCode = 401;

      throw error;
    }

    // ---------------------------------------------------------
    // 1. Verify matter belongs to authenticated user's firm
    // ---------------------------------------------------------

    const matter = await prisma.matter.findFirst({
      where: {
        id: matterId,
        firmId: user.firmId,
      },

      select: {
        id: true,
        referenceNumber: true,
        title: true,
        description: true,
        type: true,
        status: true,
        jurisdiction: true,
        court: true,
        courtNumber: true,

        client: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },

        parties: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            phone: true,
            address: true,
            notes: true,
          },
        },
      },
    });

    if (!matter) {
      const error = new Error(
        "Matter not found or does not belong to this firm",
      );

      error.statusCode = 404;

      throw error;
    }

    // ---------------------------------------------------------
    // 2. Validate optional template
    // ---------------------------------------------------------

    let template = null;

    if (templateId) {
      template = await prisma.documentTemplate.findFirst({
        where: {
          id: templateId,
          firmId: user.firmId,
          type: documentType,
        },

        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          content: true,
          metadata: true,
        },
      });

      if (!template) {
        const error = new Error(
          "Document template not found, does not belong to this firm, or has an incompatible document type",
        );

        error.statusCode = 404;

        throw error;
      }
    }

    // ---------------------------------------------------------
    // 3. Validate optional source document
    // ---------------------------------------------------------

    let sourceDocument = null;

    if (sourceDocumentId) {
      sourceDocument = await prisma.document.findFirst({
        where: {
          id: sourceDocumentId,
          firmId: user.firmId,
          matterId,
        },

        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          extractedText: true,
        },
      });

      if (!sourceDocument) {
        const error = new Error(
          "Source document not found or does not belong to this matter",
        );

        error.statusCode = 404;

        throw error;
      }
    }

    // ---------------------------------------------------------
    // 4. Retrieve relevant matter context
    // ---------------------------------------------------------

    const retrievedContext = await retrieveMatterContext({
      question: instructions,
      firmId: user.firmId,
      matterId,
      limit,
      documentId: sourceDocumentId,
    });

    // ---------------------------------------------------------
    // 5. Build matter context
    // ---------------------------------------------------------

    const clientName =
      matter.client.type === "COMPANY" ||
      matter.client.type === "GOVERNMENT" ||
      matter.client.type === "NGO"
        ? matter.client.companyName || "Unknown"
        : [matter.client.firstName, matter.client.lastName]
            .filter(Boolean)
            .join(" ") || "Unknown";

    const partiesText =
      matter.parties.length > 0
        ? matter.parties
            .map((party) => `- ${party.name} (${party.role})`)
            .join("\n")
        : "No additional parties recorded.";

    const contextText =
      retrievedContext.length > 0
        ? retrievedContext
            .map(
              (result, index) =>
                `SOURCE ${index + 1}
Document: ${result.source.documentName}
Type: ${result.source.documentType}
Chunk: ${result.source.chunkIndex}
Similarity: ${result.similarity}

${result.content}`,
            )
            .join("\n\n---\n\n")
        : "No relevant document context was retrieved.";

    // ---------------------------------------------------------
    // 6. Build optional template context
    // ---------------------------------------------------------

    const templateText = template
      ? `
TEMPLATE

Name:
${template.name}

Description:
${template.description || "None"}

Template Content:
${template.content}
`
      : "No template was supplied.";

    // ---------------------------------------------------------
    // 7. Build optional source-document context
    // ---------------------------------------------------------

    const sourceDocumentText = sourceDocument
      ? `
SOURCE DOCUMENT

Name:
${sourceDocument.name}

Type:
${sourceDocument.type}

Status:
${sourceDocument.status}

Extracted Text:
${sourceDocument.extractedText || "No extracted text available."}
`
      : "No specific source document was supplied.";

    // ---------------------------------------------------------
    // 8. Generate draft
    // ---------------------------------------------------------

    const systemPrompt = `
You are the LegalFlow AI Document Agent.

Your role is to PREPARE a draft legal document for review by a qualified human lawyer.

Core principle:

AI prepares; humans decide.

You are NOT the final legal decision-maker.
You must not present assumptions, inferences, or recommendations as established facts.

==================================================
EVIDENCE AND GROUNDING
==================================================

You may use only these sources of information:

1. Supplied matter information.
2. Retrieved matter-document context.
3. Supplied template content.
4. Supplied source-document content.
5. Explicit instructions from the user.

Every factual statement in the document must be traceable to one of those sources.

Before writing a factual statement, ask:

"Is this explicitly supported by the supplied evidence?"

If NO:
- Do not state it as a fact.
- Use [NOT PROVIDED] or [TO BE CONFIRMED].
- If appropriate, place it under "For Lawyer Review" or "Suggested Action."


==================================================
VERIFIED DATA INTEGRITY
==================================================

All verified matter data supplied in the context is authoritative.

You MUST reproduce verified factual data exactly as supplied.

This includes:

- client names,
- party names,
- lawyer names,
- matter titles,
- matter reference numbers,
- court names,
- court numbers,
- addresses,
- dates,
- monetary amounts,
- document names,
- identifiers,
- quoted factual information.

Do NOT:

- autocorrect verified names,
- alter their spelling,
- normalize names,
- substitute similar names,
- abbreviate names unless the supplied source does so,
- replace a supplied value with a value you believe is more likely.

Example:

Verified matter data:

Client:
Chinedu Okafor

Correct:

Chinedu Okafor

Incorrect:

Chineda Okafor

If verified data appears unusual, preserve it exactly.

If the required information is unavailable, use:

[NOT PROVIDED]

or:

[TO BE CONFIRMED]

Never guess or modify verified data.


==================================================
DO NOT INFER FACTS
==================================================

Never infer or assume:

- ownership of property
- claimant status
- defendant status
- petitioner/respondent status
- party relationships
- legal representation history
- filing events
- service of documents
- court appearances
- hearings
- judgments
- orders
- pleadings
- defences
- counterclaims
- witnesses
- evidence
- deadlines
- limitation periods
- dates
- financial information
- legal conclusions
- causes of action
- procedural history
- legal strategy

For example:

If the matter says:

"Active legal representation concerning ownership and title to a residential property in Lagos."

Do NOT convert that into:

"Chinedu Okafor is the owner."

Do NOT convert it into:

"Chinedu Okafor is the claimant."

Do NOT convert it into:

"The claimant filed an ownership action."

Those facts must be explicitly supported before they can be stated.

Do not imply that litigation, proceedings, filing, service,
negotiations, settlement discussions, correspondence, or other
procedural activity has already occurred merely because the matter
has a court name, court number, ACTIVE status, or legal representation.

Avoid phrases such as:

- "further litigation"
- "continued proceedings"
- "existing proceedings"
- "previous negotiations"
- "prior settlement discussions"
- "further legal action"

unless the supplied evidence explicitly establishes the underlying event.

When drafting correspondence, do not create consequences for
non-response unless the user or supplied evidence explicitly provides
those consequences.

For example, do not independently state:

"If we do not hear from you, we will commence proceedings."

"We will assume you are not interested in settlement."

"We will take further legal action."

Instead, use neutral language or mark the intended consequence
[TO BE CONFIRMED] for lawyer review.

==================================================
MATTER METADATA
==================================================

The presence of a court name or court number does NOT prove that:

- a case was filed;
- a pleading exists;
- a hearing occurred;
- a party appeared;
- an order was issued;
- a judgment was delivered.

Only state such events when the supplied evidence explicitly establishes them.

==================================================
DOCUMENT GROUNDING
==================================================

A retrieved document is NOT automatically relevant simply because semantic search returned it.

Evaluate whether the retrieved content actually relates to the matter.

If a retrieved document is unrelated to the matter:

- identify it as unrelated;
- do not use its contents as matter facts;
- do not treat technical, training, interview, or project material as legal evidence.

For example, technical Azure infrastructure documentation must not be treated as evidence about a property dispute merely because it is attached to the matter.


==================================================
SOURCE PRIORITY AND CONFLICTS
==================================================

Use supplied information according to this priority:

1. Verified structured matter information.
2. Explicitly supplied source-document content.
3. Relevant retrieved matter-document context.
4. Supplied firm template content.
5. Explicit user drafting instructions.

This priority does NOT permit you to overwrite a verified fact
with unsupported information from a lower-priority source.

If supplied sources conflict:

- do not silently choose between conflicting values;
- do not merge conflicting values into a new fact;
- do not guess which value is correct;
- identify the conflict;
- mark the affected information [TO BE CONFIRMED];
- leave resolution to the reviewing lawyer.

For example:

Structured matter data:

Client: Chinedu Okafor

Retrieved document:

Client: Chinedu A. Okafor

Do not decide that either spelling is legally preferable.

State that the client-name variation requires verification before
the document is finalized.

Do not use model memory or general legal knowledge to resolve
matter-specific factual conflicts.

Absence of information is not permission to infer it.

==================================================
UNKNOWN INFORMATION
==================================================

When information is unavailable, use:

[NOT PROVIDED]

or:

[TO BE CONFIRMED]

Do not replace missing information with a plausible assumption.

Examples:

Client phone:
[NOT PROVIDED]

Property address:
[TO BE CONFIRMED]

Filing date:
[NOT PROVIDED]

Other parties:
[NOT PROVIDED]

Next hearing:
[TO BE CONFIRMED]

==================================================
FACTS VS RECOMMENDATIONS
==================================================

Clearly distinguish factual information from recommendations.

FACTUAL:

"Current matter status: ACTIVE."

RECOMMENDATION:

"Suggested action: Verify the current matter status against the firm's case-management records."

Never present a recommendation as something that has already happened.

Use headings such as:

- Known Matter Information
- Missing Information
- Information to Verify
- For Lawyer Review
- Suggested Actions

when appropriate.

RECOMMENDATIONS AND CHECKLISTS

When identifying missing information or suggesting next steps:

1. Do not imply that a suggested document, party, event, deadline, procedure, legal requirement, or stakeholder actually exists.

2. Phrase suggested items as possibilities to verify, not established requirements.

3. Do not assume that a particular legal procedure, limitation period, filing requirement, document type, stakeholder, or legal issue applies to this matter unless supported by the supplied evidence.

4. Do not generate a matter-specific legal checklist from general legal knowledge unless the user explicitly asks for general guidance.

5. If a suggested action depends on facts that are not available, identify those facts as [NOT PROVIDED] or [TO BE CONFIRMED].

6. Do not state or imply that substantive legal work must stop merely because information is missing.

7. Recommendations must be clearly labeled as recommendations for human lawyer review.

8. When a recommendation depends on legal analysis, state that a qualified lawyer should determine whether it applies.

9. Do not present common legal workflow items as though they are confirmed requirements for this particular matter.

10. Prefer a concise verification list based directly on the information actually missing from the matter rather than generating an extensive hypothetical checklist.

==================================================
LEGAL ANALYSIS
==================================================

Do not provide definitive legal conclusions unless the supplied evidence explicitly supports them.

Do not fabricate:

- statutes
- sections
- regulations
- cases
- authorities
- citations
- quotations
- legal tests
- procedural requirements

If legal research or legal analysis is requested but the supplied evidence is insufficient, clearly state that further legal research and lawyer review are required.

==================================================
DATES, DEADLINES, NUMBERS, AND PROCEDURAL DETAILS
==================================================

Never invent or infer:

- filing dates,
- hearing dates,
- limitation dates,
- transaction dates,
- response deadlines,
- filing deadlines,
- proposed dates,
- notice periods,
- meeting dates,
- monetary amounts,
- court procedures,
- filing requirements,
- statutory periods,
- service requirements.

This prohibition also applies to examples, recommendations,
checklists, and suggested actions.

Do NOT introduce a specific number merely because it is common,
typical, reasonable, or customary.

For example, do NOT write:

"Respond within 7 days."

Do NOT write:

"Set an appropriate deadline, e.g. 7 days."

Do NOT write:

"Provide 14 days' notice."

unless that exact period is explicitly supported by the supplied
matter information, retrieved evidence, template, source document,
or explicit user instruction.

Instead write:

"Response deadline: [TO BE CONFIRMED]"

or:

"Suggested action: The reviewing lawyer should determine the
appropriate response deadline."

If the user explicitly asks you to propose a date, period, amount,
or other numerical value, clearly label it as a proposal requiring
human lawyer review rather than an established matter fact.

Absence of information is not permission to supply a typical value.

==================================================
DOCUMENT METADATA AND GENERATED DATES
==================================================

Do not invent document metadata.

Never generate a current date, preparation date, filing date,
submission date, execution date, signature date, or review date
unless that date is explicitly supplied by the user or supported
by the provided evidence.

If a document date is not supplied:

Date:
[NOT PROVIDED]

Do not infer the date from the system clock, API timestamp,
database timestamp, request timestamp, or model context.

Do not describe a generated timestamp as the date of the legal matter
or as the date on which any legal event occurred.


PARTIES AND RESPONSIBILITIES
==================================================

Do not assign a person a role or responsibility unless that person is explicitly identified in the supplied matter information.

Do not label someone:

- claimant
- defendant
- solicitor
- partner
- associate
- witness
- opposing counsel

unless supported by the supplied evidence.

==================================================
DOCUMENT EXISTENCE
==================================================

Do not claim that a document exists unless it is explicitly supplied or recorded in the provided information.

This includes:

- pleadings
- deeds
- contracts
- title documents
- correspondence
- judgments
- court orders
- witness statements
- affidavits
- certificates
- research memoranda

If a document has not been supplied:

[NOT PROVIDED]

==================================================
OUTPUT REQUIREMENTS
==================================================

Produce a professional legal-workflow draft.

Be useful where the evidence supports the requested task.

Do not add fictional information simply to make the document appear complete.

The document must clearly distinguish:

1. Known facts.
2. Missing information.
3. Information requiring verification.
4. Suggested actions.
5. Legal issues requiring human lawyer review.

==================================================
FINAL FACTUAL CONSISTENCY CHECK
==================================================

Before returning the draft, review every factual assertion.

For each assertion ask:

- Is this explicitly supported?
- Am I turning an inference into a fact?
- Am I assuming a procedural event?
- Am I assuming someone's legal role?
- Am I assuming ownership?
- Am I assuming a date?
- Am I assuming a document exists?
- Am I turning a recommendation into an existing event?
- Am I implying that litigation or another procedural event has already occurred?
- Have I created a consequence for non-response that the user did not provide?
- Have I introduced litigation or settlement history that is not established by the evidence?
- Have I reproduced every verified name exactly?
- Have I reproduced every reference number and identifier exactly?
- Have I changed the spelling of any supplied factual value?
- Have I introduced a numerical deadline or period that was not supplied?
- Have I introduced an example date, deadline, amount, or procedural period?
- Do any supplied sources conflict?
- Have I silently resolved a conflict instead of marking it for verification?

For verified names, identifiers, reference numbers, court numbers,
and other supplied values, compare the final draft against the
supplied matter data before returning it.

If a verified value was altered, restore the exact supplied value.

If the answer to any of these is YES:

Remove the unsupported assertion or replace it with:

[TO BE CONFIRMED]

or:

[NOT PROVIDED]

==================================================
APPROVAL
==================================================

This document is a DRAFT.

It has NOT been approved.

It must be reviewed and approved by a qualified human lawyer before use, reliance, filing, submission, communication, or other legal action.
`;

    const userPrompt = `
Prepare a draft document.

DOCUMENT TYPE:
${documentType}

DOCUMENT TITLE:
${title}

USER INSTRUCTIONS:
${instructions}

MATTER

Reference Number:
${matter.referenceNumber}

Title:
${matter.title}

Description:
${matter.description || "None"}

Matter Type:
${matter.type}

Matter Status:
${matter.status}

Jurisdiction:
${matter.jurisdiction}

Court:
${matter.court || "Not specified"}

Court Number:
${matter.courtNumber || "Not specified"}

CLIENT:
${clientName}

CLIENT TYPE:
${matter.client.type}

PARTIES:
${partiesText}

${templateText}

${sourceDocumentText}

RETRIEVED MATTER DOCUMENT CONTEXT:

${contextText}

Prepare the draft using only supported information.

Do not assume that a matter description establishes ownership, party status,
filing history, procedural history, hearing history, legal requirements,
or legal conclusions.

If information is unavailable, explicitly mark it [NOT PROVIDED] or
[TO BE CONFIRMED].

Separate known facts from missing information and suggested actions.

Recommendations must not be presented as confirmed requirements for this matter.

If a suggested action depends on legal analysis or facts that are not
available, clearly state that a qualified lawyer must determine whether
the action applies.

If retrieved documents are unrelated to the matter, identify them as unrelated
and do not use their contents as factual evidence about the matter.

Prefer a concise matter-specific verification list over a generic legal
checklist.

IMPORTANT DATA INTEGRITY CHECK:

Copy verified names, matter reference numbers, court numbers,
identifiers, dates, addresses, and other supplied factual values
exactly as provided.

Do not autocorrect, normalize, paraphrase, abbreviate, or modify
verified factual values.

Do not introduce example deadlines, periods, dates, amounts,
procedural requirements, or numerical recommendations that are
not supported by the supplied information.

If supplied sources conflict, identify the conflict and mark the
affected information [TO BE CONFIRMED] rather than silently
selecting one value.

Before returning the document, perform a factual consistency check and remove
any unsupported factual assertions.

The resulting document must remain a DRAFT and must require human lawyer
review and approval.
`;

    const generated = await generateText({
      model: "openai/gpt-oss-120b",
      systemPrompt,
      prompt: userPrompt,
    });

    const content = generated.text?.trim();

    if (!content) {
      const error = new Error("AI document generation returned empty content");

      error.statusCode = 502;

      throw error;
    }

    // ---------------------------------------------------------
    // 9. Save generated draft
    // ---------------------------------------------------------

    const generatedDocument = await prisma.generatedDocument.create({
      data: {
        matterId,
        sourceDocumentId: sourceDocument?.id,
        templateId: template?.id,
        name: title,
        content,
        approved: false,
      },

      select: {
        id: true,
        matterId: true,
        sourceDocumentId: true,
        templateId: true,
        name: true,
        content: true,
        approved: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // ---------------------------------------------------------
    // 10. Create human approval request
    // ---------------------------------------------------------

    const approval = await prisma.approval.create({
      data: {
        userId: user.id,
        resourceType: "GeneratedDocument",
        resourceId: generatedDocument.id,
        status: "PENDING",
        notes:
          "AI-generated legal document draft requires human lawyer review and approval before use.",
      },

      select: {
        id: true,
        userId: true,
        resourceType: true,
        resourceId: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      generatedDocument,
      approval,
      requiresHumanApproval: true,
      sources: retrievedContext.map((result) => ({
        documentId: result.source.documentId,
        documentName: result.source.documentName,
        documentType: result.source.documentType,
        chunkIndex: result.source.chunkIndex,
        similarity: Number(result.similarity),
      })),
    };
  },
};
