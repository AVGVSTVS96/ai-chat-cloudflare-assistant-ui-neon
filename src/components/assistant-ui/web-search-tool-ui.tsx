"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type WebSearchArgs = {
  query?: string;
};

type WebSearchResult = {
  action?: {
    type: string;
    query: string;
  };
};

export const WebSearchToolUI = makeAssistantToolUI<
  WebSearchArgs,
  WebSearchResult
>({
  toolName: "web_search",
  render: function WebSearchRender({ result, status }) {
    const [isOpen, setIsOpen] = useState(false);

    if (status.type === "requires-action") return null;

    const isRunning = status.type === "running";
    const isComplete = status.type === "complete";
    const isError = status.type === "incomplete";

    const query = result?.action?.query || "web search";

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-3">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center gap-2 text-sm font-medium hover:bg-muted/50 p-3 rounded-lg border"
          >
            <Search
              className={`h-4 w-4 ${isRunning ? "animate-pulse text-orange-500" : "text-muted-foreground"}`}
            />
            <span className="flex-1 text-left">
              {isRunning && "Searching the web..."}
              {isComplete && `Searched for: ${query}`}
              {isError && "Search failed"}
            </span>
            {isComplete && (
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            )}
          </Button>
        </CollapsibleTrigger>

        {isRunning && (
          <div className="mt-2 space-y-2 px-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        )}

        {isError && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Search incomplete ({status.reason || "unknown"})
          </div>
        )}

        {isComplete && (
          <CollapsibleContent className="mt-2">
            <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">Query:</p>
              <p className="italic">"{query}"</p>
              <p className="mt-3 text-xs">
                Sources are cited inline in the response above.
              </p>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  },
});
