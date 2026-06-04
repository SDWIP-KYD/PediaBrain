"use client";

import { MarkdownContent } from "@/components/markdown-content";

export function DashboardMarkdown({ content }: { content: string }) {
  return <MarkdownContent content={content} className="prose-sm" />;
}
