import { useEffect, useRef } from "react";

import AgentError from "./AgentError.jsx";
import AgentResult from "./AgentResult.jsx";
import EmptyConversation from "./EmptyConversation.jsx";
import AgentActivity from "./AgentActivity.jsx";

function AgentConversation({
  messages,
  hasMatter,
  isPending,
  error,
  onSuggestionClick,
  activity,
  onReviewDraft,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages, isPending]);

  useEffect(() => {
    if (isPending) {
      return;
    }

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, isPending]);

  if (!messages.length && !isPending && !error) {
    return (
      <div className="flex min-h-full w-full items-center justify-center">
        <EmptyConversation
          hasMatter={hasMatter}
          onSuggestionClick={onSuggestionClick}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {messages.map((message) => {
        if (message.role === "USER") {
          return <UserMessage key={message.id} content={message.content} />;
        }

        if (!message.result?.response) {
          return null;
        }

        return (
          <div key={message.id} className="min-w-0">
            <AgentResult
              result={message.result}
              isStreaming={Boolean(message.isStreaming)}
              onReviewDraft={onReviewDraft}
            />
          </div>
        );
      })}

      {isPending && activity && <AgentActivity activity={activity} />}

      {error && <AgentError message={error} />}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-6 text-white sm:max-w-[75%]">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export default AgentConversation;
