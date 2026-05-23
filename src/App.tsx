import { useState, useEffect } from "react";
import LessonsTab from "./components/LessonsTab";
import ChordsTab from "./components/ChordsTab";
import TunerTab from "./components/TunerTab";
import MetronomeTab from "./components/MetronomeTab";
import AIChatTab from "./components/AIChatTab";
import SongsTab from "./components/SongsTab";
import AdminTab from "./components/AdminTab";
import LoginScreen from "./components/LoginScreen";
import { UserSession } from "./types";
import { BookOpen, Disc, Volume2, Sparkles, Activity, Music, HelpCircle, Star, ListMusic, LogOut, User, ShieldCheck } from "lucide-react";

type TabId = "lessons" | "chords" | "songs" | "tuner" | "metronome" | "aichat" | "admin";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("lessons");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check local storage or default to dark theme for that comfortable, cozy studio look
    const stored = localStorage.getItem("guitar_studio_dark_mode");
    return stored ? stored === "true" : true; // Default dark because it looks spectacular like a recording studio
  });

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("guitar_studio_user_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("guitar_studio_dark_mode", String(isDarkMode));
  }, [isDarkMode]);

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    localStorage.setItem("guitar_studio_user_session", JSON.stringify(session));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("guitar_studio_user_session");
  };

  // If no user session, show the beautifully themed login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} isDarkMode={isDarkMode} />;
  }


  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode 
        ? "bg-stone-950 text-stone-100" 
        : "bg-slate-50 text-slate-800"
    } font-sans pb-16`}>
      
      {/* Top Main Navigation Header */}
      <header className="border-b border-amber-900/10 dark:border-stone-850 bg-white dark:bg-stone-900 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo / Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white shadow-md rotate-2">
              <span className="text-xl font-bold font-mono">🎸</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-stone-50 leading-none">
                Aprenda Violão do Zero
              </h1>
              <p className="text-[10px] text-amber-700 dark:text-amber-500 font-bold tracking-widest uppercase mt-0.5">
                Método Prático Interativo
              </p>
            </div>
          </div>

          {/* Quick info badges or dark mode switcher */}
          <div className="flex items-center gap-3">
            {/* User Session Profile details */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-850 rounded-2xl">
              <div id="user-avatar" className="w-7 h-7 rounded-full bg-amber-800 text-stone-100 flex items-center justify-center text-xs font-bold font-mono">
                {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden md:block text-left text-xs">
                <span className="font-bold text-slate-805 dark:text-stone-200 block max-w-[120px] truncate">
                  {currentUser?.username}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-stone-500 block leading-none font-mono">
                  {currentUser?.email === "convidado@violao.com" ? "Convidado" : "Aluno Ativo"}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                id="logout-btn"
                title="Sair da Conta"
                className="ml-1 p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition duration-150"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              id="theme-toggler"
              className="p-2 rounded-xl border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-950 hover:bg-slate-100 dark:hover:bg-stone-850 text-xs font-semibold tracking-wider transition-all"
            >
              {isDarkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-mono text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-full border border-amber-200/50">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping shrink-0" />
              <span>Estúdio Online</span>
            </div>
          </div>

        </div>
      </header>

      {/* Hero Header with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Dynamic Studio Intro Welcome Card */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 rounded-3xl p-6 md:p-8 text-stone-100 shadow-lg mb-8 relative overflow-hidden">
          {/* Design element: subtle vector guitar neck glow */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block select-none font-sans text-9xl font-black text-amber-100 text-right pr-8 leading-none">
            ♩♪♫
          </div>

          <div className="max-w-2xl relative z-10 text-left">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedo nas cordas do jeito certo</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Sua jornada de violão começa aqui
            </h2>
            
            <p className="text-sm text-amber-100/90 mt-2 leading-relaxed">
              Desenvolva agilidade nos acordes, domine batidas de ritmos populares, afine de ouvido usando o painel acústico e tire dúvidas em tempo real com o tutor de inteligência artificial.
            </p>
          </div>
        </div>

        {/* Custom Segmented Tabs Selector Control Grid */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-stone-850 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("lessons")}
            id="tab-btn-lessons"
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs transition duration-150 border ${
              activeTab === "lessons"
                ? "bg-amber-900 border-amber-900 text-stone-50 shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-650 dark:text-stone-300 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. Lições Básicas
          </button>

          <button
            onClick={() => setActiveTab("chords")}
            id="tab-btn-chords"
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs transition duration-150 border ${
              activeTab === "chords"
                ? "bg-amber-900 border-amber-900 text-stone-50 shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-650 dark:text-stone-300 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
            }`}
          >
            <Music className="w-4 h-4" />
            2. Dic. de Acordes
          </button>

          <button
            onClick={() => setActiveTab("songs")}
            id="tab-btn-songs"
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs transition duration-150 border ${
              activeTab === "songs"
                ? "bg-amber-900 border-amber-900 text-stone-50 shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-650 dark:text-stone-300 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
            }`}
          >
            <ListMusic className="w-4 h-4" />
            3. Repertório Prático
          </button>

          <button
            onClick={() => setActiveTab("tuner")}
            id="tab-btn-tuner"
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs transition duration-150 border ${
              activeTab === "tuner"
                ? "bg-amber-900 border-amber-900 text-stone-50 shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-650 dark:text-stone-300 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            4. Afinador Ouvido
          </button>

          <button
            onClick={() => setActiveTab("metronome")}
            id="tab-btn-metronome"
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs transition duration-150 border ${
              activeTab === "metronome"
                ? "bg-amber-900 border-amber-900 text-stone-50 shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-650 dark:text-stone-300 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
            }`}
          >
            <Activity className="w-4 h-4" />
            5. Metrônomo Ritmo
          </button>

          <button
            onClick={() => setActiveTab("aichat")}
            id="tab-btn-aichat"
            className={`flex items-center gap-2 py-3 px-5 rounded-xl font-bold text-xs transition duration-150 border ${
              activeTab === "aichat"
                ? "bg-slate-900 dark:bg-amber-500 hover:bg-stone-800 border-stone-900 dark:border-amber-400 text-stone-50 dark:text-slate-950 shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-650 dark:text-stone-300 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Mestre IA Tutor (Dúvidas)
          </button>

          {currentUser && currentUser.email === "arturguilhermechecchi@gmail.com" && (
            <button
              onClick={() => setActiveTab("admin")}
              id="tab-btn-admin"
              className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs transition duration-150 border ${
                activeTab === "admin"
                  ? "bg-red-700 border-red-700 text-stone-50 shadow-sm"
                  : "bg-white dark:bg-stone-900 hover:bg-slate-50 dark:hover:bg-stone-800 text-red-650 dark:text-red-400 border-red-300/30 dark:border-red-950/40"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-500" />
              Painel Admin (SQLite)
            </button>
          )}
        </div>

        {/* Tab view containers */}
        <main className="transition-all duration-300">
          {activeTab === "lessons" && <LessonsTab currentUser={currentUser} />}
          {activeTab === "chords" && <ChordsTab />}
          {activeTab === "songs" && <SongsTab currentUser={currentUser} />}
          {activeTab === "tuner" && <TunerTab />}
          {activeTab === "metronome" && <MetronomeTab />}
          {activeTab === "aichat" && <AIChatTab currentUser={currentUser} />}
          {activeTab === "admin" && currentUser && currentUser.email === "arturguilhermechecchi@gmail.com" && (
            <AdminTab currentUser={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
}
