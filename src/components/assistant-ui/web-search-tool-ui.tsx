"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useMemo } from "react";
import { Search, ChevronDown, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMessage } from "@assistant-ui/react";

type WebSearchArgs = {
  query?: string;
};

type WebSearchResult = {
  action?: {
    type: string;
    query: string;
  };
};

type Source = {
  url: string;
  title: string;
};

type SourceWithFallback = Source & {
  logoError?: boolean;
};

export const WebSearchToolUI = makeAssistantToolUI<
  WebSearchArgs,
  WebSearchResult
>({
  toolName: "web_search",
  render: function WebSearchRender({ result, status }) {
    const [isOpen, setIsOpen] = useState(false);
    const message = useMessage();

    if (status.type === "requires-action") return null;

    const isRunning = status.type === "running";
    const isComplete = status.type === "complete";
    const isError = status.type === "incomplete";

    const query = result?.action?.query || "web search";

    // Extract inline citations from message text
    const [sources, setSources] = useState<SourceWithFallback[]>([]);

    useMemo(() => {
      if (!isComplete || !message) {
        setSources([]);
        return;
      }
      
      // Get the text content from the message
      const textPart = message.content.find((part: any) => part.type === "text");
      if (!textPart?.text) {
        setSources([]);
        return;
      }

      // Parse markdown links: [title](url)
      const citationRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const foundSources: SourceWithFallback[] = [];
      const seenUrls = new Set<string>();
      
      let match;
      while ((match = citationRegex.exec(textPart.text)) !== null) {
        const title = match[1];
        const url = match[2];
        
        // Only include if it's a valid URL and not a duplicate
        if (url.startsWith('http') && !seenUrls.has(url)) {
          foundSources.push({ title, url, logoError: false });
          seenUrls.add(url);
        }
      }
      
      setSources(foundSources);
    }, [isComplete, message]);

    const sourceCount = sources.length;

    const handleLogoError = (index: number) => {
      setSources(prev => 
        prev.map((src, i) => i === index ? { ...src, logoError: true } : src)
      );
    };

    const getHostname = (url: string) => {
      try {
        const { hostname } = new URL(url);
        return hostname.replace(/^www\./, "");
      } catch {
        return url;
      }
    };

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
              {isComplete && `Used ${sourceCount} source${sourceCount !== 1 ? "s" : ""}`}
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
            <div className="grid gap-2 px-3">
              {sourceCount === 0 && (
                <div className="text-sm text-muted-foreground p-3">
                  No sources found
                </div>
              )}
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {source.logoError ? (
                          <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        ) : (
                          <img
                            src={`https://img.logo.dev/${getHostname(source.url)}?token=pk_X-HKkl47T3KOTFtOkPnKsQ`}
                            alt=""
                            className="h-4 w-4 flex-shrink-0 rounded"
                            onError={() => handleLogoError(index)}
                          />
                        )}
                        <span className="truncate text-sm font-medium group-hover:text-orange-500">
                          {source.title}
                        </span>
                      </div>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground group-hover:text-orange-500" />
                    </div>
                    <span className="text-xs text-muted-foreground block">
                      {getHostname(source.url)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  },
});
