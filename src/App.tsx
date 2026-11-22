import { useEffect, useState } from "react";
import { AboutView } from "./components/AboutView";
import { Header } from "./components/Header";
import { HistoryView } from "./components/HistoryView";
import { HomeView } from "./components/HomeView";
import { Sidebar } from "./components/Sidebar";
import { WriterView } from "./components/WriterView";
import { generateMessage } from "./services/api";
import type {
  GeneratedOutput,
  HistoryItem,
  MessageType,
  NavView,
  Platform,
} from "./types";

const HISTORY_STORAGE_KEY = "prowrite_ai_history_v1";

function loadInitialHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<NavView>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Writer form & output state
  const [messageType, setMessageType] = useState<MessageType>("Job Application");
  const [recipient, setRecipient] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [platform, setPlatform] = useState<Platform>("Email");
  const [output, setOutput] = useState<GeneratedOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variationCount, setVariationCount] = useState(0);

  // Persisted history
  const [history, setHistory] = useState<HistoryItem[]>(loadInitialHistory);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const handleSelectNavView = (view: NavView) => {
    setActiveView(view);
    if (view === "email-writer") {
      setPlatform("Email");
      if (output && output.platform !== "Email") {
        setOutput(null);
      }
    } else if (view === "linkedin-writer") {
      setPlatform("LinkedIn");
      if (output && output.platform !== "LinkedIn") {
        setOutput(null);
      }
    }
  };

  const handlePlatformSwitch = (nextPlatform: Platform) => {
    setPlatform(nextPlatform);
    setActiveView(
      nextPlatform === "Email" ? "email-writer" : "linkedin-writer"
    );
    if (output && output.platform !== nextPlatform) {
      setOutput(null);
    }
  };

  const handleStartWriting = (
    targetPlatform: Platform,
    presetType?: MessageType
  ) => {
    if (presetType) {
      setMessageType(presetType);
    }
    setPlatform(targetPlatform);
    setError(null);
    if (output && output.platform !== targetPlatform) {
      setOutput(null);
    }
    setActiveView(
      targetPlatform === "Email" ? "email-writer" : "linkedin-writer"
    );
  };

  const runGeneration = async (nextVariation: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMessage({
        messageType,
        recipient: recipient.trim(),
        keyPoints: keyPoints.trim(),
        platform,
        variation: nextVariation,
      });
      setOutput(result);

      const newEntry: HistoryItem = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        messageType,
        recipient: recipient.trim(),
        keyPoints: keyPoints.trim(),
        output: result,
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, 50));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating your message."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    setVariationCount(0);
    runGeneration(0);
  };

  const handleRegenerate = () => {
    const next = variationCount + 1;
    setVariationCount(next);
    runGeneration(next);
  };

  const handleClear = () => {
    setRecipient("");
    setKeyPoints("");
    setOutput(null);
    setError(null);
    setVariationCount(0);
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setMessageType(item.messageType);
    setRecipient(item.recipient);
    setKeyPoints(item.keyPoints);
    setPlatform(item.output.platform);
    setOutput(item.output);
    setError(null);
    setActiveView(
      item.output.platform === "Email" ? "email-writer" : "linkedin-writer"
    );
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleQuickCompose = () => {
    setError(null);
    if (activeView === "linkedin-writer") {
      handleClear();
    } else {
      setPlatform("Email");
      setActiveView("email-writer");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-sky-50/70 text-slate-900">
      <Sidebar
        activeView={activeView}
        onSelectView={handleSelectNavView}
        historyCount={history.length}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeView={activeView}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickCompose={handleQuickCompose}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto">
          {activeView === "home" && (
            <HomeView
              onStartWriting={handleStartWriting}
              recentHistory={history}
              onOpenHistory={() => setActiveView("history")}
              onLoadHistoryItem={handleLoadHistoryItem}
            />
          )}

          {(activeView === "email-writer" ||
            activeView === "linkedin-writer") && (
            <WriterView
              messageType={messageType}
              recipient={recipient}
              keyPoints={keyPoints}
              platform={platform}
              output={output}
              isLoading={isLoading}
              error={error}
              onChangeMessageType={setMessageType}
              onChangeRecipient={setRecipient}
              onChangeKeyPoints={setKeyPoints}
              onChangePlatform={handlePlatformSwitch}
              onGenerate={handleGenerate}
              onRegenerate={handleRegenerate}
              onClear={handleClear}
            />
          )}

          {activeView === "history" && (
            <HistoryView
              items={history}
              onLoadItem={handleLoadHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              onGoToWriter={() => handleStartWriting("Email")}
            />
          )}

          {activeView === "about" && (
            <AboutView onOpenWriter={(p) => handleStartWriting(p)} />
          )}
        </main>
      </div>
    </div>
  );
}
