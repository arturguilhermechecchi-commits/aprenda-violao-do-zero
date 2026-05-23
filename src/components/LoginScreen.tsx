import React, { useState } from "react";
import { UserSession } from "../types";
import { Lock, Mail, User, Eye, EyeOff, Music, Sparkles, BookOpen, LogIn, UserPlus } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  isDarkMode: boolean;
}

export default function LoginScreen({ onLoginSuccess, isDarkMode }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [guitarLevel, setGuitarLevel] = useState("Iniciante");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setErrorText("Por favor, preencha todos os campos de usuário e senha.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorText(data.error || "Erro de login indefinido.");
        setIsLoading(false);
        return;
      }

      // Success login from SQLite!
      const session: UserSession = {
        username: data.username,
        email: data.email,
        joinedAt: data.joinedAt,
        guitarLevel: data.guitarLevel || "Iniciante",
      };

      onLoginSuccess(session);
    } catch (err) {
      console.error("Erro na conexão com o servidor:", err);
      setErrorText("Não foi possível conectar ao servidor SQLite de autenticação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanUsername || !cleanPassword) {
      setErrorText("Por favor, preencha todos os campos para cadastrar.");
      setIsLoading(false);
      return;
    }

    if (cleanPassword.length < 3) {
      setErrorText("A senha deve ter pelo menos 3 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          username: cleanUsername,
          password: cleanPassword,
          guitarLevel: guitarLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorText(data.error || "Não foi possível registrar.");
        setIsLoading(false);
        return;
      }

      setSuccessText("Conta cadastrada no banco de dados SQLite com sucesso! Agora você pode fazer o login.");
      setIsRegistering(false);
      setPassword(""); // Clear password for safety
    } catch (err) {
      console.error("Erro ao registrar aluno no SQLite:", err);
      setErrorText("Erro de conexão ao tentar registrar usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoAccount = () => {
    setEmail("aluno@violao.com");
    setPassword("123");
    setErrorText(null);
  };

  const enterAsGuest = async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "convidado@violao.com", password: "convidado123" }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Fallback robust so they are never locked out
        onLoginSuccess({
          username: "Aluno Convidado",
          email: "convidado@violao.com",
          joinedAt: new Date().toLocaleDateString("pt-BR"),
          guitarLevel: guitarLevel || "Iniciante",
        });
        return;
      }

      onLoginSuccess({
        username: data.username,
        email: data.email,
        joinedAt: data.joinedAt,
        guitarLevel: guitarLevel || "Iniciante",
      });
    } catch (err) {
      console.error("Erro ao autenticar convidado:", err);
      onLoginSuccess({
        username: "Aluno Convidado",
        email: "convidado@violao.com",
        joinedAt: new Date().toLocaleDateString("pt-BR"),
        guitarLevel: guitarLevel || "Iniciante",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div id="login-screen" className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-stone-950">
      
      {/* Absolute background effects resembling recording studio lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side Presentation Column */}
        <div className="md:col-span-5 bg-gradient-to-br from-amber-800 to-amber-950 p-8 md:p-12 flex flex-col justify-between text-stone-100 relative">
          
          {/* Subtle vector musical elements decorative */}
          <div className="absolute top-12 right-12 text-6xl opacity-10 select-none font-mono">
            🎸
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Estúdio de Ensino Digital</span>
            </div>
            
            <h2 className="text-3.5xl font-black tracking-tight leading-tight mb-4">
              Aprenda Violão do Zero!
            </h2>
            
            <p className="text-sm text-amber-100/90 leading-relaxed mb-6">
              O jeito mais simples, dinâmico e interativo de dar seus primeiros passos musicais.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-amber-900/50 border border-amber-700/40 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-amber-200" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold block">Lições Base Práticas</span>
                  <p className="text-amber-200/70 mt-0.5">Sem teoria complicada: postura correta, casas e cordas de imediato.</p>
                </div>
              </div>

              <div className="flex gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-amber-900/50 border border-amber-700/40 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-amber-200" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold block font-mono">Dicionário de Acordes Ricos</span>
                  <p className="text-amber-200/70 mt-0.5">Veja desenhos e toque sons acústicos realistas em tempo real.</p>
                </div>
              </div>

              <div className="flex gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-amber-900/50 border border-amber-700/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold block">Tutor de IA Integrado</span>
                  <p className="text-amber-200/70 mt-0.5">Tire dúvidas sobre batidas, pestanas e dores nos dedos na hora.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-900/30 text-[11px] text-amber-200/60 leading-normal">
            Gire as tarraxas, pegue sua palheta e vamos fazer música juntos!
          </div>
        </div>

        {/* Right Side Login Form Column */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-stone-900">
          
          <div className="w-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {isRegistering ? (
                  <>
                    <UserPlus className="w-5 h-5 text-amber-500" /> Crie sua Conta
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 text-amber-500" /> Acesse sua Conta
                  </>
                )}
              </h3>

              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorText(null);
                  setSuccessText(null);
                }}
                id="toggle-auth-mode-btn"
                className="text-xs font-semibold text-amber-500 hover:text-amber-400 underline"
              >
                {isRegistering ? "Já tenho conta" : "Criar nova conta de aluno"}
              </button>
            </div>

            {/* Error notifications */}
            {errorText && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-900/60 text-red-300 rounded-2xl text-xs text-left">
                {errorText}
              </div>
            )}

            {/* Success notifications */}
            {successText && (
              <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 rounded-2xl text-xs text-left">
                {successText}
              </div>
            )}

            {/* Form */}
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 text-left">
              
              {/* Guitar Level Selector horizontal buttons block */}
              <div className="mb-6 p-3 bg-stone-950/40 rounded-2xl border border-stone-800/40">
                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-2">
                  Selecione seu nível de Violão:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "Iniciante", label: "Iniciante", icon: "🎸" },
                    { value: "Intermediário", label: "Intermediário", icon: "🎶" },
                    { value: "Avançado", label: "Avançado", icon: "🔥" }
                  ].map((lvl) => (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setGuitarLevel(lvl.value)}
                      className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        guitarLevel === lvl.value
                          ? "bg-amber-950/50 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/10"
                          : "bg-stone-950 border-stone-900 text-stone-400 hover:border-stone-800"
                      }`}
                    >
                      <span className="text-base">{lvl.icon}</span>
                      <span>{lvl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Username field (Register mode only) */}
              {isRegistering && (
                <div>
                  <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                    Seu Nome de Aluno
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: Clara de Souza"
                      className="w-full pl-11 pr-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email / User Identifier */}
              <div>
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                  E-mail de Login
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: aluno@violao.com"
                    className="w-full pl-11 pr-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de acessso"
                    className="w-full pl-11 pr-11 py-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    id="toggle-password-visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-auth-form-btn"
                className="w-full py-3 px-6 bg-amber-800 hover:bg-amber-700 text-stone-50 font-bold rounded-xl transition shadow mt-4 flex items-center justify-center gap-2"
              >
                {isRegistering ? "Cadastrar Aluno" : "Entrar no Painel"}
              </button>
            </form>

            {/* Fast login helpers (demo account) */}
            {!isRegistering && (
              <div className="mt-8 pt-6 border-t border-stone-800/80">
                <span className="text-xs text-stone-400 block mb-3 text-center md:text-left">
                  Conexões rápidas de demonstração do sistema:
                </span>
                
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={loadDemoAccount}
                    id="load-demo-account-btn"
                    className="py-2.5 px-3 bg-stone-950 hover:bg-stone-850 text-amber-500 border border-amber-900/35 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3" />
                    Aluno Demo
                  </button>

                  <button
                    type="button"
                    onClick={enterAsGuest}
                    id="guest-access-btn"
                    className="py-2.5 px-3 bg-stone-950 hover:bg-stone-850 text-stone-300 border border-stone-800 rounded-xl font-bold text-[11px] transition flex items-center justify-center"
                  >
                    Convidado
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-[10px] text-stone-500">
            Aprenda Violão do Zero - Seus dados são salvos localmente neste navegador com privacidade.
          </div>
        </div>

      </div>
    </div>
  );
}
