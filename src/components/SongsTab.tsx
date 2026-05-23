import { useState, useEffect } from "react";
import { Song, SongLine, UserSession } from "../types";
import { playGuitarChord } from "./AcousticAudio";
import { Music, Play, Disc, ArrowRight, Video, FileText, CheckCircle, Edit3, Save } from "lucide-react";

const SONG_DATABASE: Song[] = [
  {
    id: "song-1",
    title: "Asa Branca",
    artist: "Luiz Gonzaga",
    bpm: 90,
    rhythm: "Baião simplificado (Toque Pop)",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["G", "C", "D"],
    videoTip: "Toque as levadas de forma bem marcada na batida do folclore nordestino.",
    lines: [
      {
        chords: [
          { chord: "G", position: 5 },
          { chord: "C", position: 28 },
        ],
        text: "Quando oiei a terra ardendo",
      },
      {
        chords: [
          { chord: "G", position: 5 },
          { chord: "C", position: 32 },
        ],
        text: "Qual fogueira de São João",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "D", position: 16 },
          { chord: "G", position: 24 },
        ],
        text: "Eu perguntei a Deus do céu, ai",
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 12 },
          { chord: "G", position: 22 },
        ],
        text: "Por que tamanha judiação",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Que braseiro, que fornalha",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Nem um pé de prantação",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "D", position: 15 },
          { chord: "G", position: 24 },
        ],
        text: "Por farta d'água perdi meu gado",
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 12 },
          { chord: "G", position: 22 },
        ],
        text: "Morreu de sede meu alazão",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Até mesmo a asa branca",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Bateu asas do sertão",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "D", position: 15 },
          { chord: "G", position: 24 },
        ],
        text: "Então eu disse, adeus Rosinha",
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 12 },
          { chord: "G", position: 22 },
        ],
        text: "Guarda contigo meu coração",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Hoje longe, muitas légua",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Numa triste solidão",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "D", position: 15 },
          { chord: "G", position: 24 },
        ],
        text: "Espero a chuva cair de novo",
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 12 },
          { chord: "G", position: 22 },
        ],
        text: "Pra mim voltar pro meu sertão",
      },
    ],
  },
  {
    id: "song-2",
    title: "Parabéns Pra Você",
    artist: "Tradicional",
    bpm: 80,
    rhythm: "Valsa (Compasso 3/4)",
    strummingPattern: ["↓", "↓", "↓"], // Down Down Down waltz
    chordsUsed: ["G", "D", "C"],
    videoTip: "Utilize o compasso de triplo toque: UMA descida mais grave e DUAS descidas agudas.",
    lines: [
      {
        chords: [{ chord: "G", position: 12 }],
        text: "Parabéns pra você",
      },
      {
        chords: [{ chord: "D", position: 12 }],
        text: "Nesta data querida",
      },
      {
        chords: [
          { chord: "D", position: 6 },
          { chord: "G", position: 22 },
        ],
        text: "Muitas felicidades",
      },
      {
        chords: [
          { chord: "G", position: 6 },
          { chord: "C", position: 22 },
        ],
        text: "Mutos anos de vida",
      },
      {
        chords: [{ chord: "G", position: 12 }],
        text: "E para o aniversariante",
      },
      {
        chords: [{ chord: "D", position: 12 }],
        text: "Uma salva de palmas",
      },
      {
        chords: [
          { chord: "D", position: 6 },
          { chord: "G", position: 22 },
        ],
        text: "Muita saúde e alegria",
      },
      {
        chords: [
          { chord: "G", position: 6 },
          { chord: "C", position: 22 },
        ],
        text: "Dentro de nossas almas",
      },
    ],
  },
  {
    id: "song-3",
    title: "Primeiros Erros",
    artist: "Capital Inicial",
    bpm: 100,
    rhythm: "Pop Nacional (Batida de Pop)",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["C", "D", "Am", "G"],
    videoTip: "Essa música segue o ciclo eterno C, D, Am, G. Ótima para treinar agilidade na troca de acordes.",
    lines: [
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Se seu pudesse recomeçar",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Faria tudo outra vez",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Se eu pudesse num olhar",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Te dizer o que não fiz",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Meu caminho é sem destino",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Flutuo no ar, sem ter onde pisar",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Na minha vida tudo acontece",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Mas minto que existo para sobreviver",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Mas se a chuva cair, e o vento soprar",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Tu vais saber que eu nunca te esqueci",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "E o sol reaparecer, nem vai lembrar",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "De tudo que se perdeu...",
      },
    ],
  },
  {
    id: "song-4",
    title: "Tempo Perdido",
    artist: "Legião Urbana",
    bpm: 114,
    rhythm: "Pop Rock Nacional",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["C", "Am", "Bm7", "Em"],
    videoTip: "O dedilhado e ritmo desta música são lentos e marcantes. Pratique a troca do Am para o sofisticado Bm7.",
    lines: [
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Todos os dias antes de dormir",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Lembro e esqueço como foi o dia",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Sempre em frente, não temos tempo a perder",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Não temos tempo a perder",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Nosso suor sagrado é muito mais belo",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Que esse sangue amargo",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "E deixamos nossos corpos no mundo",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Sem medo de nada...",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Veja o sol dessa manhã tão cinza",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "A tempestade que chega é da cor dos teus olhos castanhos",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Então me abraça forte e me diz mais uma vez",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Que já estamos distantes de tudo",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Temos nosso próprio tempo",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Temos nosso próprio tempo...",
      },
    ],
  }
];

