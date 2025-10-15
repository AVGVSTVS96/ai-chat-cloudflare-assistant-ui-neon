"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { Search } from "lucide-react";

type WebSearchArgs = {
  query?: string;
};

type WebSearchResult = {
  sources?: Array<{
    url: string;
    title?: string;
    snippet?: string;
  }>;
};

export const WebSearchToolUI = makeAssistantToolUI<
  WebSearchArgs,
  WebSearchResult
>({
  toolName: "web_search",
  render: function WebSearchRender({ result, status }) {
    if (status.type === "requires-action") return null;

    const isRunning = status.type === "running";
    const isComplete = status.type === "complete";
    const isError = status.type === "incomplete";

    if (isRunning) {
      return (
        <div className="my-3 flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
          <Search className="h-4 w-4 animate-pulse text-blue-500" />
          <span className="text-sm text-muted-foreground">
            Searching the web...
          </span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="my-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Search incomplete ({status.reason || "unknown"})
        </div>
      );
    }

    if (isComplete) {
      return (
        <div className="my-3 flex items-center gap-2 rounded-lg border bg-card p-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Used web search
          </span>
        </div>
      );
    }

    return null;
  },
});
