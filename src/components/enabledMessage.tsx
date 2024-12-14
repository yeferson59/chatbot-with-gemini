import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/interfaces/message";

const MAX_PREVIEW_LENGTH = 300;

export const ExpandableMessage = ({ message }: { message: Message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = message.text.length > MAX_PREVIEW_LENGTH;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const renderContent = () => {
    const content =
      isExpanded || !shouldTruncate
        ? message.text
        : `${message.text.slice(0, MAX_PREVIEW_LENGTH)}...`;
    return (
      <ReactMarkdown
        className="prose dark:prose-invert prose-sm md:prose-base max-w-none break-words"
        remarkPlugins={[remarkGfm]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                language={match[1]}
                style={vscDarkPlus}
                PreTag="div"
                customStyle={{
                  margin: "1em 0",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <div className="overflow-auto">{children}</div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="relative">
      {renderContent()}
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpand}
          className="mt-2 flex items-center"
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
