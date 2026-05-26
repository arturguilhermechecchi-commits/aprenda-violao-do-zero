import React, { useState, useEffect } from "react";
import { Lesson, UserSession } from "../types";
import { Check, BookOpen, Music, Shield, Award, Sparkles, CheckCircle2, Circle, Edit3, Save, Lock, Target, Activity, Trophy, Video, Play, Tv, Clock, HelpCircle, MessageSquare, Send } from "lucide-react";

interface LevelChallenge {
  id: string;
  level: string;
  title: string;
  description: string;
  objective: string;
  rewardXP: number;
  icon: "target" | "music" | "activity" | "sparkles" | "award";
  tip: string;
}

const ALL_CHALLENGES_POOL: LevelChallenge[] = [
  // Iniciante
  {
    id: "ch-ini-1",
    level: "Iniciante",
    title: "Postura e Posicionamento Correto",
    description: "Alongue os dedos e mantenha a curvatura das falanges para tocar de forma limpa por 2 minutos.",
    objective: "Mantenha a ponta dos dedos verticalizada ao testar a digitação na Casa 1.",
    rewardXP: 100,
    icon: "target",
    tip: "Apoie a curva do violão confortavelmente na sua coxa direita e deixe o polegar atrás do braço sutilmente."
  },
  {
    id: "ch-ini-2",
    level: "Iniciante",
    title: "Memorizar o Acorde Am (Lá Menor)",
    description: "Abra o Dicionário de Acordes, monte a digitação do Lá Menor e toque todas as cordas de forma limpa.",
    objective: "Consiga soar limpo individualmente em cada corda do acorde Am.",
    rewardXP: 150,
    icon: "music",
    tip: "A 1ª corda e a 5ª corda devem soar soltas e claras, sem ser abafadas por outros dedos."
  },
  {
    id: "ch-ini-3",
    level: "Iniciante",
    title: "Ritmo Firme de Pop/Rock",
    description: "Bata palmas ou toque o ritmo Pop (↓ ↓ ↑ ↑ ↓ ↑) acompanhando o metrônomo por 30 segundos.",
    objective: "Bata 4 ciclos completos do ritmo sincronizado perfeitamente sem errar o padrão.",
    rewardXP: 200,
    icon: "activity",
    tip: "Configure o metrônomo para 65 BPM na aba Metrônomo para treinar com conforto e ritmo."
  },
  {
    id: "ch-ini-4",
    level: "Iniciante",
    title: "Tônicas do CAGED Geral",
    description: "Tente localizar a nota tônica (raiz) nas 5 formas abertas clássicas (C, A, G, E, D).",
    objective: "Identifique e toque as tônicas de cada uma das 5 formas básicas abertas.",
    rewardXP: 150,
    icon: "sparkles",
    tip: "As tônicas ficam na 5ª corda para C e A; na 6ª corda para G e E; e na 4ª corda para D."
  },
  {
    id: "ch-ini-5",
    level: "Iniciante",
    title: "Treino de Pestana Curta",
    description: "Aperte apenas as cordas 1 e 2 na Casa 1 com o dedo 1 (indicador) e toque ambas seguidas.",
    objective: "Faça um mini-acorde sem zumbido em nenhuma das duas cordas pressionadas.",
    rewardXP: 120,
    icon: "award",
    tip: "Pressione usando a lateral do dedo indicador, não a parte macia da frente."
  },
  {
    id: "ch-ini-6",
    level: "Iniciante",
    title: "Dedilhado Básico de Arpejo",
    description: "No acorde de Mi Maior (E), toque sequencialmente: Dedão (6ª corda), Indicador (3ª), Médio (2ª), Anelar (1ª).",
    objective: "Mantenha um tempo uniforme entre as quatro notas sem embolar as cordas.",
    rewardXP: 130,
    icon: "music",
    tip: "Deixe os dedos repousarem levemente nas cordas correspondentes antes de puxar."
  },
  {
    id: "ch-ini-7",
    level: "Iniciante",
    title: "Afinar por Ouvido com Referência",
    description: "Tente afinar as cordas mais finas usando a 5ª casa da corda anterior como referência.",
    objective: "Ajuste os sons das cordas vizinhas até conseguir a mesma frequência tonal.",
    rewardXP: 160,
    icon: "target",
    tip: "A 5ª casa da 6ª corda deve soar exatamente igual à 5ª corda solta!"
  },
  {
    id: "ch-ini-8",
    level: "Iniciante",
    title: "Memorizar o Acorde D (Ré Maior)",
    description: "Monte o desenho de D (Ré Maior), tocando apenas a partir da 4ª corda para baixo.",
    objective: "Obtenha um acorde cintilante sem abafar a primeira corda com o anelar.",
    rewardXP: 140,
    icon: "sparkles",
    tip: "Mantenha o polegar baixo no braço para dar amplitude extrema à pinça da mão esquerda."
  },
  // Intermediário
  {
    id: "ch-int-1",
    level: "Intermediário",
    title: "Troca Rápida de Acordes C - G",
    description: "Transite suavemente entre o Dó Maior (C) e o Sol Maior (G) a cada 4 batidas sem interromper o fluxo.",
    objective: "Execute 8 transições de acordes no tempo exato, acompanhando a melodia.",
    rewardXP: 250,
    icon: "sparkles",
    tip: "Não espere o acorde soar para movimentar a mão; mude os dedos de forma harmônica enquanto bate."
  },
  {
    id: "ch-int-2",
    level: "Intermediário",
    title: "Domínio Vocálico Consecutivo",
    description: "Tente cantar uma música básica de 3 a 4 acordes (ex: Anunciação ou Primeiros Erros) sem perder a batida da mão direita.",
    objective: "Cante a primeira estrofe inteira mantendo a batida Pop sem acelerar.",
    rewardXP: 300,
    icon: "music",
    tip: "É mais fácil praticar cantarolando o ritmo antes de verbalizar as palavras nas trocas de acorde."
  },
  {
    id: "ch-int-3",
    level: "Intermediário",
    title: "Sétimas e Tensões Acústicas",
    description: "Procure no Dicionário o acorde C7M e G7 e toque-os em sequência para escutar a transição de tensão e repouso.",
    objective: "Toque e escute a diferença tonal da tríade pura para o som dissonante com sétima.",
    rewardXP: 250,
    icon: "award",
    tip: "Observe como as tétrades adicionam uma sonoridade nostálgica de bossa-nova ou MPB."
  },
  {
    id: "ch-int-4",
    level: "Intermediário",
    title: "Transposição de Am com CAGED",
    description: "Monte a fôrma de Am transposta com pestana na 5ª casa para tocar o acorde de Rem (Dm).",
    objective: "Faça soar de forma robusta e ritmada todas as cordas sem perder a afinação da pestana.",
    rewardXP: 280,
    icon: "target",
    tip: "Na 5ª casa, a pestana requer menos pressão que na 1ª casa devido à tensão física."
  },
  {
    id: "ch-int-5",
    level: "Intermediário",
    title: "Batida de Reggae com Abafamento",
    description: "Execute uma batida rítmica acentuando apenas o contratempo (tempo fraco) e abafando com a palma.",
    objective: "Toque 12 compassos sequenciais com o balanço 'staccato' típico do Marley.",
    rewardXP: 260,
    icon: "activity",
    tip: "Alivie a pressão da mão esquerda logo após bater para conseguir o som seco instantâneo."
  },
  {
    id: "ch-int-6",
    level: "Intermediário",
    title: "Escala Pentatônica Menor Básica",
    description: "Toque o primeiro desenho da Pentatônica de Am na Casa 5 englobando todas as 6 cordas.",
    objective: "Suba e desça a escala completa alternando palhetadas/dedos sem pestanejar.",
    rewardXP: 270,
    icon: "sparkles",
    tip: "Use os dedos indicador (casa 5) e anelar/mínimo (casas 7/8) de forma firme apoiando o braço."
  },
  {
    id: "ch-int-7",
    level: "Intermediário",
    title: "Dedilhado Amplo PIMA",
    description: "Altere o dedilhado para P-I-M-A-I-M-A executando em compasso de 6/8 de forma fluida.",
    objective: "Mantenha a rítmica idêntica do início ao fim por 1 minuto consecutivo.",
    rewardXP: 260,
    icon: "music",
    tip: "Foque na independência total de movimentos do polegar (P) em relação aos dedos primas."
  },
  {
    id: "ch-int-8",
    level: "Intermediário",
    title: "Slide e Ligados Intermediários",
    description: "Tente fazer um Hammer-on seguido de Pull-off rápido na 3ª corda entre as casas 5 e 7.",
    objective: "Faça as notas soarem apenas com o impacto e retirada rápida dos dedos da esquerda.",
    rewardXP: 290,
    icon: "target",
    tip: "Seu dedo 3 deve cair como um martelo firme bem próximo do traste de metal."
  },
  // Avançado
  {
    id: "ch-adv-1",
    level: "Avançado",
    title: "Arpejo P.I.M.A Contínuo",
    description: "Desfira o dedilhado P-I-M-A-M-I continuamente a 90 BPM por 2 minutos seguidos.",
    objective: "Mantenha a pulsação contínua e as notas soando com o exato mesmo volume.",
    rewardXP: 400,
    icon: "target",
    tip: "Deixe a mão direita em formato de concha relaxada sem encostar o pulso no corpo do violão."
  },
  {
    id: "ch-adv-2",
    level: "Avançado",
    title: "Improvisação sobre Pentatônica",
    description: "Siga o modelo de licks de improvisação subindo e descendo as notas da escala menor na 5ª casa.",
    objective: "Toque 4 licks diferentes alternando as cordas e usando hammer-on ou slide.",
    rewardXP: 450,
    icon: "sparkles",
    tip: "A escala pentatônica funciona perfeitamente por cima de qualquer base de blues ou rock em Lá Menor!"
  },
  {
    id: "ch-adv-3",
    level: "Avançado",
    title: "Desafio da Capo e Tons",
    description: "Aprenda a transpor o tom de uma música inteira utilizando uma pestana ou um capotaste no terceiro traste.",
    objective: "Transponha uma música em Dó para o tom de Ré sustenido sem alterar as fôrmas comuns.",
    rewardXP: 500,
    icon: "award",
    tip: "O capotaste no traste 3 transforma a fôrma de Dó (C) no tom real de Ré sustenido (D#)."
  },
  {
    id: "ch-adv-4",
    level: "Avançado",
    title: "CAGED Avançado: Licks com Sétima",
    description: "Monte o arpejo de C7M usando a fôrma de Lá (A) na 3ª casa e solfeje as notas do acorde uma a uma.",
    objective: "Conecte as notas do arpejo sem interrupção usando palhetada ou dedilhado firme.",
    rewardXP: 460,
    icon: "music",
    tip: "O arpejo destaca a tônica na 5ª corda (Dó) e a sétima maior na 3ª corda (Si)."
  },
  {
    id: "ch-adv-5",
    level: "Avançado",
    title: "Síncope de Bossa Nova Clássica",
    description: "Toque o ritmo padrão de João Gilberto (síncope brasileira) por 2 minutos sem cair do tempo.",
    objective: "Garante o silêncio entre as puxadas de acorde de forma perfeitamente sincopada.",
    rewardXP: 480,
    icon: "activity",
    tip: "Substitua a batida de polegar para marcar apenas os tempos fortes 1 e 2 do compasso."
  },
  {
    id: "ch-adv-6",
    level: "Avançado",
    title: "Escalas Maiores de 3 Notas por Corda",
    description: "Execute a escala maior de Sol Maior (G) no braço inteiro usando o padrão de 3 notas por corda.",
    objective: "Memorize o desenho conectando as cordas e execute de forma limpa a 80 BPM semicocheias.",
    rewardXP: 450,
    icon: "sparkles",
    tip: "A abertura de dedos é maior, então mantenha o cotovelo esquerdo levemente para a frente."
  },
  {
    id: "ch-adv-7",
    level: "Avançado",
    title: "Harmonia de Acordes Substitutos",
    description: "Substitua um acorde dominante comum de G7 para Db7(9) (SubV7) resolvendo diretamente em C7M.",
    objective: "Toque a progressão sentindo a aproximação cromática do baixo de Db para C.",
    rewardXP: 470,
    icon: "award",
    tip: "O trítono presente em G7 (Si e Fá) é exatamente o mesmo presente em Db7 (Fá e B/Dó bemol)!"
  },
  {
    id: "ch-adv-8",
    level: "Avançado",
    title: "Técnica de Sweep Picking Lento",
    description: "Utilizando uma palheta, deslize pelas cordas de baixo para cima desenhando o acorde de Lá Menor em tríade.",
    objective: "Faça as notas soarem isoladas mas em uma única varredura contínua e sem sobreposição de sustentação.",
    rewardXP: 490,
    icon: "target",
    tip: "Abafe cada corda com a palma da mão direita (palm muting) logo após a palhetada."
  }
];

