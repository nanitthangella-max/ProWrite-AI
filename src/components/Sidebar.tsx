import {
  Clock,
  Feather,
  Home,
  Info,
  Linkedin,
  Mail,
  X,
} from "lucide-react";
import type { NavView } from "../types";

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  historyCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: NavView;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "email-writer", label: "Email Writer", icon: Mail },
  { id: "linkedin-writer", label: "LinkedIn Message Writer", icon: Linkedin },
  { id: "history", label: "History", icon: Clock },
  { id: "about", label: "About", icon: Info },
];

export function Sidebar({
  activeView,
  onSelectView,
  historyCount,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const handleSelect = (view: NavView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col bg-gradient-to-b from-white via-white to-sky-50/60 border-r border-slate-200/80">
      {/* Brand header inside sidebar */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/70">
        <button
          type="button"
          onClick={() => handleSelect("home")}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg py-1"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-sm">
            <Feather className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            ProWrite AI
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation items */}
      <nav aria-label="Primary Navigation" className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.16)]"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === "history" && historyCount > 0 && (
                <span className="font-mono text-xs tabular-nums text-slate-400 shrink-0">
                  {historyCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Subtle footer tip */}
      <div className="p-4 border-t border-slate-200/70">
        <div className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50/70 border border-blue-100/80 p-3.5">
          <p className="text-xs font-semibold text-slate-800">
            Outreach Standards
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Emails generate structured Subject + Body. LinkedIn messages stay strictly under 300 characters.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {navContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
