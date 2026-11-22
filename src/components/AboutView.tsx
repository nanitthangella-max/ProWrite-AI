import { useState } from "react";
import { Feather, Linkedin, Mail, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import type { Platform } from "../types";

interface AboutViewProps {
  onOpenWriter: (platform: Platform) => void;
}

const ABOUT_IMAGE_PATH =
  "/src/assets/images/prowrite_hero_visual_1795347683209.jpg";

export function AboutView({ onOpenWriter }: AboutViewProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          About ProWrite AI
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-600 leading-relaxed">
          ProWrite AI helps job seekers, students, and professionals draft crisp, thoughtful outreach messages tailored to each recipient and platform.
        </p>
      </div>

      {/* Visual Overview Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="aspect-[16/7] w-full bg-gradient-to-br from-sky-50 to-blue-100 overflow-hidden">
          {!imageFailed ? (
            <img
              src={ABOUT_IMAGE_PATH}
              alt="ProWrite AI workspace stationery and light-blue architectural composition"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Feather className="h-8 w-8 text-blue-500" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-200/70">
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Structured Emails
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Produces a distinct Subject line and well-paced Email Body built around your 2–3 key talking points.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Linkedin className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              LinkedIn Precision
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automatically enforces LinkedIn&apos;s 300-character connection note ceiling so your outreach never gets truncated.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Private Local History
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your generated drafts are stored locally in your browser so you can revisit, copy, or refine them anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Scenarios List */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Five Purpose-Built Message Types
        </h2>
        <div className="divide-y divide-slate-100 text-sm">
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-semibold text-slate-900">Job Application</span>
            <span className="text-slate-600">
              Highlight measurable impact and clear alignment with the target role.
            </span>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-semibold text-slate-900">Referral Request</span>
            <span className="text-slate-600">
              Respectful, concise outreach making it effortless for contacts to refer you.
            </span>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-semibold text-slate-900">Interview Follow-up</span>
            <span className="text-slate-600">
              Polite check-in reinforcing enthusiasm and readiness for next steps.
            </span>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-semibold text-slate-900">Internship Request</span>
            <span className="text-slate-600">
              Showcase academic projects, skills, and availability cleanly.
            </span>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-semibold text-slate-900">Thank-you After Interview</span>
            <span className="text-slate-600">
              Appreciative note referencing specific takeaways from your conversation.
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onOpenWriter("Email")}
            className="h-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-sky-600 transition-all"
          >
            Start Writing Email
          </button>
          <button
            type="button"
            onClick={() => onOpenWriter("LinkedIn")}
            className="h-10 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:border-blue-200 hover:text-blue-700 transition-all"
          >
            Start Writing LinkedIn Note
          </button>
        </div>
      </section>
    </motion.div>
  );
}
