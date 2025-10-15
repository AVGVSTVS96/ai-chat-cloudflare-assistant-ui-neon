import { stackServerApp } from "@/lib/stack/server";
import { getUserName } from "@/lib/stack/utils";
import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const { messages, tools } = (await req.json()) as any;

  const result = streamText({
    model: openai.responses("gpt-4o"),
    messages: convertToModelMessages(messages),
    system: `You are a helpful assistant. You are currently talking to ${getUserName(user)}. When you use web search, always summarize the findings in your response.`,
    tools: {
      ...frontendTools(tools),
      web_search: openai.tools.webSearch({}),
    },
    maxSteps: 5,
  });

  return result.toUIMessageStreamResponse();
}
