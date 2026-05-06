"use client";

import Link from "next/link";
import { useState } from "react";
import type React from "react";

function renderInline(text: string) {
  const nodes: React.ReactNode[] = [];
  const pattern = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(
        <code className="rounded-[6px] bg-blue-50 px-1.5 py-0.5 font-mono text-[0.92em] font-bold text-blue-700" key={`${token}-${match.index}`}>
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <Link className="font-bold text-primary underline-offset-4 hover:underline" href={linkMatch[2]} key={`${token}-${match.index}`}>
            {linkMatch[1]}
          </Link>
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let inCode = false;

  function flushList(key: string) {
    if (listItems.length === 0) return;
    blocks.push(
      <ul className="my-4 space-y-2 pl-5 text-sm leading-7 text-slate-700" key={key}>
        {listItems.map((item) => (
          <li className="list-disc" key={item}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  function flushCode(key: string) {
    if (codeLines.length === 0) return;
    const code = codeLines.join("\n");
    blocks.push(
      <CopyableCodeBlock code={code} key={key} />
    );
    codeLines = [];
  }

  function isTableSeparator(line: string) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  }

  function splitTableRow(line: string) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  }

  function collectTable(startIndex: number) {
    const rows: string[][] = [];
    let index = startIndex;
    while (index < lines.length && lines[index].trim().includes("|") && lines[index].trim()) {
      if (!isTableSeparator(lines[index])) rows.push(splitTableRow(lines[index]));
      index += 1;
    }
    return { rows, nextIndex: index };
  }

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        inCode = false;
        flushCode(`code-${index}`);
      } else {
        flushList(`list-before-code-${index}`);
        inCode = true;
      }
      index += 1;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      index += 1;
      continue;
    }

    if (!trimmed) {
      flushList(`list-${index}`);
      index += 1;
      continue;
    }

    if (trimmed.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      flushList(`list-before-table-${index}`);
      const { rows, nextIndex } = collectTable(index);
      const [header, ...body] = rows;
      if (header) {
        blocks.push(
          <div className="my-4 overflow-x-auto rounded-[10px] border border-borderSoft" key={`table-${index}`}>
            <table className="min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  {header.map((cell) => <th className="border-b border-borderSoft bg-slate-50 px-3 py-2 text-left font-black text-ink" key={cell}>{renderInline(cell)}</th>)}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr className="odd:bg-white even:bg-slate-50/70" key={`${row.join("|")}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => <td className="border-b border-borderSoft px-3 py-2 text-slate-700" key={`${cell}-${cellIndex}`}>{renderInline(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      index = nextIndex;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList(`list-before-h1-${index}`);
      blocks.push(<h1 className="mb-4 mt-1 text-3xl font-black leading-tight text-ink" key={index}>{renderInline(trimmed.slice(2))}</h1>);
      index += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList(`list-before-h2-${index}`);
      blocks.push(<h2 className="mb-3 mt-7 text-xl font-black text-ink" key={index}>{renderInline(trimmed.slice(3))}</h2>);
      index += 1;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      index += 1;
      continue;
    }

    flushList(`list-before-p-${index}`);
    blocks.push(<p className="my-3 text-sm leading-7 text-slate-700" key={index}>{renderInline(trimmed)}</p>);
    index += 1;
  }

  flushList("list-end");
  flushCode("code-end");

  return <article className="markdown-preview">{blocks}</article>;
}

function CopyableCodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-code border border-slate-700/40 bg-code">
      <button
        className="absolute right-3 top-3 z-10 rounded-[8px] border border-white/10 bg-white/10 px-2.5 py-1.5 text-xs font-black text-slate-100 opacity-90 transition hover:bg-white/18 hover:text-white"
        type="button"
        onClick={copyCode}
      >
        {copied ? "已复制" : "复制"}
      </button>
      <pre className="overflow-x-auto px-4 py-4 pr-20 text-sm leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
