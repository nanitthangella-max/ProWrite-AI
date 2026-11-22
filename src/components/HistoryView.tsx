import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import type { HistoryItem, Platform } from "../types";
import { copyToClipboard } from "../utils/clipboard";

interface HistoryViewProps {
  items: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onGoToWriter: () => void;
}

export function HistoryView({
  items,
  onLoadItem,
  onDeleteItem,
  onClearHistory,
  onGoToWriter,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"All" | Platform>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesPlatform =
      platformFilter === "All" || item.output.platform === platformFilter;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesPlatform;
    const bodyText =
      item.output.platform === "Email"
        ? `${item.output.subject} ${item.output.body}`
        : item.output.message;
    return (
      matchesPlatform &&
      (item.recipient.toLowerCase().includes(q) ||
        item.messageType.toLowerCase().includes(q) ||
        bodyText.toLowerCase().includes(q))
    );
  });

  const handleCopy = async (item: HistoryItem) => {
    const text =
      item.output.platform === "Email"
        ? `Subject: ${item.output.subject}\n\n${item.output.body}`
        : item.output.message;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Message History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review, copy, or reopen your previously generated emails and LinkedIn messages.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="self-start sm:self-auto h-9 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-blue-600">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-base font-semibold text-slate-900">
            No generated messages yet
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
            Every email or LinkedIn message you generate is saved here automatically for quick reuse.
          </p>
          <button
            type="button"
            onClick={onGoToWriter}
            className="mt-5 h-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-sky-600 transition-all"
          >
            <span>Create First Message</span>
          </button>
        </div>
      ) : (
        <>
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by recipient, topic, or message text..."
                aria-label="Search message history"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
              {(["All", "Email", "LinkedIn"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPlatformFilter(tab)}
                  className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    platformFilter === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No drafts match your current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPlatformFilter("All");
                }}
                className="mt-3 text-xs font-medium text-blue-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isEmail = item.output.platform === "Email";
                const charCount = isEmail
                  ? item.output.platform === "Email"
                    ? item.output.body.length
                    : 0
                  : item.output.platform === "LinkedIn"
                  ? item.output.message.length
                  : 0;

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:border-blue-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-blue-700">
                            {item.output.platform}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.messageType}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {charCount} chars
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {new Date(item.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-semibold text-slate-900">
                          {item.output.platform === "Email"
                            ? item.output.subject
                            : `LinkedIn note to ${item.recipient}`}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Recipient: {item.recipient}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(item)}
                          className="h-8 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:border-blue-200 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check
                                className="h-3.5 w-3.5 text-emerald-600"
                                aria-hidden="true"
                              />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onLoadItem(item)}
                          className="h-8 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:border-blue-200 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          aria-label="Delete draft"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {item.output.platform === "Email"
                        ? item.output.body
                        : item.output.message}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