// Fret definitions for click plays
const CHORD_FRETS: Record<string, (number | "x")[]> = {
  C: ["x", 3, 2, 0, 1, 0],
  G: [3, 2, 0, 0, 0, 3],
  D: ["x", "x", 0, 2, 3, 2],
  Am: ["x", 0, 2, 2, 1, 0],
  Em: [0, 2, 2, 0, 0, 0],
  Bm7: ["x", 2, 4, 2, 3, 2],
  C7M: ["x", 3, 2, 0, 0, 0],
  D9: ["x", "x", 0, 2, 3, 0],
  G7: [3, 2, 0, 0, 0, 1],
  "F#m7": [2, 4, 2, 2, 2, 2],
  "E7(9)": [0, 2, 0, 1, 0, 2],
  C9: ["x", 3, 2, 0, 3, 0],
  A7: ["x", 0, 2, 0, 2, 0],
  B7: ["x", 2, 1, 2, 0, 2]
};

export default function SongsTab({ currentUser }: { currentUser: UserSession | null }) {
  const [selectedSong, setSelectedSong] = useState<Song>(SONG_DATABASE[0]);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const userEmail = currentUser?.email || "convidado@violao.com";

  // Fetch song training note on song/user change
  useEffect(() => {
    setSaveSuccess(false);
    fetch(`/api/notes?email=${encodeURIComponent(userEmail)}&itemId=${encodeURIComponent(selectedSong.id)}&itemType=song`)
      .then((res) => res.json())
      .then((data) => {
        setNoteText(data.content || "");
      })
      .catch((err) => console.error("Erro ao carregar anotação do repertório:", err));
  }, [userEmail, selectedSong.id]);

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          itemId: selectedSong.id,
          itemType: "song",
          content: noteText,
        }),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao salvar anotação da música:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleChordClick = (chordName: string) => {
    // If we have custom map use it, otherwise default to single string pluck or major open
    const frets = CHORD_FRETS[chordName] || ["x", "x", 0, 2, 3, 2];
    playGuitarChord(frets, "strum");
  };

  const renderLyricLineWithChords = (line: SongLine, lineIdx: number) => {
    // Generate styled chords line above text
    if (line.chords.length === 0) {
      return (
        <div key={lineIdx} className="py-2.5">
          <p className="text-slate-700 dark:text-stone-300 font-medium text-sm leading-relaxed">{line.text}</p>
        </div>
      );
    }

    // Build line of text with positioned absolute chords
    // A robust rendering: we'll match spacing or use split flex layout
    return (
      <div key={lineIdx} className="py-3.5 border-b border-slate-100/50 dark:border-stone-850/30">
        {/* Chords row */}
        <div className="flex gap-4 mb-1 h-6">
          {line.chords.map((c, cIdx) => (
            <button
              key={cIdx}
              onClick={() => handleChordClick(c.chord)}
              id={`song-chord-click-${lineIdx}-${cIdx}`}
              className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-900 hover:text-stone-50 dark:hover:bg-amber-700 font-mono font-bold text-[13px] text-amber-800 dark:text-amber-400 rounded-lg border border-amber-200/50 dark:border-stone-800 transition active:scale-95 flex items-center gap-1 shadow-sm shrink-0"
              title="Clique para ouvir"
            >
              <span>{c.chord}</span>
              <span className="text-[9px] opacity-60">🎵</span>
            </button>
          ))}
        </div>
        
        {/* Lyric line text */}
        <p className="text-slate-800 dark:text-stone-250 font-bold text-sm select-auto">
          {line.text}
        </p>
      </div>
    );
  };

  return (
    <div id="songs-tab-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Song selector column / Left */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-950 p-4 rounded-xl border border-amber-100 dark:border-stone-800">
          <h3 className="font-bold text-xs text-amber-900 dark:text-amber-100 uppercase tracking-widest flex items-center gap-2">
            <Disc className="w-4 h-4 animate-spin text-amber-500" />
            Repertório de Treino Do Zero
          </h3>
          <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 leading-normal">
            Toque canções clássicas usando os ritmos e acordes que você aprendeu. Clique nos acordes azuis/laranjas no texto para ouvir como montá-los.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {SONG_DATABASE.map((song) => {
            const isSelected = selectedSong.id === song.id;
            return (
              <button
                key={song.id}
                onClick={() => setSelectedSong(song)}
                id={`song-select-btn-${song.id}`}
                className={`p-4 rounded-2xl border text-left transition relative overflow-hidden group ${
                  isSelected
                    ? "bg-white dark:bg-stone-900 border-amber-700 dark:border-amber-600 shadow"
                    : "bg-white dark:bg-stone-900 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-stone-100 block">
                      {song.title}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-stone-500 block">
                      {song.artist}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-950 font-bold px-2 py-1 rounded text-amber-800 dark:text-amber-400 shrink-0">
                    {song.bpm} BPM
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {song.chordsUsed.map((chord) => (
                    <span
                      key={chord}
                      className="text-[10px] font-bold font-mono px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 rounded-md border border-amber-100/50 dark:border-stone-800"
                    >
                      {chord}
                    </span>
                  ))}
                </div>

                {/* Arrow indicator on hover */}
                <ArrowRight className="w-4 h-4 text-amber-700 absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition translate-x-2 group-hover:translate-x-0" />
              </button>
            );
          })}
        </div>

        <div className="bg-amber-500/5 dark:bg-stone-900 p-4 rounded-xl border border-amber-250/20 text-xs text-slate-500 leading-normal">
          <span className="font-semibold text-slate-800 dark:text-stone-200 block mb-1">💡 Regra de Ouro do Treino:</span>
          Memorize as trocas de acordes antes de começar a agitar o ritmo com a mão direita. Se preciso, toque uma única vez para baixo a cada acorde trocado.
        </div>
      </div>

      {/* Sheet Music Board / Right */}
      <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-800 p-6 flex flex-col justify-between shadow-sm">
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-stone-800 pb-5 mb-5 w-full">
            <div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 font-mono">
                  Guia Cifrado Interativo
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {selectedSong.title}
              </h2>
              <p className="text-xs text-slate-400 dark:text-stone-400">
                Artista: <strong className="text-slate-650 dark:text-stone-300 font-medium">{selectedSong.artist}</strong>
              </p>
            </div>

            {/* Quick stats board */}
            <div className="flex gap-2.5">
              <div className="px-3.5 py-2 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-2xl text-center">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-500 block">Levada</span>
                <span className="text-xs font-bold text-slate-750 dark:text-stone-350">{selectedSong.rhythm}</span>
              </div>

              <div className="px-3.5 py-2 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-2xl text-center">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-550 block">Mão Esquerda</span>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono">
                  {selectedSong.chordsUsed.length} Acordes
                </span>
              </div>
            </div>
          </div>

          {/* Strum sequence board */}
          <div className="bg-amber-500/5 dark:bg-stone-950/40 p-4 rounded-2xl border border-amber-100 dark:border-stone-850 flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-stone-300 whitespace-nowrap">Levada de Ritmo:</span>
              <div className="flex gap-1.5">
                {selectedSong.strummingPattern.map((strum, sIdx) => {
                  const isDown = strum === "↓";
                  return (
                    <span
                      key={sIdx}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isDown
                          ? "bg-amber-800 text-stone-50"
                          : "bg-yellow-500 text-stone-900"
                      }`}
                    >
                      {strum}
                    </span>
                  );
                })}
              </div>
            </div>

            {selectedSong.videoTip && (
              <div className="text-[11px] text-slate-500 dark:text-stone-400 flex gap-1.5 items-center max-w-sm">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <span>{selectedSong.videoTip}</span>
              </div>
            )}
          </div>

          {/* Sheet body */}
          <div className="bg-slate-50/50 dark:bg-stone-950/20 p-6 md:p-8 rounded-3xl border border-slate-205 dark:border-stone-850 font-sans shadow-inner overflow-hidden min-h-[280px]">
            <div className="max-w-md mx-auto space-y-2">
              {selectedSong.lines.map((line, idx) => renderLyricLineWithChords(line, idx))}
            </div>
          </div>

          {/* Diário de Treino de Música - SQLite backend */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-stone-800 text-left">
            <h4 className="text-sm font-bold text-slate-900 dark:text-stone-100 flex items-center gap-2 mb-1.5">
              <Edit3 className="w-4 h-4 text-amber-600" />
              Diário de Treino de Música (Salvo no SQLite)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-stone-400 mb-3 leading-relaxed">
              Anote quais partes desta música você acha mais difíceis (ex: transição rápida de <strong>G</strong> para <strong>D</strong>), onde deve focar a levada ou seus tempos de andamento. Suas notas ficam vinculadas eternamente a esta música no SQLite!
            </p>
            <div className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Exemplo: Praticar a transição rápida do acorde D para o G de modo mais limpo. Focar bem nas duas batidas para cima da levada..."
                className="w-full min-h-[90px] p-3 text-xs bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-stone-200"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 dark:text-stone-500">
                  {saveSuccess ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Suas anotações de música foram gravadas no SQLite!</span>
                  ) : "Anotação correspondente vinculada"}
                </span>
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  id="save-song-note-btn"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-850 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingNote ? "Salvando..." : "Gravar no Banco"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action guidelines */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-stone-800 flex flex-col md:flex-row gap-4 justify-between items-center text-xs text-slate-400 dark:text-stone-500 text-center md:text-left">
          <span>
            Clique em qualquer cifra acima para ouvir a montagem do acorde!
          </span>
          <span className="font-bold text-amber-700 dark:text-amber-500 font-mono animate-pulse">
            ♪ Toque acompanhando no seu violão real
          </span>
        </div>
      </div>
    </div>
  );
}
