import { useState, useEffect } from "react";
import { startReferenceTone, stopReferenceTone } from "./AcousticAudio";
import { Volume2, VolumeX, ShieldCheck, RefreshCw, Key } from "lucide-react";

interface TunerString {
  index: number;
  label: string;
  note: string;
  frequency: string;
  name: string;
}

const TUNER_STRINGS: TunerString[] = [
  { index: 5, label: "1ª (e)", note: "E4", frequency: "329.6 Hz", name: "Mi aguda" },
  { index: 4, label: "2ª (B)", note: "B3", frequency: "246.9 Hz", name: "Si" },
  { index: 3, label: "3ª (G)", note: "G3", frequency: "196.0 Hz", name: "Sol" },
  { index: 2, label: "4ª (D)", note: "D3", frequency: "146.8 Hz", name: "Ré" },
  { index: 1, label: "5ª (A)", note: "A2", frequency: "110.0 Hz", name: "Lá" },
  { index: 0, label: "6ª (E)", note: "E2", frequency: "82.4 Hz", name: "Mi grave" },
];

export default function TunerTab() {
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);

  const handleStringClick = (stringIndex: number) => {
    if (activeStringIndex === stringIndex) {
      stopReferenceTone();
      setActiveStringIndex(null);
    } else {
      setActiveStringIndex(stringIndex);
      startReferenceTone(stringIndex);
    }
  };

  const handleStopAll = () => {
    stopReferenceTone();
    setActiveStringIndex(null);
  };

  useEffect(() => {
    // Stop continuous tune oscillator when page changes or tab is hidden
    return () => {
      stopReferenceTone();
    };
  }, []);

  return (
    <div id="tuner-tab-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
      {/* Guitar headstock visual panel */}
      <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-850 p-6 flex flex-col items-center justify-between text-center min-h-[460px]">
        <div className="mb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 font-mono">
            Afinador de Referência
          </span>
          <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white mt-1">Afinamento de Ouvido</h3>
          <p className="text-xs text-slate-400 dark:text-stone-400 max-w-sm mt-1 mx-auto">
            Gire as tarraxas no seu violão até que o som da corda coincida perfeitamente com os tons limpos abaixo:
          </p>
        </div>

        {/* Headstock Graphic UI */}
        <div className="relative my-4 w-full max-w-[280px]">
          {/* Headstock board backdrop styling */}
          <div className="w-28 h-56 bg-amber-950 dark:bg-stone-950 rounded-2xl mx-auto border-2 border-amber-900 shadow relative flex flex-col items-center justify-between py-6">
            <span className="text-amber-800 dark:text-amber-600/40 font-mono font-bold text-xs uppercase tracking-widest rotate-90 my-auto">
              VIOLÃO
            </span>
            <div className="h-1 bg-stone-800 w-11/12 rounded" />
          </div>

          {/* Peg layout left (6ª, 5ª, 4ª) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-6">
            {TUNER_STRINGS.slice(3).map((ts) => {
              const isActive = activeStringIndex === ts.index;
              return (
                <button
                  key={ts.index}
                  onClick={() => handleStringClick(ts.index)}
                  id={`tuner-peg-${ts.index}`}
                  className={`flex items-center gap-1.5 p-1 rounded-xl transition ${
                    isActive ? "scale-105" : "hover:scale-102"
                  }`}
                >
                  <div
                    className={`w-10 h-7 rounded-lg flex items-center justify-center border transition shadow ${
                      isActive
                        ? "bg-amber-800 border-amber-900 text-stone-50 font-black animate-pulse"
                        : "bg-slate-50 dark:bg-stone-900 border-slate-200 dark:border-stone-850 text-slate-700 dark:text-stone-300 font-bold"
                    }`}
                  >
                    {ts.note}
                  </div>
                  <div className="w-4 h-1.5 bg-slate-400 dark:bg-stone-700 rounded-full" />
                </button>
              );
            })}
          </div>

          {/* Peg layout right (3ª, 2ª, 1ª) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-6">
            {TUNER_STRINGS.slice(0, 3).reverse().map((ts) => {
              const isActive = activeStringIndex === ts.index;
              return (
                <button
                  key={ts.index}
                  onClick={() => handleStringClick(ts.index)}
                  id={`tuner-peg-${ts.index}`}
                  className={`flex flex-row-reverse items-center gap-1.5 p-1 rounded-xl transition ${
                    isActive ? "scale-105" : "hover:scale-102"
                  }`}
                >
                  <div
                    className={`w-10 h-7 rounded-lg flex items-center justify-center border transition shadow ${
                      isActive
                        ? "bg-amber-800 border-amber-900 text-stone-50 font-black animate-pulse"
                        : "bg-slate-50 dark:bg-stone-900 border-slate-200 dark:border-stone-850 text-slate-700 dark:text-stone-300 font-bold"
                    }`}
                  >
                    {ts.note}
                  </div>
                  <div className="w-4 h-1.5 bg-slate-400 dark:bg-stone-700 rounded-full" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full flex gap-3 mt-4">
          <button
            onClick={handleStopAll}
            disabled={activeStringIndex === null}
            id="tuner-stop-btn"
            className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 font-bold rounded-2xl flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed text-xs border border-red-200/50"
          >
            <VolumeX className="w-4 h-4" />
            Parar Som de Afinação
          </button>
        </div>
      </div>

      {/* Manual chord tuning notes sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-gradient-to-br from-stone-50 to-amber-50/20 dark:from-stone-900 dark:to-stone-950 p-5 rounded-2xl border border-slate-200 dark:border-stone-850">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Cordas Individuais</h4>
          </div>

          <div className="flex flex-col gap-2">
            {TUNER_STRINGS.map((ts) => {
              const isActive = activeStringIndex === ts.index;
              return (
                <button
                  key={ts.index}
                  onClick={() => handleStringClick(ts.index)}
                  id={`tuner-row-${ts.index}`}
                  className={`p-3 rounded-xl border text-left transition flex justify-between items-center ${
                    isActive
                      ? "bg-amber-50 dark:bg-amber-950/25 border-amber-600"
                      : "bg-white dark:bg-stone-900 hover:bg-slate-50 border-slate-200 dark:border-stone-850 text-slate-700 dark:text-stone-350"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {ts.label} - {ts.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-stone-500 leading-none">
                      Freq: {ts.frequency}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-stone-500 font-mono tracking-wider">
                      {ts.note}
                    </span>
                    <div className={`p-1.5 rounded-full ${
                      isActive ? "bg-amber-800 text-stone-50" : "bg-slate-100 dark:bg-stone-800 text-slate-550"
                    }`}>
                      {isActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-green-500/5 p-4 rounded-xl border border-green-200/20 text-xs text-green-800 dark:text-green-400 flex gap-2">
          <ShieldCheck className="w-5 h-5 shrink-0 text-green-600" />
          <div className="space-y-0.5">
            <span className="font-bold block">Como saber se está afinado?</span>
            <p>Se as duas frequências oscilarem juntas sem criar "ondas" ou "batimentos" rápidos de vibração, o seu violão está perfeitamente afinado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
