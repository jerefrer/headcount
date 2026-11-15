import { Fragment, type ReactNode } from "react";

/**
 * Renders copy that uses two inline markers, without dangerouslySetInnerHTML:
 * `**bold**` becomes <strong>, and `{link}` is replaced by the `link` node.
 */
export function RichText({ text, link }: { text: string; link?: ReactNode }) {
  const parts = text.split(/(\{link\}|\*\*[^*]+\*\*)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "{link}") return <Fragment key={i}>{link}</Fragment>;
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
