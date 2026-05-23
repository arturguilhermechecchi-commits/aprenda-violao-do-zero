import { useState, useRef, useEffect } from "react";
import { Message, UserSession } from "../types";
import { Send, Music, HelpCircle, Flame, Star, Sparkles, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface AIChatTabProps {
  currentUser: UserSession | null;
}

export default function AIChatTab({ currentUser }: AIChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userEmail = currentUser?.email || "convidado@violao.com";

  const welcomeMessage: Message = {
    id: "welcome",
    role: "assistant",
    content: "Olá! Eu sou o seu **Professor de Violão Inteligente**. 🎸\n\nEstou aqui para tirar qualquer dúvida que você tenha sobre tocar violão. Desde como segurar a palheta, posicionamento correto dos dedos, como ler partituras ou cifras, até montar um treino personalizado.\n\nEscolha uma das sugestões abaixo ou digite sua dúvida no campo de texto!",
    timestamp: new Date(),
  };

  // Fetch chat history from SQLite on load
  useEffect(() => {
    fetch(`/api/chat/history?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          const parsed = data.messages.map((m: any, idx: number) => ({
            id: `msg-${idx}`,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }));
          setMessages(parsed);
        } else {
          setMessages([welcomeMessage]);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar histórico do chat:", err);
        setMessages([welcomeMessage]);
      });
  }, [userEmail]);

  const starterQuestions = [
    {
      label: "Aliviar dor nos dedos",
      query: "Estou sentindo muita dor nas pontas dos dedos ao tentar apertar as cordas. Isso é normal? O que posso fazer para aliviar e me adaptar mais rápido?",
      icon: Flame,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20",
    },
    {
      label: "Dominando a Pestana",
      query: "Tenho muita dificuldade para fazer a pestana no acorde de Fá Maior (F). O som sai abafado e minha mão dói. Quais as melhores técnicas e treinos para dominar a pestana?",
      icon: Star,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20",
    },
    {
      label: "Aço vs. Nylon",
      query: "Quais as principais diferenças entre violão com cordas de aço e cordas de nylon? Qual é mais indicado para mim que sou iniciante absoluto?",
      icon: Music,
      color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/10",
    },
    {
      label: "Treino de 15 min",
      query: "Pode montar para mim uma rotina diária de treino de apenas 15 minutos? Gostaria de equilibrar treino de ritmo, digitação dos dedos e troca de acordes no violão.",
      icon: Sparkles,
      color: "text-yellow-700 bg-yellow-50 dark:bg-yellow-950/10",
    },
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorText(null);
    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          email: userEmail, // Envia e-mail do aluno logado
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível conectar ao servidor.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: data.text || "Desculpe, não consegui elaborar uma resposta.",
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorText("Ops! Ocorreu um problema ao conectar com o professor de IA. Certifique-se de que sua chave de API está configurada nos Secrets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch("/api/chat/history/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      setMessages([welcomeMessage]);
    } catch (err) {
      console.error("Erro ao apagar histórico no SQLite:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Helper method to format simple inline markdown-like elements (bold, bullet points)
  const renderFormattedMessage = (content: string) => {
    return content.split("\n").map((line, pIdx) => {
      // Handles bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemText = line.trim().substring(2);
        return (
          <li key={pIdx} className="ml-4 list-disc list-outside mb-1 pr-1 text-slate-700 dark:text-slate-300">
            {parseBoldText(itemText)}
          </li>
        );
      }

      // Check for arrow sequences (beat guides) and colorize them
      const hasArrows = line.includes("↓") || line.includes("↑");

      return (
        <p key={pIdx} className={`mb-3 last:mb-0 text-slate-700 dark:text-slate-300 leading-relaxed ${hasArrows ? "bg-amber-50 dark:bg-amber-950/20 p-2 border-l-2 border-amber-500 rounded font-mono text-sm inline-block my-1" : ""}`}>
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-semibold text-amber-900 dark:text-amber-400">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div id="ai-chat-tab" className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
      {/* Suggestions / Sidebar */}
      <div className="lg:col-span-1 flex flex-col gap-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-950 p-4 rounded-xl border border-amber-100 dark:border-stone-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Dúvidas Frequentes</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Seja paciente no começo! Clique abaixo para pedir ajuda em assuntos cruciais de violão:
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {starterQuestions.map((sq, i) => {
            const IconComponent = sq.icon;
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(sq.query)}
                disabled={isLoading}
                id={`starter-question-btn-${i}`}
                className="flex items-start gap-3 p-3 text-left bg-white dark:bg-stone-900 hover:bg-amber-50/50 dark:hover:bg-stone-800/80 rounded-xl border border-slate-200 dark:border-stone-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className={`p-2 rounded-lg shrink-0 ${sq.color} group-hover:scale-105 transition`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-medium text-xs text-slate-900 dark:text-stone-100 block">{sq.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{sq.query}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main chat window */}
      <div className="lg:col-span-3 bg-white dark:bg-stone-900/60 rounded-2xl border border-slate-200 dark:border-stone-800 flex flex-col overflow-hidden shadow-sm h-full backdrop-blur-sm">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                Mestre do Violão
                <span className="text-[10px] uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded">
                  IA
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Professor virtual ativo para tirar dúvidas</p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            id="clear-chat-history-btn"
            title="Limpar histórico de conversas no SQLite"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[11px] font-bold text-slate-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-stone-800/80 transition duration-150 border border-transparent hover:border-slate-200 dark:hover:border-stone-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Conversa
          </button>
        </div>

        {/* Conversation flow */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 dark:bg-stone-950/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm ${
                  msg.role === "user"
                    ? "bg-amber-900 text-stone-50 rounded-tr-none"
                    : "bg-white dark:bg-stone-900 text-slate-800 dark:text-stone-100 border border-slate-250 dark:border-stone-800 rounded-tl-none font-sans"
                }`}
              >
                {msg.role === "assistant" ? renderFormattedMessage(msg.content) : <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                <div
                  className={`text-[9px] mt-1.5 ${
                    msg.role === "user" ? "text-amber-200/80 text-right" : "text-slate-400 dark:text-stone-500 text-left"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-stone-900 rounded-2xl rounded-tl-none px-5 py-4 border border-slate-205 dark:border-stone-800 flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="text-xs text-slate-400 dark:text-stone-500 font-mono italic">
                  Professor está digitando...
                </span>
              </div>
            </div>
          )}

          {errorText && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 rounded-xl flex gap-3 text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                {errorText}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            id="chat-input-form"
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ex: Como posso praticar a batida de Pop? ou Qual o tom de G?"
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-stone-950 rounded-xl border border-slate-200 dark:border-stone-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              id="send-message-btn"
              className="px-4 py-3 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-xl shadow transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 dark:text-stone-500 text-center mt-2">
            A IA é uma ótima ferramenta complementar para seu estudo diário de violão.
          </p>
        </div>
      </div>
    </div>
  );
}
