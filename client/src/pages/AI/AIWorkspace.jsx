import { useMemo, useState } from "react";
import DraftReviewModal from "../../components/ai/DraftReviewModal.jsx";
import { useUpdateApproval } from "../../hooks/useApproval.js";
import { useMatters } from "../../hooks/useMatters.js";

import AIWorkspaceHeader from "../../components/ai/AIWorkspaceHeader.jsx";
import MatterContextPanel from "../../components/ai/MatterContextPanel.jsx";
import MatterAgentHeader from "../../components/ai/MatterAgentHeader.jsx";
import AgentConversation from "../../components/ai/AgentConversation.jsx";
import AgentComposer from "../../components/ai/AgentComposer.jsx";
import { streamMatterAgent } from "../../services/matter-agent.service.js";
import { getMatters } from "../../utils/ai.utils.js";

function AIWorkspace() {
  const [selectedMatterId, setSelectedMatterId] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [agentError, setAgentError] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);

  const updateApprovalMutation = useUpdateApproval();
  const [agentActivity, setAgentActivity] = useState(null);
  const mattersQuery = useMatters();

  const matters = getMatters(mattersQuery.data);

  const selectedMatter = useMemo(
    () => matters.find((matter) => matter.id === selectedMatterId) ?? null,
    [matters, selectedMatterId],
  );

  function handleMatterChange(matterId) {
    setSelectedMatterId(matterId);
    setMessages([]);
    setAgentError("");
    setMessage("");
    setSelectedDraft(null);
  }

  function handleSuggestionClick(suggestion) {
    setMessage(suggestion);
  }

  function handleStreamEvent(streamEvent, agentMessageId) {
    switch (streamEvent.type) {
      case "status": {
        setAgentActivity({
          status: streamEvent.status,
          toolName: null,
        });

        break;
      }

      case "tool_start": {
        setAgentActivity({
          status: "TOOL_RUNNING",
          toolName: streamEvent.toolName,
        });

        break;
      }

      case "tool_complete": {
        setAgentActivity({
          status: "TOOL_COMPLETED",
          toolName: streamEvent.toolName,
        });

        break;
      }

      case "content": {
        setMessages((current) =>
          current.map((item) => {
            if (item.id !== agentMessageId) {
              return item;
            }

            const response =
              (item.result?.response || "") + streamEvent.content;

            return {
              ...item,
              content: response,

              result: {
                ...item.result,
                response,
              },
            };
          }),
        );

        break;
      }

      case "done": {
        setMessages((current) =>
          current.map((item) => {
            if (item.id !== agentMessageId) {
              return item;
            }

            return {
              ...item,

              isStreaming: false,

              result: {
                ...item.result,
                executionId: streamEvent.executionId,
                action: streamEvent.action,
                tool: streamEvent.tool || null,
              },
            };
          }),
        );

        setAgentActivity({
          status: "COMPLETED",
          toolName: streamEvent.tool?.name || null,
        });

        break;
      }

      default:
        break;
    }
  }

  function handleReviewDraft(draft) {
    setSelectedDraft(draft);
  }

  async function handleDraftApproval(status, notes) {
    if (!selectedDraft?.approval?.id) {
      return;
    }

    try {
      const result = await updateApprovalMutation.mutateAsync({
        approvalId: selectedDraft.approval.id,
        status,
        notes,
      });

      setSelectedDraft((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          approval: {
            ...current.approval,
            ...result.approval,
          },

          generatedDocument: {
            ...current.generatedDocument,
            ...result.generatedDocument,
          },
        };
      });

      // Keep the approval status inside the
      // conversation message synchronized too.
      setMessages((currentMessages) =>
        currentMessages.map((message) => {
          const toolResult = message.result?.tool?.result;

          if (toolResult?.approval?.id !== selectedDraft.approval.id) {
            return message;
          }

          const nextResult = {
            ...message.result,

            tool: {
              ...message.result.tool,

              result: {
                ...toolResult,

                approval: {
                  ...toolResult.approval,
                  ...result.approval,
                },

                generatedDocument: {
                  ...toolResult.generatedDocument,
                  ...result.generatedDocument,
                },
              },
            },
          };

          return {
            ...message,
            result: nextResult,
          };
        }),
      );
    } catch (error) {
      setAgentError(error.message || "The draft review could not be saved.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const question = message.trim();

    if (!selectedMatterId || !question || isStreaming) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "USER",
      content: question,
    };

    const agentMessageId = crypto.randomUUID();

    const agentMessage = {
      id: agentMessageId,
      role: "AGENT",
      content: "",
      isStreaming: true,

      result: {
        response: "",
        action: null,
        tool: null,
        executionId: null,
      },
    };

    setMessages((current) => [...current, userMessage, agentMessage]);

    setMessage("");
    setAgentError("");
    setAgentActivity({
      status: "CONNECTING",
      toolName: null,
    });
    setIsStreaming(true);

    try {
      await streamMatterAgent({
        matterId: selectedMatterId,
        question,

        onEvent: (streamEvent) => {
          handleStreamEvent(streamEvent, agentMessageId);
        },
      });
    } catch (error) {
      setAgentError(
        error.message || "The Matter Agent could not complete the request.",
      );

      /*
       * Don't leave an empty assistant bubble when
       * streaming fails before any content arrives.
       */
      setMessages((current) =>
        current
          .map((item) => {
            if (item.id !== agentMessageId) {
              return item;
            }

            return {
              ...item,
              isStreaming: false,
            };
          })
          .filter(
            (item) => item.id !== agentMessageId || item.result?.response,
          ),
      );
    } finally {
      setIsStreaming(false);
      setAgentActivity(null);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col p-4 sm:p-6">
      <AIWorkspaceHeader />

      <div className="grid flex-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <MatterContextPanel
          matters={matters}
          selectedMatterId={selectedMatterId}
          selectedMatter={selectedMatter}
          onMatterChange={handleMatterChange}
          isLoading={mattersQuery.isLoading}
          error={
            mattersQuery.isError
              ? mattersQuery.error?.message || "Unable to load matters."
              : ""
          }
        />

        <main className="flex min-h-[650px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <MatterAgentHeader selectedMatter={selectedMatter} />

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <AgentConversation
              messages={messages}
              hasMatter={Boolean(selectedMatter)}
              isPending={isStreaming}
              error={agentError}
              activity={agentActivity}
              onSuggestionClick={handleSuggestionClick}
              onReviewDraft={handleReviewDraft}
            />
          </div>

          <AgentComposer
            message={message}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            disabled={!selectedMatter}
            isPending={isStreaming}
          />
        </main>
      </div>

      {selectedDraft && (
        <DraftReviewModal
          draft={selectedDraft.generatedDocument}
          approval={selectedDraft.approval}
          isSubmitting={updateApprovalMutation.isPending}
          onClose={() => {
            if (!updateApprovalMutation.isPending) {
              setSelectedDraft(null);
            }
          }}
          onApprove={(notes) => handleDraftApproval("APPROVED", notes)}
          onReject={(notes) => handleDraftApproval("REJECTED", notes)}
        />
      )}
    </section>
  );
}

export default AIWorkspace;
