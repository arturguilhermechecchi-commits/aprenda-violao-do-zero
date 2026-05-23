import { useState, useEffect } from "react";
import { UserSession } from "../types";
import { Users, BookOpen, FileText, MessageSquare, RefreshCw, ShieldAlert, Award, Calendar } from "lucide-react";

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
    lessons_done: number;
    notes_done: number;
    messages_sent: number;
  }[];
  recentNotes: {
    user_email: string;
    username: string;
    item_id: string;
    item_type: string;
    content: string;
    updated_at: string;
  }[];
}

export default function AdminTab({ currentUser }: AdminTabProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

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
      <div className="p-8 text-center bg-red-500/5 rounded-3xl border border-red-500/10 max-w-4xl mx-auto my-8">
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
            Aqui você tem visibilidade total das operações realizadas no arquivo <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-500">guitar_studio.db</code> localmente.
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
            <span className="text-2xl font-black text-slate-950 dark:text-white block mt-1">
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
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-amber-600" />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Alunos Ativos no SQLite</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-stone-300">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-stone-850 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-500">
                    <th className="py-3 px-2">Aluno</th>
                    <th className="py-3 px-2">Login / Código</th>
                    <th className="py-3 px-2">Criado em</th>
                    <th className="py-3 px-2 text-center">Lições</th>
                    <th className="py-3 px-2 text-center">Notas</th>
                    <th className="py-3 px-2 text-center">IA</th>
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
                      </td>
                      <td className="py-3.5 px-2 text-slate-500 dark:text-stone-400 font-mono text-[11px]">
                        {usr.email}
                      </td>
                      <td className="py-3.5 px-2 text-slate-400 dark:text-stone-500 text-[11px]">
                        {usr.joined_at}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg text-[10px]">
                          {usr.lessons_done} concluídas
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold rounded-lg text-[10px]">
                          {usr.notes_done} anotadas
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold text-purple-650 dark:text-purple-400 font-mono">
                        {usr.messages_sent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-stone-850 flex justify-between text-[10px] text-slate-400 dark:text-stone-500">
            <span>Todos os dados são extraídos do seu ambiente local seguro.</span>
            <span>Estúdio Violão do Zero v1.5</span>
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

    </div>
  );
}
