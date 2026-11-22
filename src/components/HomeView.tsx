import { useState } from "react";
import { ArrowRight, Feather, Linkedin, Mail } from "lucide-react";
import { motion } from "motion/react";
import {
  MESSAGE_TYPE_DETAILS,
  type HistoryItem,
  type MessageType,
  type Platform,
} from "../types";

interface HomeViewProps {
  onStartWriting: (platform: Platform, messageType?: MessageType) => void;
  recentHistory: HistoryItem[];
  onOpenHistory: () => void;
  onLoadHistoryItem: (item: HistoryItem) => void;
}

const HERO_IMAGE_PATH =
  "/src/assets/images/prowrite_hero_visual_1795347683209.jpg";

export function HomeView({
  onStartWriting,
  recentHistory,
  onOpenHistory,
  onLoadHistoryItem,
}: HomeViewProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Hero Split Card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-sky-50/40 to-blue-50/70 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(37,99,235,0.05)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <p className="text-xs font-medium text-blue-700 tracking-wide">
              Executive Career Outreach Workspace
            </p>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2rem] font-bold tracking-tight text-slate-900 leading-tight [text-wrap:balance]">
              Write clear, persuasive emails and LinkedIn notes in seconds.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Select your outreach goal, name your recipient, and drop in 2–3 key points. ProWrite AI composes structured Subject + Body emails or concise LinkedIn messages strictly under 300 characters.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onStartWriting("Email")}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-sky-600 transition-all duration-150 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Open Email Writer</span>
              </button>

              <button
                type="button"
                onClick={() => onStartWriting("LinkedIn")}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-sky-50/70 hover:border-blue-200 hover:text-blue-700 transition-all duration-150 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Linkedin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Open LinkedIn Writer</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-slate-200/70 bg-gradient-to-br from-sky-50 to-blue-100/60">
            {!imageFailed ? (
              <img
                src={HERO_IMAGE_PATH}
                alt="Minimalist frosted glass stationery and light-blue geometric waves on a white executive desk"
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-sky-50 via-white to-blue-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                  <Feather className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="mt-3 font-display text-sm font-semibold text-slate-800">
                  ProWrite AI Studio
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Structured Email &amp; LinkedIn Composition
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick-Start Templates */}
      <section aria-labelledby="templates-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2
              id="templates-heading"
              className="font-display text-lg font-semibold text-slate-900"
            >
              Outreach Scenarios
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Choose a message type to launch the writer immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {MESSAGE_TYPE_DETAILS.map((item, idx) => (
            <button
              key={item.type}
              type="button"
              onClick={() => onStartWriting("Email", item.type)}
              className="group text-left rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-150 hover:border-blue-300 hover:shadow-[0_6px_20px_rgba(37,99,235,0.07)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs tabular-nums text-blue-600 font-medium">
                    0{idx + 1}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-150"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-2 font-display text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {item.type}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Drafts Preview */}
      {recentHistory.length > 0 && (
        <section aria-labelledby="recent-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2
              id="recent-heading"
              className="font-display text-lg font-semibold text-slate-900"
            >
              Recent Drafts
            </h2>
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              View all history
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-200/70">
            {recentHistory.slice(0, 3).map((entry) => {
              const previewText =
                entry.output.platform === "Email"
                  ? entry.output.subject
                  : entry.output.message;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onLoadHistoryItem(entry)}
                  className="w-full text-left px-5 py-4 hover:bg-sky-50/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {previewText}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                      {entry.output.platform} · {entry.messageType} · To:{" "}
                      {entry.recipient}
                    </p>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
