import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Clock, 
  CheckCircle, 
  Award, 
  PlusCircle, 
  Calendar, 
  BookOpen, 
  LineChart, 
  TrendingUp, 
  HelpCircle,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Brain,
  FileDown,
  Download,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";

interface PerformanceTabProps {
  currentUser: any;
}

interface PracticeSession {
  id: number;
  session_date: string;
  duration_minutes: number;
  focus_area: string;
  notes: string;
  difficulty: string;
}

interface PerformanceSummary {
  lessonsCount: number;
  completedLessonsCount: number;
  completedChallengesCount: number;
  totalPracticeMinutes: number;
  activePracticeDays: number;
  averageQuizScorePct: number;
  examsPassed: number;
  streak: number;
  focusStats: { focusArea: string; minutes: number }[];
  difficultyStats: { difficulty: string; count: number }[];
  recentSessions: PracticeSession[];
}

export default function PerformanceTab({ currentUser }: PerformanceTabProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // PDF option states
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfHistory, setPdfHistory] = useState<any[]>([]);

  // Form states
  const [duration, setDuration] = useState<number>(20);
  const [focusArea, setFocusArea] = useState<string>("Acordes");
  const [difficulty, setDifficulty] = useState<string>("Iniciante");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    fetchPerformanceData();
    fetchPdfHistory();
  }, [currentUser]);

  const fetchPdfHistory = async () => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch(`/api/pdf-download/history?email=${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        setPdfHistory(data.history || []);
      }
    } catch (e) {
      console.error("Erro ao buscar histórico de PDFs:", e);
    }
  };

  const fetchPerformanceData = async () => {
    if (!currentUser?.email) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/performance/summary?email=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      if (res.ok && data.summary) {
        setSummary(data.summary);
      } else {
        setErrorMessage(data.error || "Erro ao carregar dados de evolução.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Erro de rede ao carregar evolução.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentUser?.email || !summary) return;
    setDownloadingPdf(true);
    try {
      const doc = new jsPDF();
      
      // Theme colors
      const primaryColor = [30, 41, 59]; // Slate (dark background / titles)
      const accentColor = [217, 119, 6];  // Amber (primary contrast)
      
      // Page setup & title
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, "F");
      
      // Studio Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("GUITAR STUDIO", 15, 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Relatorio Oficial de Evolucao Musical e Pratica", 15, 26);
      
      const today = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      doc.setFontSize(9);
      doc.text(`Gerado em: ${today}`, 150, 18);
      
      // User Profile details
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("DADOS DO ESTUDANTE", 15, 52);
      
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(0.5);
      doc.line(15, 55, 195, 55);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      
      doc.text(`Nome do Aluno: ${currentUser.username || "Usuario"}`, 15, 62);
      doc.text(`E-mail Registrado: ${currentUser.email}`, 15, 68);
      
      const levelLabel = summary.averageQuizScorePct >= 80 ? "Avancado" : summary.averageQuizScorePct >= 50 ? "Intermediario" : "Iniciante";
      doc.text(`Nivel Teorico Atual: ${levelLabel}`, 115, 62);
      doc.text(`Streak de Treino: ${summary.streak} dias seguidos`, 115, 68);
      
      // Key Performance metrics
      doc.setFillColor(248, 250, 252); // soft slate bg
      doc.rect(15, 75, 180, 28, "F");
      
      // Horizontal dividers for metrics
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      doc.text("TEMPO TOTAL DE PRATICA", 20, 83);
      doc.text("AULAS CONCLUIDAS", 85, 83);
      doc.text("EXAMES CONCLUIDOS", 145, 83);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`${summary.totalPracticeMinutes} min`, 20, 95);
      doc.text(`${summary.completedLessonsCount} / ${summary.lessonsCount}`, 85, 95);
      doc.text(`${summary.examsPassed} (${summary.averageQuizScorePct}% acertos)`, 145, 95);
      
      // Focus Distribution
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("DISTRIBUICAO DE FOCO DOS TREINOS (MINUTOS)", 15, 115);
      doc.line(15, 118, 195, 118);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      
      let currentY = 125;
      if (summary.focusStats.length === 0) {
        doc.text("Nenhuma sessao de treino registrada ainda para visualizar graficos.", 15, currentY);
        currentY += 10;
      } else {
        summary.focusStats.forEach((f) => {
          const pct = Math.round((f.minutes / (summary.totalPracticeMinutes || 1)) * 100);
          doc.text(`* ${f.focusArea}: ${f.minutes} minutos (${pct}%)`, 20, currentY);
          currentY += 6;
        });
      }
      
      // Recent Practice Logs
      currentY += 5;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("HISTORICO RECENTE DE SESSOES (REGISTRADAS NO SQLite)", 15, currentY);
      doc.line(15, currentY + 3, 195, currentY + 3);
      currentY += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      if (summary.recentSessions.length === 0) {
        doc.text("Sem sessoes de pratica registradas no historico recente.", 15, currentY);
        currentY += 8;
      } else {
        // Render headings
        doc.setFont("helvetica", "bold");
        doc.text("Data", 15, currentY);
        doc.text("Foco Praticado", 45, currentY);
        doc.text("Duracao", 100, currentY);
        doc.text("Nivel", 125, currentY);
        doc.text("Anotacoes do Aluno", 150, currentY);
        
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(15, currentY + 2, 195, currentY + 2);
        currentY += 7;
        
        doc.setFont("helvetica", "normal");
        summary.recentSessions.slice(0, 8).forEach((session) => {
          doc.text(session.session_date, 15, currentY);
          doc.text(session.focus_area, 45, currentY);
          doc.text(`${session.duration_minutes}m`, 100, currentY);
          doc.text(session.difficulty, 125, currentY);
          
          const truncatedNotes = session.notes && session.notes.length > 25 
            ? session.notes.substring(0, 22) + "..."
            : session.notes || "-";
          doc.text(truncatedNotes, 150, currentY);
          currentY += 6;
        });
      }
      
      // AI recommendations box
      currentY += 5;
      doc.setFillColor(245, 243, 255); // light purple
      doc.rect(15, currentY, 180, 25, "F");
      
      doc.setTextColor(109, 40, 217); // purple
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("RECOMENDACOES PERSONALIZADAS DOS PROFESSORES:", 20, currentY + 7);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(76, 29, 149);
      
      const recs = getAIRecommendations();
      const firstRecText = recs.length > 0 ? `${recs[0].title}: ${recs[0].desc}` : "Continue praticando diariamente!";
      const cleanRecText = firstRecText.length > 90 ? firstRecText.substring(0, 87) + "..." : firstRecText;
      doc.text(cleanRecText, 20, currentY + 14);
      
      const secondRecText = recs.length > 1 ? `${recs[1].title}: ${recs[1].desc}` : "A constancia e a chave para obter precisao de timbre!";
      const cleanSecondRecText = secondRecText.length > 90 ? secondRecText.substring(0, 87) + "..." : secondRecText;
      doc.text(cleanSecondRecText, 20, currentY + 20);
      
      // Footer signature
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      const year = new Date().getFullYear();
      doc.text(`Studio de Violao Guitar Studio ${year} - Todos os direitos reservados.`, 60, 285);
      
      // Save it locally
      const cleanUsername = (currentUser?.username || "aluno").replace(/\s+/g, "_");
      doc.save(`Evolucao_Guitar_Studio_${cleanUsername}.pdf`);
      
      // Record download audit in database
      await fetch("/api/pdf-download/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          downloadType: "Relatório de Evolução"
        })
      });
      
      // Refresh download logs history list
      fetchPdfHistory();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleRegisterSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/performance/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          durationMinutes: duration,
          focusArea,
          notes,
          difficulty
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Parabéns! Sua sessão de prática foi salva com sucesso.");
        // Reset states
        setDuration(20);
        setFocusArea("Acordes");
        setDifficulty("Iniciante");
        setNotes("");
        setShowLogForm(false);
        // Reload data
        fetchPerformanceData();
      } else {
        setErrorMessage(data.error || "Houve um erro ao registrar sua prática.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Falha de rede ao se comunicar com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  // Recommendations built with data rules
  const getAIRecommendations = () => {
    if (!summary) return [];
    const recommendations: { title: string; desc: string; type: "warning" | "success" | "info" }[] = [];

    // Rule 1: Lesson completion
    const lessonPct = summary.lessonsCount > 0 ? (summary.completedLessonsCount / summary.lessonsCount) * 100 : 0;
    if (lessonPct < 30) {
      recommendations.push({
        title: "Inicie lições de teoria e prática",
        desc: "Você completou menos de 30% das aulas. Estude os tutoriais passo a passo na aba de Lições para dominar seu violão.",
        type: "info"
      });
    }

    // Rule 2: Balance of focus area
    const chordTime = summary.focusStats.find(f => f.focusArea === "Acordes")?.minutes || 0;
    const beatTime = summary.focusStats.find(f => f.focusArea === "Batidas")?.minutes || 0;
    const pluckTime = summary.focusStats.find(f => f.focusArea === "Dedilhado")?.minutes || 0;

    if (chordTime > 0 && beatTime === 0) {
      recommendations.push({
        title: "Pratique Batidas e Ritmos",
        desc: "Você já treinou bastante seus acordes, mas ainda não logou treinos de Batidas. Use o repertório ou afinador para sincronizar suas mãos!",
        type: "warning"
      });
    }

    if (summary.totalPracticeMinutes > 0 && summary.totalPracticeMinutes < 100) {
      recommendations.push({
        title: "Construa seu hábito diário",
        desc: "Tocar violão exige consistência física. Estudar 15 minutos todos os dias é muito melhor que praticar 2 horas em um só dia da semana.",
        type: "info"
      });
    }

    if (summary.streak >= 3) {
      recommendations.push({
        title: "Sequência imbatível!",
        desc: `Você está com ${summary.streak} dias seguidos de dedicação. Suas pontas dos dedos e memória muscular estão se fortalecendo rápido!`,
        type: "success"
      });
    }

    // Default if empty
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Bons Ventos na Música!",
        desc: "Continue utilizando o afinador de ouvido e o metrônomo para garantir precisão rítmica perfeita e aumentar sua evolução natural.",
        type: "success"
      });
    }

    return recommendations;
  };

  if (loading) {
    return (
      <div id="loading-performance" className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-mono font-bold uppercase animate-pulse">
          Sintonizando estatísticas de evolução...
        </p>
      </div>
    );
  }

  const recommendations = getAIRecommendations();
  const completedPct = summary ? Math.round((summary.completedLessonsCount / (summary.lessonsCount || 1)) * 100) : 0;

  // Calculing colors for pie/bar heights
  const maxMinutes = summary && summary.focusStats.length > 0 
    ? Math.max(...summary.focusStats.map(f => f.minutes)) 
    : 1;

  return (
    <div id="performance-tab-root" className="space-y-8 animate-fade-in text-slate-850 dark:text-stone-100">
      
      {/* Header and Quick action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-900 to-amber-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <LineChart className="w-64 h-64" fill="currentColor" />
        </div>
        
        <div className="z-10">
          <div className="flex items-center gap-2 mb-2 bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-amber-500/20 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            Estatísticas de Prática e Progresso
          </div>
          <h1 className="text-3xl font-black font-mono tracking-tight text-stone-50">
            Minha Evolução Musical
          </h1>
          <p className="text-xs text-amber-100/80 mt-1 max-w-xl leading-relaxed">
            Monitore seu tempo de treino, confira taxas de aproveitamento nos exames teóricos, acompanhe seu streak de prática e domine o violão com métricas detalhadas.
          </p>
        </div>

        <div id="performance-actions" className="flex flex-wrap md:flex-nowrap gap-2.5 z-10 shrink-0">
          <button
            onClick={() => {
              setShowLogForm(!showLogForm);
              setSuccessMessage("");
              setErrorMessage("");
            }}
            id="toggle-log-practice-btn"
            className="py-3 px-5 bg-white hover:bg-slate-50 dark:bg-stone-900 hover:dark:bg-stone-850 text-amber-900 dark:text-amber-400 font-extrabold text-xs rounded-2xl shadow transition duration-200 flex items-center gap-2 border-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            Registrar Treino Diário
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf || !summary}
            id="download-progress-pdf-btn"
            className="py-3 px-5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-2xl shadow transition duration-200 flex items-center gap-2 border-0 cursor-pointer disabled:opacity-50"
          >
            {downloadingPdf ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-white" />
            )}
            Download PDF de Evolução
          </button>
        </div>
      </div>

      {/* New Practice Log Modal / Sub-section */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-stone-900 border border-amber-500/20 shadow-lg rounded-3xl p-6 relative">
              <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Registrar Nova Sessão de Treino no Banco de Dados
              </h3>

              <form onSubmit={handleRegisterSession} id="register-practice-form" className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. Practice duration */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider block font-mono">
                    Duração da Prática ({duration} minutos)
                  </label>
                  <div className="flex gap-2">
                    {[10, 20, 30, 45, 60].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setDuration(t)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                          duration === t
                            ? "bg-amber-800 text-white shadow-sm"
                            : "bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-stone-950 dark:border-stone-800 dark:hover:bg-stone-800 text-slate-650 dark:text-stone-400"
                        }`}
                      >
                        {t}m
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-stone-500 font-mono">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>

                {/* 2. Focus Area */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider block font-mono">
                    Área Principal de Foco
                  </label>
                  <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl text-xs text-slate-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Acordes">🎸 Acordes / Transições</option>
                    <option value="Batidas">🥁 Batidas e Ritmo</option>
                    <option value="Dedilhado">🎶 Dedilhados</option>
                    <option value="Teoria">📖 Teoria / Teclagem</option>
                    <option value="Afinador">🔊 Treino de Ouvido / Afinador</option>
                    <option value="Metrônomo">⚙️ Exercício Geral / Metrônomo</option>
                  </select>
                </div>

                {/* 3. Self-assessed Difficulty */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider block font-mono">
                    Autoavaliação de Dificuldade
                  </label>
                  <div className="flex gap-2">
                    {[
                      { val: "Iniciante", label: "Fácil" },
                      { val: "Intermediário", label: "Médio" },
                      { val: "Avançado", label: "Difícil" }
                    ].map((d) => (
                      <button
                        type="button"
                        key={d.val}
                        onClick={() => setDifficulty(d.val)}
                        className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition border ${
                          difficulty === d.val
                            ? d.val === "Iniciante" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500 dark:text-emerald-400"
                              : d.val === "Intermediário" ? "bg-amber-500/10 text-amber-700 border-amber-500 dark:text-amber-400"
                              : "bg-rose-500/10 text-rose-700 border-rose-500 dark:text-rose-400"
                            : "bg-slate-50 border-slate-200 dark:bg-stone-950 dark:border-stone-800 text-slate-500 dark:text-stone-400"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Notes content */}
                <div className="md:col-span-12 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider block font-mono">
                    Anotações Opcionais de Progresso (Dificuldades encontradas, descobertas...)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tive um pouco de atraso na transição do G para o C, preciso relaxar o polegar. Usei o metrônomo em 80 BPM."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl text-xs text-slate-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Return validation responses */}
                {(errorMessage || successMessage) && (
                  <div className="md:col-span-12 font-semibold">
                    {errorMessage && (
                      <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-800 dark:text-red-400 rounded-xl text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        {errorMessage}
                      </div>
                    )}
                    {successMessage && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-400 rounded-xl text-[11px] flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        {successMessage}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions submit */}
                <div className="md:col-span-12 flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    className="py-2.5 px-4 bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-200 text-xs font-bold rounded-xl transition cursor-pointer border-0 shadow-sm"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2.5 px-6 bg-amber-800 hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer border-0 shadow flex items-center gap-2"
                  >
                    {submitting && <div className="w-3.5 h-3.5 border-2 border-white dark:border-stone-950 border-t-transparent rounded-full animate-spin" />}
                    Registrar Sessão
                  </button>
                </div>

              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stats Summary Row - Bento Grid Layout */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Streak Card */}
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-4 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-2 translate-x-2 group-hover:scale-110 transition duration-300">
              <Flame className="w-20 h-20 text-orange-500" fill="currentColor" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 block font-mono">
                Dias de Hábito
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-stone-300 block mt-1 font-mono">
                Estudo Diário
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono text-orange-600 dark:text-orange-500">
                {summary.streak}
              </span>
              <span className="text-[11px] font-black font-mono text-orange-600/75 dark:text-orange-500/75 uppercase">
                {summary.streak === 1 ? "dia" : "dias"}
              </span>
            </div>
          </div>

          {/* 2. Total Practice Time */}
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-4 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-2 translate-x-2 group-hover:scale-110 transition duration-300">
              <Clock className="w-20 h-20 text-amber-500" fill="currentColor" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 block font-mono">
                Horas Dedicadas
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-stone-300 block mt-1 font-mono">
                Tempo Total
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono text-amber-600 dark:text-amber-500">
                {summary.totalPracticeMinutes}
              </span>
              <span className="text-[11px] font-black font-mono text-amber-600/75 dark:text-amber-500/75 uppercase">
                minutos
              </span>
            </div>
          </div>

          {/* 3. Lessons Progress */}
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-4 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-2 translate-x-2 group-hover:scale-110 transition duration-300">
              <CheckCircle className="w-20 h-20 text-emerald-500" fill="currentColor" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 block font-mono">
                Aulas Concluídas
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-stone-300 block mt-1 font-mono">
                Progresso Teórico
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-500">
                {summary.completedLessonsCount}
              </span>
              <span className="text-[11px] font-black font-mono text-emerald-600/75 dark:text-emerald-500/75">
                / {summary.lessonsCount} ({completedPct}%)
              </span>
            </div>
          </div>

          {/* 4. Challenges Card */}
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-4 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-2 translate-x-2 group-hover:scale-110 transition duration-300">
              <Award className="w-20 h-20 text-blue-500" fill="currentColor" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 block font-mono">
                Desafios Aceitos
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-stone-300 block mt-1 font-mono">
                Conquistas Ativas
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono text-blue-600 dark:text-blue-500">
                {summary.completedChallengesCount}
              </span>
              <span className="text-[11px] font-semibold font-mono text-blue-600/75 dark:text-blue-500/75">
                concluídos
              </span>
            </div>
          </div>

          {/* 5. Exam Performance */}
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-4 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group col-span-2 lg:col-span-1">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-2 translate-x-2 group-hover:scale-110 transition duration-300">
              <BookOpen className="w-20 h-20 text-rose-500" fill="currentColor" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 block font-mono">
                Aproveitamento Teórico
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-stone-300 block mt-1 font-mono">
                Média de Provas
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono text-rose-600 dark:text-rose-500">
                {summary.averageQuizScorePct}%
              </span>
              <span className="text-[11px] font-semibold font-mono text-rose-600/75 dark:text-rose-500/75">
                acertos ({summary.examsPassed} aprov)
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Main Analytics Layout: Charts (Left) & AI Tips and Recent Active list (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Distribution Analysis Graphics using pure SVG + CSS widgets */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 dark:bg-amber-500" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-500 font-mono block">
                Gráficos de Desempenho
              </span>
            </div>
            <h4 className="text-xl font-bold font-mono text-slate-900 dark:text-white leading-tight">
              Distribuição de Foco do Estudo
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-stone-400 mt-2 leading-relaxed">
              Descubra quais áreas estão recebendo mais minutos do seu cronograma de treino. Um guitarrista completo equilibra acordes, ritmo e audição.
            </p>

            {summary && summary.focusStats.length === 0 ? (
              <div className="my-10 p-8 text-center bg-slate-50 dark:bg-stone-950/60 border border-dashed border-slate-200 dark:border-stone-850 rounded-2xl">
                <p className="text-xs text-slate-400 dark:text-stone-500 leading-relaxed font-mono">
                  Sua distribuição do tempo de prática aparecerá graficamente aqui assim que você registrar sua primeira sessão de treino diário utilizando o botão "Registrar Treino Diário" acima!
                </p>
              </div>
            ) : (
              summary && (
                <div className="mt-8 space-y-6">
                  {/* Custom horizontal SVG/CSS bars with percentage metrics */}
                  <div className="space-y-4">
                    {summary.focusStats.map((f, i) => {
                      const pct = Math.round((f.minutes / summary.totalPracticeMinutes) * 100);
                      const iconMap: Record<string, string> = {
                        Acordes: "🎸",
                        Batidas: "🥁",
                        Dedilhado: "🎶",
                        Teoria: "📖",
                        Afinador: "🔊",
                        Metrônomo: "⚙️"
                      };
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-slate-700 dark:text-stone-300 flex items-center gap-1">
                              <span className="text-sm leading-none shrink-0">{iconMap[f.focusArea] || "🎼"}</span>
                              {f.focusArea}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400 dark:text-stone-500 font-bold">
                              {f.minutes} min ({pct}%)
                            </span>
                          </div>
                          
                          <div className="w-full h-3 bg-slate-100 dark:bg-stone-950 rounded-full overflow-hidden relative border border-slate-150 dark:border-stone-850">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full bg-amber-600 dark:bg-amber-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Difficulty balance indicators */}
                  {summary.difficultyStats.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-stone-850/80">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest block mb-3 font-mono">
                        Nível de Esforço Declarado
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        {summary.difficultyStats.map((d, i) => {
                          const diffColors: Record<string, string> = {
                            Iniciante: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                            Intermediário: "bg-amber-500/10 text-amber-700 border-amber-500/20",
                            Avançado: "bg-rose-500/10 text-rose-700 border-rose-500/20"
                          };
                          return (
                            <div key={i} className={`p-2.5 rounded-xl border text-center ${diffColors[d.difficulty] || "bg-slate-50 border-slate-150"}`}>
                              <span className="text-[9px] uppercase font-black tracking-wider block leading-none mb-1 font-mono">
                                {d.difficulty === "Iniciante" ? "Fácil" : d.difficulty === "Intermediário" ? "Desafiador" : "Complexo"}
                              </span>
                              <span className="text-base font-black font-mono">
                                {d.count} <span className="text-[9px] font-medium font-sans">sesses</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-stone-850 text-[10px] text-slate-400 dark:text-stone-500 italic font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Dados guardados de forma segura e síncrona no banco de dados SQLite interno.
          </div>
        </div>

        {/* Right Side: Tips and Recommendations / Recent Logs feed */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* AI Smart feedback based on performance database */}
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-700 dark:text-purple-400 font-mono block">
                Dicas & Recomendações de IA
              </span>
            </div>
            
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-mono leading-snug mb-3">
              Análise de Prática Automatizada
            </h4>

            <div className="space-y-3.5">
              {recommendations.map((rec, i) => {
                const borderS = 
                  rec.type === "success" ? "border-emerald-200 dark:border-emerald-950 bg-emerald-500/5" :
                  rec.type === "warning" ? "border-amber-200 dark:border-amber-950 bg-amber-500/5" :
                  "border-indigo-150 dark:border-indigo-950 bg-indigo-500/5";

                const dotCol = 
                  rec.type === "success" ? "bg-emerald-500" :
                  rec.type === "warning" ? "bg-amber-500 animate-pulse" :
                  "bg-indigo-500";

                return (
                  <div key={i} className={`p-3 border rounded-2xl flex gap-3 ${borderS}`}>
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotCol}`} />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-stone-200 block">
                        {rec.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed font-sans">
                        {rec.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History feeding of recent logged practice sessions */}
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 block mb-3 font-mono">
              Histórico Recente de Treinos
            </span>

            {summary && summary.recentSessions.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-stone-950/20 border border-slate-150 dark:border-stone-850/65 rounded-xl text-[10px] text-slate-450 dark:text-stone-550 font-mono">
                Por enquanto, nenhuma sessão de treino foi registrada. Comece a sua hoje!
              </div>
            ) : (
              summary && (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {summary.recentSessions.map((session, i) => {
                    const diffTag: Record<string, string> = {
                      Iniciante: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      Intermediário: "bg-amber-500/10 text-amber-700 border-amber-500/20",
                      Avançado: "bg-rose-500/10 text-rose-700 border-rose-500/20"
                    };
                    const dateObj = new Date(session.session_date);
                    const BrazilianDate = dateObj.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

                    return (
                      <div key={i} className="p-3 bg-slate-50/55 dark:bg-stone-950/25 border border-slate-150/60 dark:border-stone-850 rounded-2xl flex items-center justify-between text-xs">
                        <div className="space-y-0.5 min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-700 dark:text-stone-200">
                              {session.focus_area}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-stone-500 font-mono">
                              {BrazilianDate}
                            </span>
                          </div>
                          {session.notes && (
                            <p className="text-[10px] text-slate-455 dark:text-stone-400 truncate max-w-xs leading-none">
                              "{session.notes}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-stone-900 px-2 py-0.5 rounded-lg border border-slate-150 dark:border-stone-800">
                            {session.duration_minutes}m
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${diffTag[session.difficulty] || ""}`}>
                            {session.difficulty === "Iniciante" ? "Fácil" : session.difficulty === "Intermediário" ? "Médio" : "Difícil"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* History of PDF Downloads logged in SQLite DB */}
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-6 rounded-3xl shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 block mb-3 font-mono flex items-center gap-1.5 font-bold">
              <History className="w-3.5 h-3.5 text-amber-600" />
              Histórico de Downloads de PDF (Salvo no Banco)
            </span>

            {pdfHistory.length === 0 ? (
              <div className="py-6 text-center bg-slate-50 dark:bg-stone-950/20 border border-slate-150 dark:border-stone-850/65 rounded-xl text-[10px] text-slate-450 dark:text-stone-550 font-mono">
                Nenhum download registrado no banco de dados ainda. Clique em "Download PDF" acima para iniciar.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {pdfHistory.map((item, i) => {
                  const dateStr = new Date(item.downloaded_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  return (
                    <div key={item.id || i} className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-between text-[11px] font-mono text-slate-650 dark:text-stone-300">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate font-sans font-bold">{item.download_type}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-stone-550 shrink-0">{dateStr}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
