import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`nebula-markdown-container text-xs sm:text-[13px] leading-relaxed text-slate-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-white font-display mt-3 mb-2 pb-1 border-b border-white/10 flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-cyan-300 font-display mt-3 mb-1.5 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-purple-300 font-sans mt-2.5 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-pink-300 font-sans mt-2 mb-1">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="my-1.5 font-sans leading-relaxed text-slate-200 last:mb-0 first:mt-0">
              {children}
            </p>
          ),

          // Bold & Italics
          strong: ({ children }) => (
            <strong className="font-semibold text-white tracking-wide">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-cyan-200 italic font-sans">{children}</em>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="my-2 space-y-1 list-none pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1 list-decimal list-inside pl-1 marker:text-cyan-400 marker:font-mono">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-slate-200 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 mt-1.5 shrink-0" />
              <div className="flex-1">{children}</div>
            </li>
          ),

          // Clean GFM Tables
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/15 bg-black/40 shadow-xl scrollbar-thin scrollbar-thumb-white/15">
              <table className="w-full text-left border-collapse text-xs font-sans">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.07] border-b border-white/15 text-cyan-300 font-tech font-bold uppercase tracking-wider text-[11px]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/10">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.04] transition-colors duration-150">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold tracking-wider whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-slate-200 font-sans leading-snug align-middle">
              {children}
            </td>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 pl-3.5 py-1.5 border-l-2 border-cyan-400 bg-cyan-950/20 rounded-r-xl text-slate-300 italic text-xs">
              {children}
            </blockquote>
          ),

          // Code blocks & Inline Code
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-cyan-300 font-mono text-[11.5px] border border-white/10 mx-0.5"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="relative my-3 rounded-xl bg-[#09071c] border border-white/15 overflow-hidden shadow-xl group">
                <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.05] border-b border-white/10 text-[10px] font-tech text-slate-400 uppercase tracking-wider">
                  <span>{match ? match[1] : 'CODE'}</span>
                  <button
                    onClick={() => handleCopy(codeString, 0)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                    title="Copy code"
                  >
                    {copiedIndex === 0 ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[11.5px] font-mono text-emerald-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },

          // Horizontal rule
          hr: () => <hr className="border-white/10 my-3" />,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
