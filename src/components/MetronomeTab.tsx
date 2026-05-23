import { useState, useEffect, useRef } from "react";
import { playMetronomeBeat } from "./AcousticAudio";
import { Play, Square, Plus, Minus, Music, Activity } from "lucide-react";

export default function MetronomeTab() {
  const [bpm, setBpm] = useState<number>(80);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeSignature, setTimeSignature] = useState<number>(4); // 2/4, 3/4 or 4/4
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bpmRef = useRef<number>(bpm);
  const timeSigRef = useRef<number>(timeSignature);
  const beatRef = useRef<number>(currentBeat);

  // Sync refs to avoid interval closure stale states
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    timeSigRef.current = timeSignature;
  }, [timeSignature]);

  useEffect(() => {
    beatRef.current = currentBeat;
  }, [currentBeat]);

  const handleBpmChange = (value: number) => {
    const clamped = Math.max(40, Math.min(240, value));
    setBpm(clamped);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const startMetronome = () => {
    setIsPlaying(true);
    setCurrentBeat(1);
    
    // Play immediately first beat
    playMetronomeBeat(true);

    const intervalMs = (60 / bpmRef.current) * 1000;
    
    const runTick = () => {
      const nextBeat = (beatRef.current % timeSigRef.current) + 1;
      setCurrentBeat(nextBeat);
      playMetronomeBeat(nextBeat === 1);

      const currentIntervalMs = (60 / bpmRef.current) * 1000;
      timerRef.current = setTimeout(runTick, currentIntervalMs);
    };

    timerRef.current = setTimeout(runTick, intervalMs);
  };

  const stopMetronome = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Re-sync metronome pace if it is playing and BPM changes
  useEffect(() => {
    if (isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      const intervalMs = (60 / bpm) * 1000;
      
      const runTick = () => {
        const nextBeat = (beatRef.current % timeSigRef.current) + 1;
        setCurrentBeat(nextBeat);
        playMetronomeBeat(nextBeat === 1);

        const currentIntervalMs = (60 / bpmRef.current) * 1005; // fine tune
        timerRef.current = setTimeout(runTick, (60 / bpmRef.current) * 1000);
      };

      timerRef.current = setTimeout(runTick, intervalMs);
    }
  }, [bpm, timeSignature]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const guitarTempos = [
    { label: "Lento / Valsa", bpm: 60, desc: "Excelente para treinar pestanas e digitação." },
    { label: "Balada Progressiva", bpm: 80, desc: "Ritmo de modão, fogueira ou pop acústico lento." },
    { label: "Pop / Rock Standard", bpm: 100, desc: "A velocidade padrão da maioria dos hits nacionais." },
    { label: "Samba / MPB Animado", bpm: 120, desc: "Ritmo de bossa rápida ou batida sertaneja agitada." },
  ];

  return (
    <div id="metronome-tab-wrapper" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
      {/* Visual Metronome Dial/Control Panel */}
      <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-800 shadow-sm p-6 flex flex-col items-center justify-between text-center min-h-[440px]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 font-mono">
            Treino de Ritmo e Tempo
          </span>
          <h3 className="font-extrabold text-2xl text-slate-900 dark:text-stone-100 mt-1">Metrônomo Digital</h3>
          <p className="text-xs text-slate-400 dark:text-stone-400 max-w-sm mt-1 mx-auto">
            Essencial para sincronizar suas batidas e não acelerar ou desacelerar durante a música.
          </p>
        </div>

        {/* Visual Pulse Indicator Grid */}
        <div className="my-6 w-full max-w-xs">
          <div className="flex justify-center gap-3 mb-6">
            {Array.from({ length: timeSignature }).map((_, idx) => {
              const num = idx + 1;
              const isCurrent = currentBeat === num;
              return (
                <div
                  key={num}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-100 border ${
                    isCurrent
                      ? num === 1
                        ? "bg-amber-600 border-amber-600 text-stone-50 scale-115 shadow"
                        : "bg-amber-900 border-amber-900 text-stone-50 scale-108 shadow"
                      : "bg-slate-50 dark:bg-stone-950 border-slate-200 dark:border-stone-800 text-slate-400 dark:text-stone-600"
                  }`}
                >
                  {num === 1 ? <Music className="w-4 h-4" /> : num}
                </div>
              );
            })}
          </div>

          {/* Current BMP Big Number */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleBpmChange(bpm - 5)}
              id="metronome-minus-5"
              className="w-10 h-10 rounded-full bg-slate-50 dark:bg-stone-950 hover:bg-slate-100 dark:hover:bg-stone-850 text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-stone-800 flex items-center justify-center transition active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
                {bpm}
              </span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-500 tracking-widest uppercase mt-1">BPM</span>
            </div>
            <button
              onClick={() => handleBpmChange(bpm + 5)}
              id="metronome-plus-5"
              className="w-10 h-10 rounded-full bg-slate-50 dark:bg-stone-950 hover:bg-slate-100 dark:hover:bg-stone-850 text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-stone-800 flex items-center justify-center transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Slider input */}
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => handleBpmChange(parseInt(e.target.value))}
            id="metronome-bpm-slider"
            className="w-full h-1.5 bg-slate-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-800 dark:accent-amber-600 mt-6"
          />
        </div>

        {/* Buttons Control Panel */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setTimeSignature(2)}
              id="metronome-sig-2"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                timeSignature === 2
                  ? "bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-900 dark:text-amber-300"
                  : "bg-stone-50 dark:bg-stone-950 border-slate-205 dark:border-stone-800 text-slate-500"
              }`}
            >
              Compasso 2/4
            </button>
            <button
              onClick={() => setTimeSignature(3)}
              id="metronome-sig-3"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                timeSignature === 3
                  ? "bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-900 dark:text-amber-300"
                  : "bg-stone-50 dark:bg-stone-950 border-slate-205 dark:border-stone-800 text-slate-500"
              }`}
            >
              Compasso 3/4
            </button>
            <button
              onClick={() => setTimeSignature(4)}
              id="metronome-sig-4"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                timeSignature === 4
                  ? "bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-900 dark:text-amber-300"
                  : "bg-stone-50 dark:bg-stone-950 border-slate-205 dark:border-stone-800 text-slate-500"
              }`}
            >
              Compasso 4/4
            </button>
          </div>

          <button
            onClick={handleTogglePlay}
            id="metronome-play-toggle-btn"
            className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 text-stone-50 transition active:scale-98 shadow ${
              isPlaying
                ? "bg-red-700 hover:bg-red-800 dark:bg-red-650"
                : "bg-amber-800 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-5 h-5 fill-current" /> Parar Metrônomo
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Iniciar Metrônomo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recommended paces right panel */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-gradient-to-br from-stone-50 to-amber-50/20 dark:from-stone-900 dark:to-stone-950 p-5 rounded-2xl border border-slate-200 dark:border-stone-805">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Velocidades Recomendadas</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed mb-4">
            Cada estilo musical pede um andamento específico. Selecione rapidamente as velocidades abaixo para ajustar o metrônomo:
          </p>

          <div className="flex flex-col gap-2.5">
            {guitarTempos.map((gt) => (
              <button
                key={gt.bpm}
                onClick={() => handleBpmChange(gt.bpm)}
                id={`preset-bpm-${gt.bpm}`}
                className={`p-3.5 rounded-xl border text-left transition flex justify-between items-center ${
                  bpm === gt.bpm
                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-900/60"
                    : "bg-white dark:bg-stone-900 hover:bg-stone-50/50 dark:hover:bg-stone-850/40 border-slate-200 dark:border-stone-800"
                }`}
              >
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    {gt.label}
                  </span>
                  <span className="text-[10px] text-slate-450 dark:text-stone-500 mt-0.5 block leading-normal pr-4">
                    {gt.desc}
                  </span>
                </div>
                <div className="font-mono font-bold text-base text-amber-800 dark:text-amber-400 whitespace-nowrap shrink-0">
                  {gt.bpm} BPM
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-500/5 dark:bg-stone-900 p-4 rounded-xl border border-dotted border-slate-300 dark:border-stone-850 text-slate-500 dark:text-stone-400 text-xs leading-relaxed">
          <span className="font-semibold text-slate-800 dark:text-white block mb-1">Como treinar com metrônomo?</span>
          Comece lento (60 BPM) tocando uma única nota ou acorde por batida. Quando o movimento estiver limpo e sem travar, suba de 5 em 5 BPM. Constância é mais importante do que velocidade!
        </div>
      </div>
    </div>
  );
}
