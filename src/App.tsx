import { useState, useEffect, useRef } from "react";
import LessonsTab from "./components/LessonsTab";
import ChordsTab from "./components/ChordsTab";
import TunerTab from "./components/TunerTab";
import MetronomeTab from "./components/MetronomeTab";
import AIChatTab from "./components/AIChatTab";
import SongsTab from "./components/SongsTab";
import AdminTab from "./components/AdminTab";
import LoginScreen from "./components/LoginScreen";
import { UserSession } from "./types";
import { BookOpen, Disc, Volume2, Sparkles, Activity, Music, HelpCircle, Star, ListMusic, LogOut, User, ShieldCheck, Pocket, AudioWaveform, Sliders, Check, Settings2, RefreshCw } from "lucide-react";
import { updateAudioConfig, playGuitarChord } from "./components/AcousticAudio";

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

  // Audio configuration settings backed by SQLite
  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(80);
  const [guitarType, setGuitarType] = useState<string>("acoustic_steel");
  const [metronomeFrequency, setMetronomeFrequency] = useState<number>(1000);
  const [strumSpeed, setStrumSpeed] = useState<string>("strum");
  const [isSavingAudio, setIsSavingAudio] = useState<boolean>(false);
  const [saveAudioSuccess, setSaveAudioSuccess] = useState<boolean>(false);

  // Fetch Audio settings from SQLite database
  useEffect(() => {
    if (!currentUser?.email) return;

    fetch(`/api/audio-settings?email=${encodeURIComponent(currentUser.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setMasterVolume(s.master_volume);
          setGuitarType(s.guitar_type);
          setMetronomeFrequency(s.metronome_frequency);
          setStrumSpeed(s.strum_speed);

          // Configure standard Web Audio module
          updateAudioConfig({
            masterVolume: s.master_volume / 100,
            guitarType: s.guitar_type,
            metronomeFrequency: s.metronome_frequency,
            strumSpeed: s.strum_speed
          });
        }
      })
      .catch((err) => console.error("Erro ao sincronizar configurações de áudio:", err));
  }, [currentUser?.email]);

  // Synchronize actual playing synthesizer in real-time when user drags knobs
  useEffect(() => {
    updateAudioConfig({
      masterVolume: masterVolume / 100,
      guitarType: guitarType,
      metronomeFrequency: metronomeFrequency,
      strumSpeed: strumSpeed
    });
  }, [masterVolume, guitarType, metronomeFrequency, strumSpeed]);

  // Keep latest configuration in a ref to avoid stale closure issues in unload events
  const audioSettingsRef = useRef({
    email: currentUser?.email,
    masterVolume,
    guitarType,
    metronomeFrequency,
    strumSpeed
  });

  useEffect(() => {
    audioSettingsRef.current = {
      email: currentUser?.email,
      masterVolume,
      guitarType,
      metronomeFrequency,
      strumSpeed
    };
  }, [currentUser?.email, masterVolume, guitarType, metronomeFrequency, strumSpeed]);

  // Automatic saving on page exit or visibility hidden (tab change / browser minimized)
  useEffect(() => {
    const saveOnExit = () => {
      const config = audioSettingsRef.current;
      if (!config.email) return;

      const bodyData = JSON.stringify({
        email: config.email,
        masterVolume: config.masterVolume,
        guitarType: config.guitarType,
        metronomeFrequency: config.metronomeFrequency,
        strumSpeed: config.strumSpeed
      });

      // Fetch with keepalive: true holds the connection open even after document context has been destroyed
      try {
        fetch("/api/audio-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: bodyData,
          keepalive: true
        });
      } catch (e) {
        console.error("Erro no salvamento automático ao sair:", e);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveOnExit();
      }
    };

    window.addEventListener("beforeunload", saveOnExit);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", saveOnExit);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleSaveAudioSettings = async () => {
    if (!currentUser?.email) return;
    setIsSavingAudio(true);
    setSaveAudioSuccess(false);

    try {
      const res = await fetch("/api/audio-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          masterVolume,
          guitarType,
          metronomeFrequency,
          strumSpeed
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveAudioSuccess(true);
        setTimeout(() => setSaveAudioSuccess(false), 2500);
      }
    } catch (e) {
      console.error("Erro ao salvar áudio no SQLite:", e);
    } finally {
      setIsSavingAudio(false);
    }
  };

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
                <span className="font-bold text-slate-900 dark:text-stone-200 block max-w-[140px] truncate">
                  {currentUser?.username}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-stone-500 block leading-none font-mono mt-0.5">
                  {currentUser?.email === "convidado@violao.com" ? "Convidado" : "Aluno Ativo"} • <strong className="text-amber-700 dark:text-amber-500 font-bold">{currentUser?.guitarLevel || "Iniciante"}</strong>
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
              onClick={() => setIsAudioPanelOpen(!isAudioPanelOpen)}
              id="audio-studio-toggler"
              className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold tracking-tight text-xs transition duration-150 ${
                isAudioPanelOpen
                  ? "bg-amber-700 hover:bg-amber-600 border-amber-600 text-white shadow-sm font-black"
                  : "border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-950 hover:bg-slate-100 dark:hover:bg-stone-850 text-slate-700 dark:text-stone-300"
              }`}
            >
              <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" />
              Estúdio de Som
            </button>

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

      {/* Audio Panel Console Container (Backed by SQLite) */}
      {isAudioPanelOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-stone-900 border-2 border-stone-850 rounded-3xl p-6 text-stone-100 shadow-2xl relative overflow-hidden">
            {/* Wooden Side Accents for Retro Studio Vibe */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-800" />
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-amber-800" />
            
            <div className="pl-2 pr-2">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-800 pb-4 mb-5 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-950/60 border border-amber-900/50 rounded-xl">
                    <AudioWaveform className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-extrabold text-sm tracking-wide uppercase text-amber-400">
                      Estúdio de Timbre & Áudio (SQLite)
                    </h3>
                    <p className="text-[10px] text-stone-400 font-mono flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Controle os osciladores, filtros passa-baixas e a velocidade.</span>
                      <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-900/50 font-bold uppercase tracking-wider animate-pulse">
                        ● Salvamento Automático Ativo ao Sair
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playGuitarChord(["x", 3, 2, 0, 1, 0], "strum")}
                    className="px-3.5 py-1.5 bg-amber-800/80 hover:bg-amber-700 border border-amber-700 rounded-xl text-[11px] font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Music className="w-3.5 h-3.5" /> Testar Acorde C
                  </button>
                  <button
                    onClick={handleSaveAudioSettings}
                    disabled={isSavingAudio}
                    className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      saveAudioSuccess
                        ? "bg-emerald-600 border border-emerald-500 text-white"
                        : "bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-55"
                    }`}
                  >
                    {isSavingAudio ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : saveAudioSuccess ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Settings2 className="w-3.5 h-3.5" />
                    )}
                    {saveAudioSuccess ? "Salvo no SQLite!" : "Salvar no Banco"}
                  </button>
                </div>
              </div>

              {/* Console Sliders & Knobs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* 1. Instrument Selection */}
                <div className="bg-stone-950/60 border border-stone-850 p-4 rounded-2xl">
                  <span className="text-[10px] font-mono text-stone-500 uppercase font-black block mb-2.5">
                    🎸 Tipo de Violão / Timbre
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { id: "acoustic_steel", name: "Aço Acústico (Padrão)", desc: "Brilhante e encorpado" },
                      { id: "classic_nylon", name: "Nylon Clássico", desc: "Suave, aveludado e macio" },
                      { id: "electric_jazz", name: "Jazz Hollowbody", desc: "Médios quentes de jazz" },
                      { id: "electric_overdrive", name: "Distorção Overdrive", desc: "Bite de rock agressivo" }
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer border text-xs transition duration-150 ${
                          guitarType === item.id
                            ? "bg-amber-950/40 border-amber-500/60 text-amber-300"
                            : "bg-transparent border-transparent text-stone-400 hover:bg-stone-900/50"
                        }`}
                        onClick={() => setGuitarType(item.id)}
                      >
                        <div className="text-left">
                          <p className="font-extrabold text-[11px] leading-tight">{item.name}</p>
                          <p className="text-[9px] text-stone-500 leading-none mt-0.5">{item.desc}</p>
                        </div>
                        <input
                          type="radio"
                          name="guitarType"
                          checked={guitarType === item.id}
                          onChange={() => {}}
                          className="sr-only"
                        />
                        {guitarType === item.id && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Master Volume */}
                <div className="bg-stone-950/60 border border-stone-850 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-black block mb-2.5">
                      🎛️ Volume Geral (Master)
                    </span>
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-amber-500 shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={masterVolume}
                        onChange={(e) => setMasterVolume(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold shrink-0 w-8 text-right text-amber-400">
                        {masterVolume}%
                      </span>
                    </div>
                    <p className="text-[9px] text-stone-500 mt-2 leading-relaxed">
                      Controla o ganho máximo de amplificação das 6 cordas nos canais stereo.
                    </p>
                  </div>
                  
                  {/* Visual LED Volume indicator meter */}
                  <div className="mt-4 flex gap-1 h-3.5 bg-stone-900/80 p-0.5 rounded border border-stone-800 overflow-hidden items-end">
                    {Array.from({ length: 14 }).map((_, idx) => {
                      const isActive = masterVolume >= (idx + 1) * 7.1;
                      let color = "bg-green-500";
                      if (idx > 10) color = "bg-red-500";
                      else if (idx > 7) color = "bg-yellow-500";
                      return (
                        <div
                          key={idx}
                          className={`w-full h-full rounded-sm transition duration-150 ${
                            isActive ? color : "bg-stone-850"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 3. Metronome Tone Pitch */}
                <div className="bg-stone-950/60 border border-stone-850 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-black block mb-2.5">
                      ⏱️ Tom do Metrônomo (Hz)
                    </span>
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-amber-500 shrink-0" />
                      <input
                        type="range"
                        min="400"
                        max="2000"
                        step="50"
                        value={metronomeFrequency}
                        onChange={(e) => setMetronomeFrequency(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold shrink-0 w-12 text-right text-amber-400">
                        {metronomeFrequency}Hz
                      </span>
                    </div>
                    <p className="text-[9px] text-stone-500 mt-2 leading-relaxed">
                      Altera a frequência do clique principal (Comp. 1: {metronomeFrequency}Hz, seguintes: {Math.round(metronomeFrequency * 0.6)}Hz).
                    </p>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-stone-400">
                      Médio-Grave: {metronomeFrequency < 800 ? "🚪 Bloco de Madeira" : metronomeFrequency > 1400 ? "🔔 Sino Cristal" : "🥁 Clique Clássico"}
                    </span>
                  </div>
                </div>

                {/* 4. Strum Speed Style */}
                <div className="bg-stone-950/60 border border-stone-850 p-4 rounded-2xl">
                  <span className="text-[10px] font-mono text-stone-500 uppercase font-black block mb-2.5">
                    ⚡ Espaçamento de Cordas
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "strum", name: "Varredura Média (35ms)", desc: "Simula palhetada confortável" },
                      { id: "fast", name: "Varredura Rápida (15ms)", desc: "Ataque veloz e agressivo" },
                      { id: "plucked", name: "Dedilhado Lento (180ms)", desc: "Notas soadas individualmente" }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setStrumSpeed(style.id)}
                        className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${
                          strumSpeed === style.id
                            ? "bg-amber-950/40 border-amber-500/60 text-amber-300"
                            : "bg-transparent border-stone-850 text-stone-400 hover:bg-stone-900/40 hover:border-stone-800"
                        }`}
                      >
                        <p className="font-extrabold text-[10px] leading-tight">{style.name}</p>
                        <p className="text-[9px] text-stone-500 leading-none mt-0.5">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

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
          {activeTab === "lessons" && (
            <LessonsTab 
              currentUser={currentUser} 
              onUserLevelUpdate={(newLevel) => {
                setCurrentUser((prev) => prev ? { ...prev, guitarLevel: newLevel } : null);
              }}
            />
          )}
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
