import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Eraser,
  Linkedin,
  Loader2,
  Mail,
  RefreshCw,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import {
  MESSAGE_TYPE_DETAILS,
  MESSAGE_TYPES,
  type GeneratedOutput,
  type MessageType,
  type Platform,
} from "../types";
import { copyToClipboard } from "../utils/clipboard";

interface WriterViewProps {
  messageType: MessageType;
  recipient: string;
  keyPoints: string;
  platform: Platform;
  output: GeneratedOutput | null;
  isLoading: boolean;
  error: string | null;
  onChangeMessageType: (value: MessageType) => void;
  onChangeRecipient: (value: string) => void;
  onChangeKeyPoints: (value: string) => void;
  onChangePlatform: (value: Platform) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  onClear: () => void;
}

export function WriterView({
  messageType,
  recipient,
  keyPoints,
  platform,
  output,
  isLoading,
  error,
  onChangeMessageType,
  onChangeRecipient,
  onChangeKeyPoints,
  onChangePlatform,
  onGenerate,
  onRegenerate,
  onClear,
}: WriterViewProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<"full" | "subject" | null>(
    null
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || recipient.trim().length < 2) {
      setValidationError("Please enter who this message is for.");
      return;
    }
    if (!keyPoints.trim() || keyPoints.trim().length < 5) {
      setValidationError("Please enter 2–3 key points to include.");
      return;
    }
    setValidationError(null);
    onGenerate();
  };

  const handleFillSampleInputs = () => {
    const template = MESSAGE_TYPE_DETAILS.find((t) => t.type === messageType);
    if (!template) return;
    onChangeRecipient(template.sampleRecipient);
    onChangeKeyPoints(template.samplePoints);
    setValidationError(null);
  };

  const handleCopyFull = async () => {
    if (!output) return;
    const textToCopy =
      output.platform === "Email"
        ? `Subject: ${output.subject}\n\n${output.body}`
        : output.message;
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedTarget("full");
      setTimeout(() => setCopiedTarget(null), 2000);
    }
  };

  const handleCopySubject = async () => {
    if (!output || output.platform !== "Email") return;
    const ok = await copyToClipboard(output.subject);
    if (ok) {
      setCopiedTarget("subject");
      setTimeout(() => setCopiedTarget(null), 2000);
    }
  };

  const handleClearAll = () => {
    setValidationError(null);
    setCopiedTarget(null);
    onClear();
  };

  const wordCount = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Workspace Page Intro */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            {platform === "Email"
              ? "Professional Email Writer"
              : "LinkedIn Message Writer"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {platform === "Email"
              ? "Generates a structured Subject line and Email Body tailored to your recipient."
              : "Generates a crisp, high-response LinkedIn message strictly under 300 characters."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillSampleInputs}
          className="self-start sm:self-auto text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors whitespace-nowrap shrink-0 py-1"
        >
          Fill example inputs
        </button>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="xl:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(37,99,235,0.04)] space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Message Details
            </h2>
            <span className="text-xs text-slate-500">All fields required</span>
          </div>

          {/* 1. Message Type Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="message-type"
              className="block text-sm font-medium text-slate-800"
            >
              Message Type
            </label>
            <select
              id="message-type"
              value={messageType}
              onChange={(e) =>
                onChangeMessageType(e.target.value as MessageType)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {MESSAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Who is it for? */}
          <div className="space-y-1.5">
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-slate-800"
            >
              Who is it for?
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => {
                onChangeRecipient(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g., Sarah Chen, Senior Engineering Manager at Stripe"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 3. Key Points */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="key-points"
                className="block text-sm font-medium text-slate-800"
              >
                Key Points
              </label>
              <span className="text-xs text-slate-400">2–3 points</span>
            </div>
            <textarea
              id="key-points"
              rows={4}
              value={keyPoints}
              onChange={(e) => {
                onChangeKeyPoints(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Enter 2–3 key points (e.g., 4+ years React & Python experience; led checkout latency reduction by 38%; excited about your developer platform team)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y min-h-[112px]"
            />
          </div>

          {/* 4. Platform Selection */}
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-slate-800">
              Platform Selection
            </span>
            <div
              role="radiogroup"
              aria-label="Platform Selection"
              className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100/90 p-1"
            >
              <button
                type="button"
                role="radio"
                aria-checked={platform === "Email"}
                onClick={() => onChangePlatform("Email")}
                className={`h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  platform === "Email"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Email</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={platform === "LinkedIn"}
                onClick={() => onChangePlatform("LinkedIn")}
                className={`h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  platform === "LinkedIn"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Linkedin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>LinkedIn</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {platform === "LinkedIn"
                ? "LinkedIn messages are formatted strictly under 300 characters."
                : "Emails generate a separate Subject line and formatted Body."}
            </p>
          </div>

          {/* Client Validation Alert */}
          {validationError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-800"
            >
              <AlertCircle
                className="h-4 w-4 shrink-0 mt-0.5 text-amber-600"
                aria-hidden="true"
              />
              <span>{validationError}</span>
            </div>
          )}

          {/* 5. Generate Message Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-sky-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin shrink-0"
                  aria-hidden="true"
                />
                <span>Generating Message...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Generate Message</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Output Section */}
        <section
          aria-label="Generated Message Output"
          className="xl:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(37,99,235,0.04)] flex flex-col min-h-[420px]"
        >
          {/* Output Header & Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Generated Output
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {output
                  ? output.platform === "Email"
                    ? `${output.platform} · ${wordCount(output.body)} words · ${output.body.length} chars`
                    : `${output.platform} · ${output.message.length} / 300 chars`
                  : `Ready for ${platform} output`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFull}
                disabled={!output || isLoading}
                className="h-9 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:border-blue-200 hover:text-blue-700 disabled:opacity-45 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {copiedTarget === "full" ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onRegenerate}
                disabled={isLoading || (!output && (!recipient.trim() || !keyPoints.trim()))}
                className="h-9 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:border-blue-200 hover:text-blue-700 disabled:opacity-45 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                  aria-hidden="true"
                />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                disabled={isLoading || (!output && !recipient && !keyPoints)}
                className="h-9 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-45 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Eraser className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Output Content Area */}
          <div className="flex-1 pt-5 flex flex-col">
            {isLoading ? (
              <div
                aria-busy="true"
                aria-live="polite"
                className="flex-1 flex flex-col justify-between space-y-5 py-2"
              >
                <div className="flex items-center gap-2.5 text-sm font-medium text-blue-700">
                  <Loader2
                    className="h-4 w-4 animate-spin shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    Drafting your {messageType.toLowerCase()} for {platform}...
                  </span>
                </div>

                {platform === "Email" ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="h-3 w-20 rounded skeleton-shimmer" />
                      <div className="h-10 w-full rounded-xl skeleton-shimmer" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-3 w-24 rounded skeleton-shimmer" />
                      <div className="h-4 w-11/12 rounded skeleton-shimmer" />
                      <div className="h-4 w-full rounded skeleton-shimmer" />
                      <div className="h-4 w-10/12 rounded skeleton-shimmer" />
                      <div className="h-4 w-9/12 rounded skeleton-shimmer" />
                      <div className="h-4 w-4/12 rounded skeleton-shimmer" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-3 w-32 rounded skeleton-shimmer" />
                    <div className="h-28 w-full rounded-xl skeleton-shimmer" />
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  Connecting to AI composition service...
                </p>
              </div>
            ) : error ? (
              <div
                role="alert"
                className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-red-50/60 border border-red-200/80"
              >
                <AlertCircle
                  className="h-8 w-8 text-red-500"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-display text-sm font-semibold text-red-900">
                  Unable to generate message
                </h3>
                <p className="mt-1 text-sm text-red-700 max-w-md">{error}</p>
                <button
                  type="button"
                  onClick={onGenerate}
                  className="mt-4 h-9 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : output ? (
              output.platform === "Email" ? (
                <div className="space-y-5">
                  {/* Email Subject Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold tracking-wide text-slate-500">
                        Subject
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySubject}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {copiedTarget === "subject" ? (
                          <>
                            <Check className="h-3 w-3" aria-hidden="true" />
                            <span>Subject copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" aria-hidden="true" />
                            <span>Copy subject</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-900 select-all">
                      {output.subject}
                    </div>
                  </div>

                  {/* Email Body Section */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-semibold tracking-wide text-slate-500">
                      Email Body
                    </span>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-4 text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                      {output.body}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* LinkedIn Message Section */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold tracking-wide text-slate-500">
                      LinkedIn Message
                    </span>
                    <span
                      className={`font-mono text-xs tabular-nums font-medium ${
                        output.message.length < 300
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {output.message.length} / 300 chars
                    </span>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-sky-50/60 to-white px-5 py-5 text-base leading-relaxed text-slate-900 whitespace-pre-line">
                    {output.message}
                  </div>

                  {/* Subtle progress bar showing character usage */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((output.message.length / 300) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Within LinkedIn&apos;s 300-character connection note limit.
                    </p>
                  </div>
                </div>
              )
            ) : (
              /* Clean Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 rounded-xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50/60 to-sky-50/30">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {platform === "Email" ? (
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Linkedin className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <h3 className="mt-3.5 font-display text-sm font-semibold text-slate-900">
                  Your generated {platform === "Email" ? "email" : "LinkedIn note"} will appear here
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                  {platform === "Email"
                    ? "Fill in the recipient and 2–3 key points on the left, then click Generate Message to craft a Subject and Email Body."
                    : "Fill in the recipient and 2–3 key points on the left, then click Generate Message for a concise note under 300 characters."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
