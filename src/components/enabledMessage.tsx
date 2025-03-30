"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/interfaces/message";

// Create a custom code block component instead of using SyntaxHighlighter
const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-primary/10 hover:bg-primary/20"
          onClick={() => copyToClipboard(code)}
          aria-label={copied ? "Código copiado" : "Copiar código"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <div className="text-xs text-muted-foreground px-4 py-1 border-b border-border">
        {language}
      </div>
      <pre className="p-4 overflow-auto text-sm font-mono bg-muted rounded-b-md">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const MAX_PREVIEW_LENGTH = 300;

interface ExpandableMessageProps {
  message: Message;
  className?: string;
}

export const ExpandableMessage = ({
  message,
  className,
}: ExpandableMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = message.text.length > MAX_PREVIEW_LENGTH;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const content =
    isExpanded || !shouldTruncate
      ? message.text
      : `${message.text.slice(0, MAX_PREVIEW_LENGTH)}...`;

  return (
    <div className={cn("relative", className)}>
      <div className="prose dark:prose-invert prose-sm md:prose-base max-w-none break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const code = String(children).replace(/\n$/, "");

              // Check if this is a code block (not inline code)
              if (match) {
                return <CodeBlock language={match[1]} code={code} />;
              }

              return (
                <code
                  className="bg-muted rounded px-1 py-0.5 text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre({ children }) {
              return (
                <div className="overflow-auto rounded-md border border-border my-4">
                  {children}
                </div>
              );
            },
            p({ children }) {
              return <p className="my-4 leading-7">{children}</p>;
            },
            a({ href, children }) {
              return (
                <a
                  href={href}
                  className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            },
            ul({ children }) {
              return (
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
              );
            },
            ol({ children }) {
              return (
                <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
                  {children}
                </ol>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-border pl-4 italic my-4">
                  {children}
                </blockquote>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpand}
          className="mt-2 flex items-center text-muted-foreground hover:text-foreground"
          aria-expanded={isExpanded}
          aria-controls="expandable-content"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Ver más
            </>
          )}
        </Button>
      )}
    </div>
  );
};
