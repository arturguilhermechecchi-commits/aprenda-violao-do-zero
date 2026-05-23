import { useState, useEffect } from "react";
import { UserSession } from "../types";
import { Users, BookOpen, FileText, MessageSquare, RefreshCw, ShieldAlert, Award, Calendar, Clock, Smartphone, Laptop, Activity, Trash2, Lock } from "lucide-react";

interface AdminTabProps {
  currentUser: UserSession;
}

interface AdminStats {
  usersCount: number;
  completedLessonsCount: number;
  notesCount: number;
  messagesCount: number;
  usersList: {
    id: number;
    email: string;
    username: string;
    joined_at: string;
    guitar_level?: string;
    lessons_done: number;
    notes_done: number;
    messages_sent: number;
    logins_count?: number;
    last_login?: string | null;
  }[];
  recentNotes: {
    user_email: string;
    username: string;
    item_id: string;
    item_type: string;
    content: string;
    updated_at: string;
  }[];
  recentLogins?: {
    id: number;
    user_email: string;
    username: string;
    login_at: string;
    user_agent: string;
  }[];
}

export default function AdminTab({ currentUser }: AdminTabProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Custom states for deletion of users
  const [confirmDeleteEmail, setConfirmDeleteEmail] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const executeDeleteUser = (targetEmail: string) => {
    setIsDeleting(targetEmail);
    setDeleteErrorMessage(null);
    fetch("/api/admin/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminEmail: currentUser.email,
        targetEmail: targetEmail
      })
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || "Erro ao tentar excluir.");
          });
        }
        return res.json();
      })
      .then(() => {
        setConfirmDeleteEmail(null);
        fetchStats();
      })
      .catch((err: any) => {
        console.error(err);
        setDeleteErrorMessage(err.message || "Não foi possível excluir o aluno.");
      })
      .finally(() => {
        setIsDeleting(null);
      });
  };

  const fetchStats = () => {
    setIsLoading(true);
    setErrorText(null);
    fetch(`/api/admin/stats?email=${encodeURIComponent(currentUser.email)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("Acesso negado. Apenas o e-mail de administrador (Artur) pode ver este console.");
          }
          throw new Error("Nenhum dado retornado ou erro no servidor.");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err: any) => {
        console.error(err);
        setErrorText(err.message || "Erro para carregar dados do console administrativo do SQLite.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, [currentUser.email]);

  if (errorText) {
    return (
      <div className="p-8 text-center bg-red-500/5 rounded-3xl border border-red-500/10 max-w-4xl mx-auto my-8 font-sans">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Acesso Restrito ao SQLite Admin</h3>
        <p className="text-sm text-red-500/80 mt-1 max-w-lg mx-auto">{errorText}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 font-bold rounded-xl text-xs transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-16 text-center max-w-4xl mx-auto">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-mono">Consolidando e analisando dados do banco SQLite...</p>
      </div>
    );
  }

  return (
    <div id="admin-custom-dashboard" className="max-w-7xl mx-auto space-y-8 animate-fade-in text-left">
      
      {/* Intro Admin Header Banner */}
      <div className="bg-stone-900 border border-amber-900/25 rounded-3xl p-6 text-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-mono">
            Console de Administração Ativo (Estatísticas do Banco SQLite)
          </span>
          <h3 className="font-extrabold text-2xl text-white mt-1">Olá, Admin {currentUser.username}!</h3>
          <p className="text-xs text-stone-400 mt-1">
            Aqui você tem visibilidade total das operações e histórico de entradas no arquivo <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-500">guitar_studio.db</code>.
          </p>
        </div>
        
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="w-4 h-4" />
          Sincronizar Banco
        </button>
      </div>

      {/* Bento Grid Metrics Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total students card */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-200 dark:border-stone-850 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-stone-500 block leading-none">
              Alunos Cadastrados
            </span>
            <span className="text-2xl font-black text-slate-950 dark:text-white block mt-1 animate-pulse">
              {stats?.usersCount}
            </span>
          </div>
        </div>

        {/* Completed Lessons */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-200 dark:border-stone-850 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-stone-500 block leading-none">
              Aulas Concluídas
            </span>
            <span className="text-2xl font-black text-slate-950 dark:text-white block mt-1">
              {stats?.completedLessonsCount}
            </span>
          </div>
        </div>

        {/* Active Study notes */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-200 dark:border-stone-850 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-stone-500 block leading-none">
              Anotações no Diário
            </span>
            <span className="text-2xl font-black text-slate-950 dark:text-white block mt-1">
              {stats?.notesCount}
            </span>
          </div>
        </div>

        {/* AI Helper Message volumes */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-200 dark:border-stone-850 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-stone-500 block leading-none">
              Perguntas para a IA
            </span>
            <span className="text-2xl font-black text-slate-950 dark:text-white block mt-1">
              {stats?.messagesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Double Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Registered Users Table */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-850 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Alunos Ativos no SQLite</h4>
              </div>
              {deleteErrorMessage && (
                <div className="px-3 py-1 bg-red-500/15 border border-red-500/20 rounded-xl text-xs text-red-600 font-medium">
                  {deleteErrorMessage}
                </div>
              )}
              {confirmDeleteEmail && !deleteErrorMessage && (
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-mono">
                  Confirmar exclusão de {confirmDeleteEmail}?
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-stone-300">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-stone-850 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-500">
                    <th className="py-3 px-2">Aluno</th>
                    <th className="py-3 px-2">E-mail de Login</th>
                    <th className="py-3 px-2 text-center">Nível</th>
                    <th className="py-3 px-2 col-joined-at">Criado em</th>
                    <th className="py-3 px-2 text-center">Acessos</th>
                    <th className="py-3 px-2 text-center">Última Entrada</th>
                    <th className="py-3 px-2 text-center">Lições</th>
                    <th className="py-3 px-2 text-center font-mono">IA</th>
                    <th className="py-3 px-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-stone-850">
                  {stats?.usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-amber-950/10 transition">
                      <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-stone-50">
                        {usr.username}
                        {usr.email === "arturguilhermechecchi@gmail.com" && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-amber-600 text-stone-950 rounded text-[9px] font-black uppercase">
                            Admin
                          </span>
                        )}
                        {usr.email === "convidado@violao.com" && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded text-[9px] font-bold">
                            Convidado
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-slate-550 dark:text-stone-400 font-mono text-[11px]">
                        {usr.email}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          usr.guitar_level === "Avançado"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : usr.guitar_level === "Intermediário"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {usr.guitar_level || "Iniciante"}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-400 dark:text-stone-500 text-[11px]">
                        {usr.joined_at}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold rounded-lg text-[11px] font-mono">
                          {usr.logins_count || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center text-slate-500 dark:text-stone-400 font-mono text-[10px]">
                        {usr.last_login ? (
                          <span title={usr.last_login}>
                            {new Date(usr.last_login).toLocaleDateString("pt-BR")} {new Date(usr.last_login).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-stone-600 italic">Nunca acessou</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded text-[10px]">
                          {usr.lessons_done} check
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold text-purple-600 dark:text-purple-400 font-mono">
                        {usr.messages_sent}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        {usr.email === "arturguilhermechecchi@gmail.com" ? (
                          <div className="flex items-center justify-end gap-1 text-slate-400 dark:text-stone-600" title="Conta de Administrador Protegida">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Protegido</span>
                          </div>
                        ) : confirmDeleteEmail === usr.email ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={isDeleting === usr.email}
                              onClick={() => executeDeleteUser(usr.email)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[10px] transition shadow-sm cursor-pointer disabled:opacity-55"
                            >
                              {isDeleting === usr.email ? "..." : "Sim"}
                            </button>
                            <button
                              disabled={isDeleting === usr.email}
                              onClick={() => {
                                setConfirmDeleteEmail(null);
                                setDeleteErrorMessage(null);
                              }}
                              className="px-2 py-1 bg-slate-200 dark:bg-stone-800 hover:bg-slate-300 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 font-bold rounded text-[10px] transition cursor-pointer disabled:opacity-55"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setConfirmDeleteEmail(usr.email);
                              setDeleteErrorMessage(null);
                            }}
                            className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 rounded-lg transition inline-flex items-center gap-1 text-[10px] font-medium cursor-pointer"
                            title="Excluir Aluno"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-stone-850 flex justify-between text-[10px] text-slate-400 dark:text-stone-500">
            <span>Todos os dados são extraídos do seu ambiente local seguro.</span>
            <span>Estúdio Violão do Zero v1.6 (Login Tracker)</span>
          </div>
        </div>

        {/* Right Column: Recent Activity and notes */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-850 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-amber-600" />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Diários Recentes de Alunos</h4>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {!stats?.recentNotes || stats.recentNotes.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-stone-850 rounded-2xl text-slate-400 dark:text-stone-550">
                  <p className="text-xs">Nenhum aluno registrou notas de estudos até o momento.</p>
                </div>
              ) : (
                stats.recentNotes.map((note, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-stone-950/50 border border-slate-200/50 dark:border-stone-850 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-stone-200 truncate max-w-[150px]">
                        {note.username}
                      </span>
                      <span className="text-slate-400 dark:text-stone-550">
                        {new Date(note.updated_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="text-[10px] text-amber-800 dark:text-amber-500 font-bold font-mono tracking-wide uppercase">
                      {note.item_type === "lesson" ? "Aula:" : "Música:"} {note.item_id}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-stone-400 italic bg-white dark:bg-stone-950/80 p-2.5 rounded-lg border border-slate-100 dark:border-stone-900 leading-normal">
                      &ldquo;{note.content}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-stone-850 text-[10px] text-slate-400 dark:text-stone-550">
            Logs ordenados cronologicamente do SQLite.
          </div>
        </div>

      </div>

      {/* Horários de Entrada / Login Access History Analysis */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-850 p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Analítico de Horários de Entrada (Fluxo de Acesso)</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">
              Registro em tempo real de horários e sessões de logins para analisar picos de atividade e perfil de clientes.
            </p>
          </div>
          <div className="flex gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold rounded-xl flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Registros no Banco: {stats?.recentLogins?.length || 0}
            </span>
          </div>
        </div>

        {/* Access Log analysis summary dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Peak hour analytics concept */}
          <div className="bg-stone-50 dark:bg-stone-950/40 border border-slate-100 dark:border-stone-850 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 block uppercase tracking-wide">
              Frequência por Período
            </span>
            <div className="mt-2 text-sm text-slate-800 dark:text-stone-200">
              {(() => {
                if (!stats?.recentLogins || stats.recentLogins.length === 0) {
                  return <p className="text-xs text-slate-400 italic">Sem logins suficientes para analisar periodocidade.</p>;
                }
                const periods = { Manha: 0, Tarde: 0, Noite: 0, Madrugada: 0 };
                stats.recentLogins.forEach(log => {
                  try {
                    const hour = new Date(log.login_at).getHours();
                    if (hour >= 6 && hour < 12) periods.Manha++;
                    else if (hour >= 12 && hour < 18) periods.Tarde++;
                    else if (hour >= 18 && hour < 24) periods.Noite++;
                    else periods.Madrugada++;
                  } catch (e) {}
                });
                return (
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 dark:border-stone-850 pb-1">
                      <span>☀️ Manhã (06h - 12h)</span> 
                      <span className="font-bold text-amber-600">{periods.Manha} logins</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 dark:border-stone-850 pb-1">
                      <span>⛅ Tarde (12h - 18h)</span> 
                      <span className="font-bold text-amber-600">{periods.Tarde} logins</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 dark:border-stone-850 pb-1">
                      <span>🌙 Noite (18h - 00h)</span> 
                      <span className="font-bold text-amber-600">{periods.Noite} logins</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🦉 Madrugada (00h - 06h)</span> 
                      <span className="font-bold text-amber-600">{periods.Madrugada} logins</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Device tracking stats */}
          <div className="bg-stone-50 dark:bg-stone-950/40 border border-slate-100 dark:border-stone-850 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 block uppercase tracking-wide">
              Origem de Dispositivo
            </span>
            <div className="mt-2 text-sm text-slate-800 dark:text-stone-200">
              {(() => {
                if (!stats?.recentLogins || stats.recentLogins.length === 0) {
                  return <p className="text-xs text-slate-400 italic">Sem logins suficientes para identificar dispositivos.</p>;
                }
                let mobileCount = 0;
                let desktopCount = 0;
                stats.recentLogins.forEach(log => {
                  const ua = (log.user_agent || "").toLowerCase();
                  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
                    mobileCount++;
                  } else {
                    desktopCount++;
                  }
                });
                const total = mobileCount + desktopCount || 1;
                return (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 dark:border-stone-850 pb-1">
                      <span className="flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5 text-blue-500" /> Web / Computador
                      </span>
                      <span className="font-mono font-bold text-blue-500">{desktopCount} ({Math.round((desktopCount / total) * 100)}%)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 dark:border-stone-850 pb-1">
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-purple-500" /> Mobile / Celular
                      </span>
                      <span className="font-mono font-bold text-purple-500">{mobileCount} ({Math.round((mobileCount / total) * 100)}%)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-stone-550 leading-tight pt-1">
                      Análise automatizada de requisições HTTP do navegador.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Individual student density logs chart details */}
          <div className="bg-stone-50 dark:bg-stone-950/40 border border-slate-100 dark:border-stone-850 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 block uppercase tracking-wide">
              Taxa de Acesso por Estudante
            </span>
            <div className="mt-2 text-xs text-slate-700 dark:text-stone-350 max-h-[110px] overflow-y-auto space-y-1">
              {stats?.usersList.map((u) => (
                <div key={u.id} className="flex justify-between items-center bg-white/50 dark:bg-stone-900/40 px-2 py-1 rounded border border-slate-100/50 dark:border-stone-850">
                  <span className="truncate max-w-[130px] font-medium">{u.username}</span>
                  <span className="font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-1 py-0.5 rounded text-[9px] font-bold">
                    {u.logins_count || 0} acessos
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed real-time access audit feeds table */}
        <div className="overflow-x-auto border border-slate-200/60 dark:border-stone-850 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-755 dark:text-stone-300">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-950 border-b border-slate-200/60 dark:border-stone-850 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-500">
                <th className="py-2.5 px-3">Aluno</th>
                <th className="py-2.5 px-3">E-mail</th>
                <th className="py-2.5 px-3 text-center">Horário exato de Entrada</th>
                <th className="py-2.5 px-3 text-center">Data de Entrada</th>
                <th className="py-2.5 px-3">Navegador / Identificador de Dispositivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-stone-850">
              {!stats?.recentLogins || stats.recentLogins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-stone-500 italic bg-white dark:bg-stone-900">
                    Nenhum horário de entrada gravado no banco SQLite ainda. Logue na conta "Aluno Demo" para registrar!
                  </td>
                </tr>
              ) : (
                stats.recentLogins.map((lg) => {
                  const accessTime = new Date(lg.login_at);
                  const isMob = (lg.user_agent || "").toLowerCase().includes("mobile") || (lg.user_agent || "").toLowerCase().includes("android");
                  return (
                    <tr key={lg.id} className="hover:bg-slate-50 dark:hover:bg-amber-950/10 transition bg-white dark:bg-stone-900">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-stone-100 flex items-center gap-1.5">
                        {isMob ? <Smartphone className="w-3.5 h-3.5 text-purple-500" /> : <Laptop className="w-3.5 h-3.5 text-blue-500" />}
                        {lg.username}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-stone-400 text-[11px]">{lg.user_email}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700 dark:text-amber-500">
                        {accessTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 dark:text-stone-400 font-mono text-[11px]">
                        {accessTime.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 dark:text-stone-500 text-[10px] font-mono truncate max-w-[280px]" title={lg.user_agent}>
                        {lg.user_agent || "Padrão (Client-Side Link)"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
