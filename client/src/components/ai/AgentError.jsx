function AgentError({ message }) {
  return (
    <div className="w-full">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">
          Matter Agent request failed
        </p>

        <p className="mt-1 text-sm text-red-600">{message}</p>
      </div>
    </div>
  );
}

export default AgentError;
