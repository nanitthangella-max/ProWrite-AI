import { Menu, PenSquare } from "lucide-react";
import type { NavView } from "../types";

interface HeaderProps {
  activeView: NavView;
  onOpenMobileMenu: () => void;
  onQuickCompose: () => void;
}

const VIEW_LABELS: Record<NavView, string> = {
  home: "Home",
  "email-writer": "Email Writer",
  "linkedin-writer": "LinkedIn Message Writer",
  history: "History",
  about: "About",
};

export function Header({
  activeView,
  onOpenMobileMenu,
  onQuickCompose,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile menu toggle + ProWrite AI title & contextual view */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            ProWrite AI
          </span>
          <span className="text-slate-300 select-none shrink-0" aria-hidden="true">
            /
          </span>
          <span className="text-sm font-medium text-slate-600 truncate">
            {VIEW_LABELS[activeView]}
          </span>
        </div>
      </div>

      {/* Right: Single crisp primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onQuickCompose}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-sky-600 active:scale-[0.99] transition-all duration-150 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <PenSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>New Message</span>
        </button>
      </div>
    </header>
  );
}