// Deterministic dynamic selection based on calendar date
function getDailyChallenges(): LevelChallenge[] {
  const levels = ["Iniciante", "Intermediário", "Avançado"];
  const selected: LevelChallenge[] = [];
  
  const d = new Date();
  const seedStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  
  levels.forEach((level) => {
    const levelPool = ALL_CHALLENGES_POOL.filter(c => c.level === level);
    if (levelPool.length <= 3) {
      selected.push(...levelPool);
      return;
    }
    
    let hash = 0;
    const levelSeedStr = `${seedStr}-${level}`;
    for (let i = 0; i < levelSeedStr.length; i++) {
      hash = levelSeedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const poolCopy = [...levelPool];
    for (let i = 0; i < 3; i++) {
      const index = Math.abs((hash + i * 223)) % poolCopy.length;
      selected.push(poolCopy[index]);
      poolCopy.splice(index, 1);
    }
  });
  
  return selected;
}

const LEVEL_CHALLENGES: LevelChallenge[] = getDailyChallenges();

function VideoNoteSection({ userEmail, activeVideo }: { userEmail: string; activeVideo: any }) {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!activeVideo) return;
    setSaveSuccess(false);
    fetch(`/api/notes?email=${encodeURIComponent(userEmail)}&itemId=${encodeURIComponent("video-" + activeVideo.id)}&itemType=lesson`)
      .then((res) => res.json())
      .then((data) => {
        setNote(data.content || "");
      })
      .catch((err) => console.error("Erro ao carregar anotação do vídeo:", err));
  }, [userEmail, activeVideo?.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          itemId: "video-" + activeVideo.id,
          itemType: "lesson",
          content: note,
        }),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao salvar anotação do vídeo:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-850 p-5 rounded-2xl text-left shadow-sm flex flex-col justify-between h-full min-h-[220px]">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className="w-4 h-4 text-rose-500" />
          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            Minhas Anotações de Vídeo
          </h5>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-stone-400 mb-3 leading-relaxed">
          Escreva licks de cifras, dúvidas harmônicas ou insights para revisar mais tarde. Estão salvos localmente!
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: C7M usa o shape X-12-11-13-10-X. Lembrar de praticar transição pro G7M..."
          className="w-full h-28 p-3 rounded-xl border border-slate-200 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 placeholder-slate-400 dark:placeholder-stone-600 text-xs focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 focus:outline-none transition resize-none"
        />
      </div>

      <div className="mt-3 flex justify-between items-center">
        {saveSuccess ? (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
            ✓ Salvo no SQLite!
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-rose-505 hover:bg-rose-600 bg-rose-500 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center gap-1.5 cursor-pointer border-0"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? "Salvando..." : "Salvar Notas"}
        </button>
      </div>
    </div>
  );
}

interface LessonsTabProps {
  currentUser: UserSession | null;
  onUserLevelUpdate?: (newLevel: string) => void;
}

export default function LessonsTab({ currentUser, onUserLevelUpdate }: LessonsTabProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>(currentUser?.guitarLevel || "Iniciante");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Level Quiz / Study check-up states
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [isPracticeQuiz, setIsPracticeQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [bestQuizResult, setBestQuizResult] = useState<any>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [studyMode, setStudyMode] = useState<"written" | "questions">("written");

  // States for student questions forum inside each level
  const [studentQuestions, setStudentQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionSubmitSuccess, setQuestionSubmitSuccess] = useState(false);
  const [questionSubmitError, setQuestionSubmitError] = useState<string | null>(null);

  const userEmail = currentUser?.email || "convidado@violao.com";

  // Real-time ticking block timer
  useEffect(() => {
    if (!blockedUntil) return;
    const calculateTime = () => {
      const remainingMs = new Date(blockedUntil).getTime() - Date.now();
      if (remainingMs <= 0) {
        setBlockedUntil(null);
        setQuizError(null);
        return false;
      } else {
        const minutes = Math.floor(remainingMs / 1000 / 60);
        const seconds = Math.floor((remainingMs / 1000) % 65);
        const displaySecs = seconds >= 60 ? 59 : seconds; // Normalize just in case of ticks
        setTimeLeftStr(`${minutes.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`);
        return true;
      }
    };
    
    const hasTimeLeft = calculateTime();
    if (!hasTimeLeft) return;

    const interval = setInterval(() => {
      const active = calculateTime();
      if (!active) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil]);

  // Fetch best quiz result for this level to display on selection
  useEffect(() => {
    fetch(`/api/quiz/results?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          const resultForLevel = data.results.find((r: any) => r.level === selectedLevel);
          setBestQuizResult(resultForLevel || null);
        }
      })
      .catch((err) => console.error("Erro ao carregar resultados de avaliações do SQLite:", err));
  }, [userEmail, selectedLevel, isTakingQuiz]);

  const startQuizFlow = (isPractice: boolean = false) => {
    setIsPracticeQuiz(isPractice);
    setIsLoadingQuiz(true);
    setIsTakingQuiz(true);
    setQuizFinished(false);
    setCurrentQuestionIdx(0);
    setSelectedOptionId(null);
    setQuizScore(0);
    setShowQuizExplanation(false);
    setQuizError(null);
    setBlockedUntil(null);

    const emailParam = encodeURIComponent(userEmail);
    const levelParam = encodeURIComponent(selectedLevel);
    const practiceParam = isPractice ? "&practice=true" : "";

    fetch(`/api/quiz/questions?level=${levelParam}&email=${emailParam}${practiceParam}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) {
            return res.json().then((data) => {
              setQuizError(data.error);
              setBlockedUntil(data.blockedUntil);
              throw new Error(data.error);
            });
          }
          throw new Error("Erro ao carregar questões.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.questions) {
          setQuizQuestions(data.questions);
        }
        setIsLoadingQuiz(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar questões do quiz:", err);
        setIsLoadingQuiz(false);
      });
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(optionIdx);
    const correct = quizQuestions[currentQuestionIdx].correctIndex === optionIdx;
    if (correct) {
      setQuizScore((prev) => prev + 1);
    }
    setShowQuizExplanation(true);
  };

  const handleNextQuizQuestion = async () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1); // Fix increment sequence nicely
      setSelectedOptionId(null);
      setShowQuizExplanation(false);
    } else {
      // Finished the quiz!
      setQuizFinished(true);
      const total = quizQuestions.length;
      // Pass threshold: at least 65% correct (4 out of 6, or 2 out of 3)
      const passThreshold = Math.ceil(total * 0.65);
      const passed = quizScore >= passThreshold;

      try {
        const response = await fetch("/api/quiz/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            level: selectedLevel,
            score: quizScore,
            total,
            passed,
            practice: isPracticeQuiz,
          }),
        });
        const data = await response.json();
        if (data.success) {
          if (passed && !isPracticeQuiz && onUserLevelUpdate) {
            onUserLevelUpdate(data.guitarLevel);
            const stored = localStorage.getItem("guitar_studio_user_session");
            if (stored) {
              try {
                const session = JSON.parse(stored);
                session.guitarLevel = data.guitarLevel;
                localStorage.setItem("guitar_studio_user_session", JSON.stringify(session));
              } catch (e) {
                // ignore
              }
            }
          }
        }
      } catch (err) {
        console.error("Erro ao salvar resultado de avaliação de nível:", err);
      }
    }
  };

  // Fetch lessons list from database based on selectedLevel
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/lessons?level=${encodeURIComponent(selectedLevel)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.lessons && data.lessons.length > 0) {
          setLessons(data.lessons);
          setActiveLesson(data.lessons[0]);
        } else {
          setLessons([]);
          setActiveLesson(null);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar lições do SQLite:", err);
        setIsLoading(false);
      });
  }, [selectedLevel]);



  // Load student questions & doubts list for current level
  const loadStudentQuestions = () => {
    setIsLoadingQuestions(true);
    fetch(`/api/student-questions?level=${encodeURIComponent(selectedLevel)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          setStudentQuestions(data.questions);
        } else {
          setStudentQuestions([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar dúvidas do nível:", err);
      })
      .finally(() => {
        setIsLoadingQuestions(false);
      });
  };

  useEffect(() => {
    loadStudentQuestions();
  }, [selectedLevel]);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !questionContent.trim()) {
      setQuestionSubmitError("Por favor, preencha o assunto e os detalhes da sua dúvida.");
      return;
    }
    setIsSubmittingQuestion(true);
    setQuestionSubmitError(null);
    setQuestionSubmitSuccess(false);

    try {
      const response = await fetch("/api/student-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          level: selectedLevel,
          title: questionTitle.trim(),
          question: questionContent.trim()
        })
      });

      if (response.ok) {
        setQuestionSubmitSuccess(true);
        setQuestionTitle("");
        setQuestionContent("");
        loadStudentQuestions();
        setTimeout(() => setQuestionSubmitSuccess(false), 5000);
      } else {
        const errData = await response.json();
        setQuestionSubmitError(errData.error || "Erro ao registrar sua pergunta.");
      }
    } catch (err) {
      console.error("Erro ao enviar dúvida:", err);
      setQuestionSubmitError("Erro de comunicação com o servidor.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Fetch completed lessons list from SQLite
  useEffect(() => {
    fetch(`/api/lessons/completed?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.completed) {
          setCompletedLessons(data.completed);
        }
      })
      .catch((err) => console.error("Erro ao carregar progresso SQLite:", err));
  }, [userEmail]);

  // Fetch completed challenges list from SQLite
  useEffect(() => {
    fetch(`/api/challenges/completed?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.completed) {
          setCompletedChallenges(data.completed);
        }
      })
      .catch((err) => console.error("Erro ao carregar desafios do SQLite:", err));
  }, [userEmail]);

  const toggleChallengeComplete = async (challengeId: string) => {
    const isCurrentlyCompleted = completedChallenges.includes(challengeId);
    let updated: string[];
    if (isCurrentlyCompleted) {
      updated = completedChallenges.filter(id => id !== challengeId);
    } else {
      updated = [...completedChallenges, challengeId];
    }
    
    // Optimistic UI update
    setCompletedChallenges(updated);

    try {
      const apiPath = isCurrentlyCompleted ? "/api/challenges/uncomplete" : "/api/challenges/complete";
      await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, challengeId }),
      });
    } catch (err) {
      console.error("Erro ao salvar progresso de desafio no SQLite:", err);
    }
  };

  // Fetch student note whenever active lesson changes
  useEffect(() => {
    if (!activeLesson) return;
    setSaveSuccess(false);
    fetch(`/api/notes?email=${encodeURIComponent(userEmail)}&itemId=${encodeURIComponent(activeLesson.id)}&itemType=lesson`)
      .then((res) => res.json())
      .then((data) => {
        setNoteText(data.content || "");
      })
      .catch((err) => console.error("Erro ao carregar anotação do SQLite:", err));
  }, [userEmail, activeLesson?.id]);

  const toggleLessonComplete = async (id: string) => {
    let isCurrentlyCompleted = completedLessons.includes(id);
    let updated: string[];
    if (isCurrentlyCompleted) {
      updated = completedLessons.filter((item) => item !== id);
    } else {
      updated = [...completedLessons, id];
    }
    
    // Optimistic UI update
    setCompletedLessons(updated);

    try {
      const apiPath = isCurrentlyCompleted ? "/api/lessons/uncomplete" : "/api/lessons/complete";
      await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, lessonId: id }),
      });
    } catch (err) {
      console.error("Erro ao sincronizar lição no SQLite:", err);
    }
  };

  const completeLessonAndGoToNext = async (currentId: string) => {
    if (!activeLesson) return;
    
    if (!completedLessons.includes(currentId)) {
      const updated = [...completedLessons, currentId];
      setCompletedLessons(updated);
      try {
        await fetch("/api/lessons/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, lessonId: currentId }),
        });
      } catch (err) {
        console.error("Erro ao sincronizar conclusão de lição no SQLite:", err);
      }
    }

    const next = lessons.find(l => l.order === activeLesson.order + 1);
    if (next) setActiveLesson(next);
  };

  const handleSaveNote = async () => {
    if (!activeLesson) return;
    setIsSavingNote(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          itemId: activeLesson.id,
          itemType: "lesson",
          content: noteText,
        }),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao salvar anotação:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const getPercentageComplete = () => {
    if (lessons.length === 0) return 0;
    const levelLessonIds = lessons.map(l => l.id);
    const completedInLevel = completedLessons.filter(id => levelLessonIds.includes(id)).length;
    return Math.round((completedInLevel / lessons.length) * 100);
  };

  const currentCompleteness = getPercentageComplete();
  const levelLessonIds = lessons.map(l => l.id);
  const completedInLevelCount = completedLessons.filter(id => levelLessonIds.includes(id)).length;
  const isLevelFullyCompleted = lessons.length > 0 && completedInLevelCount === lessons.length;

  return (
    <div id="lessons-tab-container" className="w-full transition-all duration-300">
      
      {/* 1. QUIZ VIEW (Dedicated Screen/Page) */}
      {isTakingQuiz && (
        <div className="max-w-3xl mx-auto py-2 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg min-h-[520px] text-left">
            
            {/* Quiz Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-stone-805 pb-5 mb-5">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-amber-700 dark:text-amber-500">
                  Avaliação Teórica • Nível {selectedLevel}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Teste seus Conhecimentos
                </h2>
              </div>
              <button
                onClick={() => setIsTakingQuiz(false)}
                id="quit-quiz-btn"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-850 text-slate-650 dark:text-stone-350 hover:bg-slate-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                Sair do Teste
              </button>
            </div>

            {isLoadingQuiz ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center my-auto">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-3" />
                <p className="text-xs text-slate-500 dark:text-stone-400">Carregando questões do quiz no SQLite...</p>
              </div>
            ) : quizError ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center max-w-md mx-auto my-auto animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-red-550/10 border border-red-500/20 flex items-center justify-center text-3xl mb-5 animate-pulse">
                  🔒
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Avaliação Bloqueada</h3>
                <p className="text-xs text-slate-500 dark:text-stone-400 mb-6 leading-relaxed">
                  Para garantir a fixação do seu aprendizado, há um período de bloqueio após uma reprovação na prova de nível. Revise as lições e tente novamente após o cronômetro!
                </p>
                
                {timeLeftStr && (
                  <div className="bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-2xl px-6 py-3 font-mono text-2xl font-bold tracking-wider text-amber-700 dark:text-amber-500 mb-6 animate-pulse inline-block">
                    {timeLeftStr}
                  </div>
                )}

                <div>
                  <button
                    onClick={() => setIsTakingQuiz(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-800 dark:text-stone-100 text-xs font-semibold rounded-xl border border-slate-205 transition cursor-pointer"
                  >
                    Voltar às Lições do Módulo
                  </button>
                </div>
              </div>
            ) : quizQuestions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center my-auto">
                <p className="text-xs text-slate-500 dark:text-stone-400">Nenhuma questão de avaliação cadastrada para este nível.</p>
              </div>
            ) : !quizFinished ? (
              /* Active quiz screen */
              <div className="flex-1 flex flex-col justify-between text-left">
                <div>
                  <div className="flex justify-between items-center mb-5 text-xs text-slate-500 dark:text-stone-400 font-mono">
                    <span>Questão {currentQuestionIdx + 1} de {quizQuestions.length}</span>
                    <span className="font-bold text-amber-700 dark:text-amber-500">
                      Pontuação Atual: {quizScore}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white mb-6 leading-snug">
                    {quizQuestions[currentQuestionIdx].question}
                  </h3>

                  <div className="space-y-3">
                    {quizQuestions[currentQuestionIdx].options.map((option: string, oIdx: number) => {
                      const isSelected = selectedOptionId === oIdx;
                      const isCorrectAnswer = quizQuestions[currentQuestionIdx].correctIndex === oIdx;
                      let optionStyle = "bg-slate-50 dark:bg-stone-950 border-slate-200 dark:border-stone-850 hover:bg-slate-100 dark:hover:bg-stone-800/80 text-slate-800 dark:text-stone-250";
                      
                      if (selectedOptionId !== null) {
                        if (isCorrectAnswer) {
                          optionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold";
                        } else if (isSelected) {
                          optionStyle = "bg-red-500/10 border-red-500 text-red-800 dark:text-red-300 font-bold";
                        } else {
                          optionStyle = "opacity-40 border-slate-200 dark:border-stone-900 bg-slate-50 dark:bg-stone-950/40 text-slate-400 dark:text-stone-605";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={selectedOptionId !== null}
                          onClick={() => handleOptionSelect(oIdx)}
                          className={`w-full p-4 rounded-2xl border text-left text-xs transition duration-150 flex items-center gap-3.5 cursor-pointer ${optionStyle}`}
                        >
                          <div className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 border ${
                            selectedOptionId !== null && isCorrectAnswer
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : selectedOptionId !== null && isSelected
                              ? "bg-red-500 border-red-600 text-white"
                              : "bg-slate-200 dark:bg-stone-905 text-slate-800 dark:text-stone-200 border-slate-300 dark:border-stone-800"
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="leading-snug flex-1">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showQuizExplanation && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-stone-950 border border-slate-150 dark:border-stone-850 rounded-2xl animate-fade-in text-left">
                      <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-1">
                        {selectedOptionId === quizQuestions[currentQuestionIdx].correctIndex 
                          ? "✓ Resposta Correta!" 
                          : "✗ Resposta Incorreta"}
                      </h5>
                      <p className="text-xs text-slate-650 dark:text-stone-300 leading-relaxed">
                        {quizQuestions[currentQuestionIdx].explanation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-stone-855 flex justify-end">
                  <button
                    disabled={selectedOptionId === null}
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-xl transition disabled:opacity-40 select-none shadow cursor-pointer border-0"
                  >
                    {currentQuestionIdx < quizQuestions.length - 1 ? "Próxima Questão" : "Finalizar Avaliação"}
                  </button>
                </div>
              </div>
            ) : (
              /* Celebration / results screen */
              (() => {
                const passThreshold = Math.ceil(quizQuestions.length * 0.65);
                const isPassed = quizScore >= passThreshold;
                return (
                  <div className="flex-1 flex flex-col justify-between text-center max-w-xl mx-auto py-6">
                    <div className="my-auto text-center flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-5 shadow-sm border animate-bounce ${
                        isPassed
                          ? "bg-emerald-500/10 border-emerald-300 text-emerald-500" 
                          : "bg-red-500/10 border-red-300 text-red-500"
                      }`}>
                        {isPassed ? "🏆" : "💪"}
                      </div>

                      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                        {isPracticeQuiz 
                          ? (isPassed ? "Excelente Treino Prático!" : "Bom Treino! Vale a Pena Rever")
                          : (isPassed ? "Parabéns! Você passou no Teste!" : "Quase lá! Vamos reforçar os estudos?")
                        }
                      </h3>
                      
                      <p className="text-xs text-slate-500 dark:text-stone-300 mt-2.5 max-w-sm mx-auto leading-relaxed">
                        {isPracticeQuiz
                          ? `No simulado de treino você obteve ${quizScore} acertos de ${quizQuestions.length} questões. Continue praticando para fazer o exame oficial!`
                          : isPassed
                          ? `Você obteve ${quizScore} acertos de ${quizQuestions.length} possíveis no exame oficial de nível ${selectedLevel}. Seu progresso foi gravado no SQLite!`
                          : `Você acertou ${quizScore} de ${quizQuestions.length} questões. É necessário obter ao menos ${passThreshold} acertos para a promoção. Revise as lições do nível e realize a prova novamente.`
                        }
                      </p>

                      {isPassed && !isPracticeQuiz && selectedLevel !== "Avançado" && (
                        <div className="mt-5 p-4 bg-slate-50 dark:bg-stone-950 border border-slate-150 dark:border-stone-850 rounded-2xl text-left text-xs max-w-md">
                          <div className="font-extrabold flex items-center gap-1.5 mb-1 text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                            NÍVEL PROMOVIDO!
                          </div>
                          <p className="text-slate-650 dark:text-stone-300 text-[11px] leading-relaxed">
                            Seu nível foi promovido de forma definitiva no SQLite para o próximo módulo <strong>({selectedLevel === "Iniciante" ? "Intermediário" : "Avançado"})</strong>. Prepare-se para lições ainda mais completas!
                          </p>
                        </div>
                      )}

                      {isPassed && !isPracticeQuiz && selectedLevel === "Avançado" && (
                        <div className="mt-5 p-4 bg-slate-50 dark:bg-stone-950 border border-slate-150 dark:border-stone-850 rounded-2xl text-left text-xs max-w-md">
                          <div className="font-extrabold flex items-center gap-1.5 mb-1 text-xs text-amber-700 dark:text-amber-500 font-mono">
                            <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
                            VIOLONISTA GRADUADO!
                          </div>
                          <p className="text-slate-655 dark:text-stone-300 text-[11px] leading-relaxed">
                            Você concluiu com maestria teorias harmônicas complexas, montagem de licks, e improvisações de alto nível. Você agora é oficialmente graduado!
                          </p>
                        </div>
                      )}

                      {isPracticeQuiz && (
                        <div className="mt-5 p-4 bg-slate-50 dark:bg-stone-950 border border-slate-150 dark:border-stone-850 rounded-2xl text-left text-xs max-w-md">
                          <div className="font-extrabold flex items-center gap-1.5 mb-1 text-xs text-amber-700 dark:text-amber-500 font-mono">
                            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                            MODO SIMULADO (TREINAMENTO)
                          </div>
                          <p className="text-slate-650 dark:text-stone-300 text-[11px] leading-relaxed">
                            Este foi um simulado de {selectedLevel} para testar seus conhecimentos sem travar sua conta em caso de erro. Use os simulados para estar 100% pronto antes da prova oficial!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-5 border-t border-slate-200 dark:border-stone-850 flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          setIsTakingQuiz(false);
                          if (isPassed && !isPracticeQuiz) {
                            if (selectedLevel === "Iniciante") {
                              setSelectedLevel("Intermediário");
                            } else if (selectedLevel === "Intermediário") {
                              setSelectedLevel("Avançado");
                            }
                          }
                        }}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-750 text-white text-xs font-bold rounded-xl transition cursor-pointer border-0"
                      >
                        Fechar e Conferir Grade
                      </button>
                      <button
                        onClick={() => startQuizFlow(isPracticeQuiz)}
                        className="px-5 py-2.5 border border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-slate-50 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-200 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Refazer Desafio
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* 2. LESSON DETAIL VIEW (Dedicated Screen/Page per Lesson Part) */}
      {!isTakingQuiz && activeLesson && (
        <div className="max-w-4xl mx-auto py-2 animate-fade-in text-left">
          
          {/* Navigation/Progress Top-Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-4.5 rounded-3xl shadow-sm text-left">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveLesson(null)}
                className="p-2 bg-slate-50 dark:bg-stone-950 hover:bg-slate-100 dark:hover:bg-stone-850 border border-slate-200 dark:border-stone-800 text-slate-650 dark:text-stone-300 rounded-xl transition flex items-center justify-center cursor-pointer font-bold text-xs"
                title="Voltar para a lista do módulo"
              >
                ← <span className="ml-1 text-[11px] font-extrabold uppercase tracking-wide">Grade</span>
              </button>
              <div>
                <span className="text-[9px] font-mono tracking-widest font-black uppercase text-amber-700 dark:text-amber-500 block leading-none mb-1">
                  Módulo {selectedLevel} • Aula {activeLesson.order} de {lessons.length}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-stone-105 leading-none">
                  {activeLesson.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleLessonComplete(activeLesson.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition cursor-pointer ${
                  completedLessons.includes(activeLesson.id)
                    ? "bg-green-500/10 border-green-300 text-green-700 dark:text-green-400"
                    : "bg-slate-50 dark:bg-stone-950 border-slate-205 dark:border-stone-800 text-slate-650 dark:text-stone-300 hover:bg-slate-100"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {completedLessons.includes(activeLesson.id) ? "Aula Concluída!" : "Marcar Conclusão"}
              </button>
            </div>
          </div>

          {/* Focused Lesson Content Card */}
          <div className="bg-white dark:bg-stone-900/40 border border-slate-220 dark:border-stone-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
            
            {/* Category tag */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-800 dark:text-amber-400 border border-amber-200/20">
                {activeLesson.category === "anatomy" && "Anatomia Instrumental"}
                {activeLesson.category === "posture" && "Ergonomia & Postura"}
                {activeLesson.category === "technique" && "Arpejo & Prática Rítmica"}
                {activeLesson.category === "theory" && "Fundação Teórica"}
              </span>
            </div>

            {/* Markdown detail translation parser */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-stone-250 text-sm md:text-[15px] leading-relaxed space-y-5">
              {activeLesson.contentMarkdown.split("\n\n").map((part, pIdx) => {
                if (part.startsWith("### ")) {
                  return (
                    <h4 key={pIdx} className="text-base md:text-lg font-black text-slate-900 dark:text-amber-200 mt-6 mb-3 border-b border-slate-100 dark:border-stone-850 pb-1.5 pt-1">
                      {part.substring(4)}
                    </h4>
                  );
                }
                if (part.startsWith("#### ")) {
                  return (
                    <h5 key={pIdx} className="text-sm md:text-base font-extrabold text-amber-800 dark:text-amber-400 mt-5 mb-2">
                      {part.substring(5)}
                    </h5>
                  );
                }
                if (part.startsWith("↓ ")) {
                  /* Custom visual strumming component */
                  const strokeArray = part.split("  ");
                  return (
                    <div key={pIdx} className="my-6 bg-amber-500/5 dark:bg-stone-950/45 border border-amber-600/15 dark:border-stone-800 p-5 rounded-2xl text-center">
                      <span className="text-[10px] text-amber-800 dark:text-amber-550 uppercase tracking-widest font-mono font-bold block mb-3 leading-none">
                        Treino Rítmico (Bata as unhas ou polegar)
                      </span>
                      <div className="flex justify-center items-center gap-3.5">
                        {strokeArray.map((stroke, sIdx) => {
                          const isDown = stroke.trim() === "↓";
                          return (
                            <div key={sIdx} className="flex flex-col items-center">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg border shadow-sm ${
                                isDown
                                  ? "bg-amber-805 text-stone-50 border-amber-900"
                                  : "bg-yellow-500 text-stone-950 border-yellow-600"
                              }`}>
                                {stroke}
                              </div>
                              <span className="text-[9px] font-mono mt-1 text-slate-500 font-bold">
                                {isDown ? "BAIXO" : "CIMA"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                
                if (part.startsWith("- ") || part.startsWith("1. ")) {
                  /* Custom lists representation */
                  const isOrdered = part.startsWith("1. ");
                  const listItems = part.split("\n");
                  return (
                    <ul key={pIdx} className={`space-y-2.5 my-3 ${isOrdered ? "list-decimal" : "list-disc"} list-inside pl-3`}>
                      {listItems.map((item, lIdx) => {
                        const cleanText = item.replace(/^(-\s||\d+\.\s)/, "");
                        return (
                          <li key={lIdx} className="text-slate-650 dark:text-stone-300">
                            {formatInlineMarkdown(cleanText)}
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                return (
                  <p key={pIdx} className="text-slate-650 dark:text-stone-300">
                    {formatInlineMarkdown(part)}
                  </p>
                );
              })}
            </div>

            {/* Note taking subcard with SQL storage */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-stone-800 text-left">
              <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-stone-100 flex items-center gap-2 mb-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                Diário de Conquistas e Dificuldades (SQLite)
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-stone-400 mb-3 leading-relaxed">
                Escreva anotações pessoais sobre esta lição para salvar suas correções, posicionamento de polegar ou velocidade que alcançou. O registro é persistido no banco de dados SQLite de forma contínua.
              </p>
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Exemplo: Preciso focar no abafado lateral para a pestana de Fá. Decorar padrão: desce, desce, sobe..."
                  className="w-full min-h-[100px] p-3 text-xs bg-slate-50 dark:bg-stone-950 border border-slate-20o dark:border-stone-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-stone-200"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 dark:text-stone-500 font-medium">
                    {saveSuccess ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold animate-pulse">✓ Notas guardadas com sucesso no SQLite!</span>
                    ) : "Banco de dados SQLite conectado"}
                  </span>
                  <button
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    id="save-lesson-note-btn"
                    className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer border-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingNote ? "Salvando..." : "Salvar Diário"}
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step footer pages button */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-stone-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-stone-500 font-medium text-center sm:text-left">
                Dedique ao menos 10 minutos de treino diário para esta lição!
              </span>

              <div className="flex gap-2">
                {activeLesson.order > 1 && (
                  <button
                    onClick={() => {
                      const prev = lessons.find(l => l.order === activeLesson.order - 1);
                      if (prev) {
                        setActiveLesson(prev);
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }
                    }}
                    id="lesson-prev-btn"
                    className="px-4 py-2 rounded-xl text-xs font-extrabold border border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-slate-650 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Aula Anterior
                  </button>
                )}

                {activeLesson.order < lessons.length ? (
                  <button
                    onClick={() => {
                      completeLessonAndGoToNext(activeLesson.id);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    id="lesson-next-btn"
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-800 hover:bg-amber-900 text-white shadow cursor-pointer border-0"
                  >
                    Avançar Próxima
                  </button>
                ) : (
                  <div className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 px-3.5 py-2 rounded-xl border border-emerald-200/50">
                    Módulo Concluído! 🎉
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. MODULE DASHBOARD VIEW (Landing page list of lessons) */}
      {!isTakingQuiz && !activeLesson && (
        <div className="space-y-6 md:space-y-8 animate-fade-in text-left">
          
          {/* Module Level Selector Tab */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-5 rounded-3xl shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest block font-mono">
                Selecione o Grau de Ensino
              </span>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-stone-50 mt-1">
                Progresso Teórico-Prático por Níveis
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-stone-950 p-1.5 rounded-2xl border border-slate-205 dark:border-stone-850 w-full md:w-auto md:min-w-[420px]">
              {["Iniciante", "Intermediário", "Avançado"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedLevel(lvl);
                    setQuizError(null);
                    setBlockedUntil(null);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-extrabold tracking-wide transition cursor-pointer select-none text-center ${
                    selectedLevel === lvl
                      ? "bg-white dark:bg-stone-800 text-amber-850 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-stone-750"
                      : "text-slate-400 dark:text-stone-500 hover:text-slate-650 dark:hover:text-stone-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Area: Progress Indicator Card & Evaluation Quiz Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Class Stats Module Card (7/12 width) */}
            <div className="md:col-span-7 bg-gradient-to-br from-amber-900 to-amber-950 p-6 rounded-3xl text-stone-100 shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-205/85 font-mono">
                      Seu Plano Curricular
                    </span>
                    <h4 className="font-black text-xl mt-0.5">Estudos de Categoria: {selectedLevel}</h4>
                  </div>
                  <Award className="w-6 h-6 text-yellow-400 rotate-6" />
                </div>
                <p className="text-xs text-amber-100/80 mb-6 leading-relaxed">
                  Ganhe coordenação nos dedos das duas mãos, leia diagramas de cifras com perfeição e pratique ritmos. Finalize todas as lições para destravar a prova teórica e certificar seu andamento no violão.
                </p>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-xs text-amber-200">
                  <span>Conclusão do Módulo</span>
                  <span className="font-bold">{currentCompleteness}% ({completedInLevelCount} de {lessons.length} aulas)</span>
                </div>
                <div className="w-full bg-amber-955/65 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${currentCompleteness}%` }}
                  />
                </div>
                {currentCompleteness === 100 && (
                  <div className="mt-4 p-3 bg-yellow-400/10 rounded-xl border border-yellow-400/25 flex gap-2 items-center text-[11px] text-yellow-300 font-semibold">
                    <Sparkles className="w-4 h-4 shrink-0 animate-bounce" />
                    <span>Todas as aulas concluídas! Faça a Prova de Nível para certificar.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Exam / Level Challenger Card (5/12 width) */}
            <div className="md:col-span-5 bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-500 font-mono block">
                    Avaliações & Questionários
                  </span>
                </div>
                
                <h4 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-stone-100 leading-tight">
                  Questionário de {selectedLevel}
                </h4>
                
                <p className="text-[11px] text-slate-500 dark:text-stone-400 mt-2 leading-relaxed">
                  Avalie seus conhecimentos com questões sobre acordes, pestanas, dedilhados e teoria prática. Você pode treinar livremente com o Simulado de Treino ou testar sua tese no Exame Oficial!
                </p>

                {bestQuizResult ? (
                  <div className={`mt-4 p-2.5 rounded-2xl border text-[11px] ${
                    bestQuizResult.passed 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-450" 
                      : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-450"
                  }`}>
                    <div className="font-bold flex justify-between items-center">
                      <span>Resultado Exame Oficial:</span>
                      <span className="font-black font-mono">
                        {bestQuizResult.score}/{bestQuizResult.total} ({bestQuizResult.passed ? "Aprovado" : "Reprovado"})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-2 text-center bg-slate-50 dark:bg-stone-950 border border-slate-150 dark:border-stone-850/60 rounded-xl text-[10px] text-slate-400 dark:text-stone-500">
                    Nenhuma tentativa oficial registrada ainda.
                  </div>
                )}
              </div>

              <div className="mt-4.5 pt-1.5 border-t border-slate-100 dark:border-stone-850 flex flex-col gap-2">
                {/* 1. Practice Quiz Button (Unrestricted) */}
                <button
                  onClick={() => startQuizFlow(true)}
                  id="start-practice-quiz-btn"
                  className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-stone-950 dark:border-stone-800 dark:hover:bg-stone-800 text-slate-800 dark:text-stone-100 rounded-xl text-[11px] font-extrabold tracking-wide transition text-center shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                  Iniciar Simulado (Treino Aberto)
                </button>

                {/* 2. Official Promotion Quiz (Locked unless lessons complete) */}
                <button
                  onClick={() => startQuizFlow(false)}
                  disabled={!isLevelFullyCompleted}
                  id="start-level-quiz-btn"
                  className={`w-full py-2.5 text-stone-50 dark:text-stone-950 rounded-xl text-[11px] font-black tracking-wide transition text-center shadow flex items-center justify-center gap-1.5 border-0 ${
                    isLevelFullyCompleted 
                      ? "bg-amber-850 hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-500 cursor-pointer" 
                      : "bg-slate-200 dark:bg-stone-800 text-slate-400 dark:text-stone-550 cursor-not-allowed opacity-60"
                  }`}
                >
                  {isLevelFullyCompleted ? <Award className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {isLevelFullyCompleted 
                    ? (bestQuizResult ? "Refazer Prova Oficial" : "Iniciar Prova Oficial de Nível")
                    : "Prova Oficial Bloqueada"
                  }
                </button>
                {!isLevelFullyCompleted && (
                  <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-1 text-center font-bold font-mono">
                    ⚠️ Requisito: Concluir {completedInLevelCount}/{lessons.length} aulas.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Seletor do Modo de Estudo (Aulas Escritas ou Vídeos) */}
          <div className="flex border-b border-slate-205 dark:border-stone-800 pb-0.5 justify-start gap-6 mb-4">
            <button
              onClick={() => setStudyMode("written")}
              className={`pb-3 px-1 text-xs font-black tracking-wide transition relative cursor-pointer border-0 bg-transparent ${
                studyMode === "written"
                  ? "text-amber-805 dark:text-amber-450 border-b-2 border-amber-600 dark:border-amber-500 font-extrabold"
                  : "text-slate-400 dark:text-stone-500 hover:text-slate-650 dark:hover:text-stone-300"
              }`}
            >
              <span className="flex items-center gap-2 select-none">
                <BookOpen className="w-4 h-4" />
                1. Aulas Escritas & Desafios
              </span>
            </button>
            <button
              onClick={() => {
                setStudyMode("questions");
              }}
              className={`pb-3 px-1 text-xs font-black tracking-wide transition relative cursor-pointer border-0 bg-transparent ${
                studyMode === "questions"
                  ? "text-amber-805 dark:text-amber-450 border-b-2 border-amber-600 dark:border-amber-500 font-extrabold"
                  : "text-slate-400 dark:text-stone-500 hover:text-slate-650 dark:hover:text-stone-300"
              }`}
            >
              <span className="flex items-center gap-2 select-none">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                2. Dúvidas do Nível & Explicações
                <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                  Novo
                </span>
              </span>
            </button>
          </div>

          {studyMode === "written" && (
            <>
              {/* Desafios de Nível Interativos */}
              <div style={{ backgroundColor: "#000000" }} className="bg-slate-50 dark:bg-stone-905 border border-slate-205 dark:border-stone-850/60 p-6 rounded-3xl text-left shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-250/60 dark:border-stone-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                  Gamificação & Treino Técnico
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-black text-slate-900 dark:text-stone-50">
                      🎯 Desafios Práticos de Nível: {selectedLevel}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm">
                      <Clock className="w-3 h-3 text-amber-500 shrink-0 animate-pulse" /> Desafios Diários
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                    Execute essas tarefas práticas no seu violão real para sedimentar o conhecimento e acumular XP. Novos desafios são <span className="font-bold text-amber-600 dark:text-amber-400">gerados automaticamente todo dia</span> às 00:00!
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-stone-950 border border-slate-200 dark:border-stone-800 px-4 py-2.5 rounded-2xl flex flex-col items-center min-w-[150px] shrink-0">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
                  <span className="text-xs font-black text-slate-900 dark:text-stone-200">
                    {LEVEL_CHALLENGES.filter(c => c.level === selectedLevel).filter(c => completedChallenges.includes(c.id)).length}/3 Concluídos
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-stone-900 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(LEVEL_CHALLENGES.filter(c => c.level === selectedLevel).filter(c => completedChallenges.includes(c.id)).length / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {LEVEL_CHALLENGES.filter(c => c.level === selectedLevel).map((ch) => {
                const isDone = completedChallenges.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    id={`challenge-card-${ch.id}`}
                    onClick={() => toggleChallengeComplete(ch.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-stone-100 dark:bg-emerald-950/15"
                        : "bg-white dark:bg-stone-950 border-slate-200 dark:border-stone-850 hover:border-amber-600/50 dark:hover:border-amber-500/40"
                    }`}
                  >
                    <div>
                      {/* Challenge Icon Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-stone-900 border border-amber-200/50 dark:border-stone-800 flex items-center justify-center">
                          {ch.icon === "target" && <Target className="w-4 h-4 text-amber-700 dark:text-amber-500" />}
                          {ch.icon === "music" && <Music className="w-4 h-4 text-amber-700 dark:text-amber-500" />}
                          {ch.icon === "activity" && <Activity className="w-4 h-4 text-amber-700 dark:text-amber-500" />}
                          {ch.icon === "sparkles" && <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-500" />}
                          {ch.icon === "award" && <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
                        </div>
                        <span className="text-[9px] font-mono font-extrabold text-amber-850 dark:text-amber-400 bg-amber-50 dark:bg-amber-955 px-2 py-0.5 rounded border border-amber-200/45 dark:border-amber-900/30 uppercase tracking-widest leading-none">
                          +{ch.rewardXP} XP
                        </span>
                      </div>

                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                        {ch.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                        {ch.description}
                      </p>
                      
                      <div className="mt-3 p-2 bg-slate-50 dark:bg-stone-900/60 rounded-xl border border-dashed border-slate-150 dark:border-stone-850/80">
                        <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-stone-500 font-mono block mb-0.5">Objetivo Técnico:</span>
                        <p className="text-[10px] text-slate-650 dark:text-stone-300 italic leading-snug">"{ch.objective}"</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-stone-900 flex justify-between items-center gap-2">
                      <span className="text-[9px] text-slate-400 dark:text-stone-500 font-mono italic max-w-[70%] leading-none truncate" title={ch.tip}>
                        Dica: {ch.tip}
                      </span>
                      
                      <button
                        type="button"
                        className="bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
                        title={isDone ? "Desmarcar desafio" : "Marcar conclusão"}
                      >
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            <Check className="w-3.5 h-3.5" /> Feito
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-stone-550 font-mono">
                            <Circle className="w-3.5 h-3.5" /> Cumprir
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid list of unique Lesson pages (Parts) */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-stone-800 pb-3 text-left">
              <h4 className="text-base font-black text-slate-900 dark:text-stone-100 uppercase tracking-wide">
                Lições e Partes do Módulo ({lessons.length})
              </h4>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">
                Explore individualmente cada lição prática clicando nos cards. Suas notas e progresso ficam gravados no SQLite local.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {isLoading ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-stone-900/20 border border-dashed border-slate-200 dark:border-stone-800 rounded-3xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 dark:text-stone-400 font-semibold font-mono">Carregando plano do SQLite...</p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-stone-900/20 border border-dashed border-slate-200 dark:border-stone-800 rounded-3xl">
                  <BookOpen className="w-10 h-10 text-slate-350 dark:text-stone-750 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-stone-400">Nenhuma parte cadastrada para o nível {selectedLevel}.</p>
                </div>
              ) : (
                lessons.map((les) => {
                  const isCompleted = completedLessons.includes(les.id);
                  return (
                    <div
                      key={les.id}
                      id={`lesson-card-${les.id}`}
                      onClick={() => {
                        setActiveLesson(les);
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="group bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-5 rounded-3xl md:hover:border-amber-600 dark:md:hover:border-amber-700/60 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between text-left min-h-[170px]"
                    >
                      <div>
                        {/* Header card state */}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-stone-950 rounded text-slate-500 dark:text-stone-400 border border-slate-200/40 dark:border-stone-850">
                            Parte {les.order}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonComplete(les.id);
                            }}
                            className="bg-transparent border-0 focus:outline-none p-0 cursor-pointer"
                            title={isCompleted ? "Concluída! Reabrir" : "Marcar Conclusão"}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 fill-green-100 dark:fill-green-950/20" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 dark:text-stone-800 hover:text-amber-700 transition" />
                            )}
                          </button>
                        </div>

                        <h5 className="font-extrabold text-sm text-slate-905 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition duration-150 line-clamp-1">
                          {les.title}
                        </h5>
                        
                        <p className="text-xs text-slate-500 dark:text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                          {les.description}
                        </p>
                      </div>

                      {/* Info footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-stone-850/60 flex justify-between items-center">
                        <span className="text-[9px] font-mono font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">
                          {les.category === "anatomy" && "Anatomia"}
                          {les.category === "posture" && "Postura"}
                          {les.category === "technique" && "Rítmica/Técnica"}
                          {les.category === "theory" && "Teoria Musical"}
                        </span>
                        
                        <span className="text-[11px] text-slate-400 dark:text-stone-500 font-extrabold group-hover:text-slate-800 dark:group-hover:text-stone-300 transition duration-150 flex items-center gap-0.5 font-mono">
                          Entrar →
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          </>
          )}

          {studyMode === "questions" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-left">
              
              {/* Left Column: Form to submit your own doubts */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="border-b border-slate-100 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2 text-rose-500 mb-1">
                      <HelpCircle className="w-5 h-5 animate-pulse" />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest block">
                        Dúvidas Rápidas • {selectedLevel}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 dark:text-stone-100">
                      O que você não entendeu?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 leading-relaxed">
                      Se algum conceito, acorde ou ritmo desse nível ficou confuso, envie sua pergunta para os professores e comunidade!
                    </p>
                  </div>

                  <form onSubmit={handleQuestionSubmit} className="space-y-4 font-sans">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-stone-300 uppercase tracking-wider block">
                        Assunto / Título
                      </label>
                      <input
                        type="text"
                        value={questionTitle}
                        onChange={(e) => setQuestionTitle(e.target.value)}
                        placeholder="Ex: Não consigo soar a nota Sol na 3ª corda..."
                        className="w-full p-3 rounded-xl border border-slate-205 dark:border-stone-850 dark:bg-stone-950 dark:text-stone-105 placeholder-slate-400 dark:placeholder-stone-605 text-xs focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-stone-300 uppercase tracking-wider block">
                        Detalhes da sua dúvida
                      </label>
                      <textarea
                        value={questionContent}
                        onChange={(e) => setQuestionContent(e.target.value)}
                        placeholder="Descreva com detalhes o que está acontecendo ao praticar no seu violão..."
                        className="w-full h-32 p-3 rounded-xl border border-slate-205 dark:border-stone-850 dark:bg-stone-950 dark:text-stone-105 placeholder-slate-400 dark:placeholder-stone-605 text-xs focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 focus:outline-none transition resize-none"
                      />
                    </div>

                    {questionSubmitError && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-bold block bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                        {questionSubmitError}
                      </p>
                    )}

                    {questionSubmitSuccess && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        ✓ Dúvida enviada com sucesso! Ela foi cadastrada no SQLite e agora aparece na lista!
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingQuestion}
                      className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center justify-center gap-2 border-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmittingQuestion ? "Enviando para o SQLite..." : "Enviar Pergunta"}
                    </button>
                  </form>
                </div>

                <div className="p-5 bg-amber-50/50 dark:bg-amber-955/10 rounded-3xl border border-dashed border-amber-250/50 dark:border-amber-900/40 text-left text-xs leading-relaxed">
                  <span className="font-extrabold text-amber-900 dark:text-amber-400 block mb-1">💡 Dica Prática de Aprendizado:</span>
                  <p className="text-slate-650 dark:text-stone-300 text-[11px]">
                    Não sinta vergonha de perguntar de forma descritiva! A comunidade de violonistas evolui mais rápido compartilhando licks, shapes de acordes e soluções para barreiras como a bendita pestana.
                  </p>
                </div>
              </div>

              {/* Right Column: Q&A List with video explanations */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border-b border-slate-100 dark:border-stone-850 pb-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-slate-905 dark:text-stone-100 uppercase tracking-wide flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-550" />
                      Dúvidas da Comunidade ({studentQuestions.length})
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                      Perguntas respondidas em texto e em vídeos explicativos detalhados para o nível {selectedLevel}.
                    </p>
                  </div>
                  <button 
                    onClick={loadStudentQuestions}
                    className="p-1 px-3.5 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-755 dark:text-stone-200 rounded-lg hover:text-slate-900 border-0 transition font-bold cursor-pointer"
                  >
                    Atualizar
                  </button>
                </div>

                {isLoadingQuestions ? (
                  <div className="text-center py-20 bg-white dark:bg-stone-900/20 border border-dashed border-slate-202 dark:border-stone-800 rounded-3xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 dark:text-stone-400 font-semibold font-mono">Buscando fórum no SQLite...</p>
                  </div>
                ) : studentQuestions.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-stone-900/20 border border-dashed border-slate-202 dark:border-stone-800 rounded-3xl">
                    <HelpCircle className="w-10 h-10 text-slate-350 dark:text-stone-750 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-stone-400">Nenhuma dúvida enviada neste nível ainda. Seja o primeiro!</p>
                  </div>
                ) : (
                  studentQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-850 p-5 rounded-3xl shadow-sm text-left space-y-4 hover:border-emerald-500/30 transition-all font-sans"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-stone-950 text-slate-500 dark:text-stone-400 px-2.5 py-0.5 rounded border border-slate-200/50 dark:border-stone-850">
                            ID #{q.id} • Por {q.user_email || "Aluno"}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-stone-500">
                            {q.created_at ? new Date(q.created_at).toLocaleDateString("pt-BR") : ""}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white pt-1">
                          {q.title}
                        </h5>
                        <p className="text-xs text-slate-650 dark:text-stone-300 leading-relaxed font-sans bg-slate-50/60 dark:bg-stone-950 p-3 rounded-xl border border-slate-105 dark:border-stone-850/60">
                          {q.question}
                        </p>
                      </div>

                      {q.answer ? (
                        /* Has response */
                        <div className="pt-3 border-t border-slate-100 dark:border-stone-850 space-y-3.5">
                          <div className="pl-3.5 border-l-2 border-emerald-500 space-y-1">
                            <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                              Resposta do Instrutor
                            </span>
                            <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed">
                              {q.answer}
                            </p>
                          </div>

                          {q.video_url && (
                            /* Has explanatory video */
                            <div className="bg-slate-50 dark:bg-stone-955/30 p-3.5 border border-slate-202 dark:border-stone-850 rounded-2xl space-y-2.5">
                              <span className="text-[10px] font-black text-rose-600 dark:text-rose-450 uppercase tracking-wider flex items-center gap-1">
                                <Video className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                Vídeo Explicativo Recomendado:
                              </span>
                              <h6 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {q.video_title || "Como praticar este tema"}
                              </h6>
                              
                              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-stone-800 shadow-sm">
                                <iframe
                                  src={q.video_url}
                                  title={q.video_title}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  referrerPolicy="no-referrer"
                                  className="absolute inset-0 w-full h-full"
                                ></iframe>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* No response yet */
                        <div className="pt-3 border-t border-dashed border-slate-200 dark:border-stone-850/60 text-left">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-500/10 dark:bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                            ⏳ Aguardando a conferência e resposta do professor...
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

// Simple Helper to handle bold (**), italic (*), etc. in inline lesson text
function formatInlineMarkdown(text: string) {
  const parts = [];
  let index = 0;

  // Let's replace simple markdown notations
  // Matches **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-bold text-amber-950 dark:text-amber-400 text-slate-900">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Returns formatted or plain text
  return parts.length > 0 ? parts : text;
}
