import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { dbOperations } from "./src/db";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// SQLite REST APIs
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = dbOperations.getUserByEmail(cleanEmail);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "E-mail de login ou senha incorretos." });
    }

    // Registrar o horario de entrada / login no banco de dados
    dbOperations.logUserLogin(cleanEmail, req.headers["user-agent"] || null);

    return res.json({
      username: user.username,
      email: user.email,
      joinedAt: user.joined_at,
      guitarLevel: user.guitar_level || "Iniciante",
    });
  } catch (error: any) {
    console.error("Erro na autenticação de login (SQLite):", error);
    return res.status(500).json({ error: "Erro interno no servidor de login." });
  }
});

app.post("/api/auth/register", (req, res) => {
  try {
    const { email, username, password, guitarLevel } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Todos os campos (e-mail, nome, senha) são obrigatórios." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    const existingUser = dbOperations.getUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Este e-mail de usuário já está cadastrado." });
    }

    dbOperations.createUser(cleanEmail, cleanUsername, password, guitarLevel || "Iniciante");
    return res.json({ success: true, message: "Conta cadastrada com sucesso!" });
  } catch (error: any) {
    console.error("Erro no cadastro de aluno (SQLite):", error);
    return res.status(500).json({ error: "Erro interno ao cadastrar aluno." });
  }
});

app.get("/api/admin/stats", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "E-mail do administrador é obrigatório para autenticar." });
    }

    // Estrita validação de e-mail do administrador
    if (email !== "arturguilhermechecchi@gmail.com") {
      return res.status(403).json({ error: "Acesso negado. Você não possui permissões administrativas." });
    }

    const stats = dbOperations.getAdminConsoleData();
    res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas do SQLite:", error);
    res.status(500).json({ error: "Erro para consolidar as estatísticas gerais." });
  }
});

app.post("/api/admin/users/delete", (req, res) => {
  try {
    const { adminEmail, targetEmail } = req.body;
    
    if (!adminEmail || !targetEmail) {
      return res.status(400).json({ error: "Parâmetros adminEmail e targetEmail são obrigatórios." });
    }

    const cleanAdminEmail = adminEmail.trim().toLowerCase();
    const cleanTargetEmail = targetEmail.trim().toLowerCase();

    if (cleanAdminEmail !== "arturguilhermechecchi@gmail.com") {
      return res.status(403).json({ error: "Acesso negado. Apenas o administrador Artur pode deletar usuários." });
    }

    if (cleanTargetEmail === "arturguilhermechecchi@gmail.com") {
      return res.status(400).json({ error: "Você não pode deletar a sua própria conta de administrador." });
    }

    const success = dbOperations.deleteUser(cleanTargetEmail);
    if (!success) {
      return res.status(404).json({ error: "Usuário não encontrado no banco de dados." });
    }

    res.json({ success: true, message: "Usuário deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar usuário do SQLite:", error);
    res.status(500).json({ error: "Erro interno no servidor ao tentar deletar o usuário." });
  }
});

app.get("/api/lessons", (req, res) => {
  try {
    const level = req.query.level ? String(req.query.level) : undefined;
    const lessonsRaw = dbOperations.getLessons(level);
    const lessons = lessonsRaw.map(l => ({
      id: l.id,
      title: l.title,
      category: l.category,
      description: l.description,
      contentMarkdown: l.content_markdown,
      order: l.lesson_order,
      level: l.level
    }));
    return res.json({ lessons });
  } catch (error) {
    console.error("Erro ao obter lições do SQLite:", error);
    return res.status(500).json({ error: "Erro ao obter lista de lições." });
  }
});

app.get("/api/harmonic-fields", (req, res) => {
  try {
    const fields = dbOperations.getHarmonicFields();
    return res.json({ fields });
  } catch (error) {
    console.error("Erro ao obter campos harmônicos do SQLite:", error);
    return res.status(500).json({ error: "Erro ao obter lista de campos harmônicos registrados." });
  }
});

app.get("/api/lessons/completed", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório para carregar progresso." });
    }
    const completed = dbOperations.getCompletedLessons(email);
    return res.json({ completed });
  } catch (error) {
    console.error("Erro ao obter lições completadas:", error);
    return res.status(500).json({ error: "Erro ao obter progresso das lições." });
  }
});

app.post("/api/lessons/complete", (req, res) => {
  try {
    const { email, lessonId } = req.body;
    if (!email || !lessonId) {
      return res.status(400).json({ error: "Parâmetros e-mail e lessonId obrigatórios." });
    }
    dbOperations.completeLesson(email.trim().toLowerCase(), lessonId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao completar lição:", error);
    return res.status(500).json({ error: "Erro ao atualizar lição." });
  }
});

app.post("/api/lessons/uncomplete", (req, res) => {
  try {
    const { email, lessonId } = req.body;
    if (!email || !lessonId) {
      return res.status(400).json({ error: "Parâmetros e-mail e lessonId obrigatórios." });
    }
    dbOperations.uncompleteLesson(email.trim().toLowerCase(), lessonId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao desmarcar lição:", error);
    return res.status(500).json({ error: "Erro ao atualizar lição." });
  }
});

// Challenges for users by level
app.get("/api/challenges/completed", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório para carregar desafios concluidos." });
    }
    const completed = dbOperations.getCompletedChallenges(email);
    return res.json({ completed });
  } catch (error) {
    console.error("Erro ao obter desafios concluidos:", error);
    return res.status(500).json({ error: "Erro ao obter progresso de desafios." });
  }
});

app.post("/api/challenges/complete", (req, res) => {
  try {
    const { email, challengeId } = req.body;
    if (!email || !challengeId) {
      return res.status(400).json({ error: "Parâmetros e-mail e challengeId obrigatórios." });
    }
    dbOperations.completeChallenge(email.trim().toLowerCase(), challengeId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao completar desafio:", error);
    return res.status(500).json({ error: "Erro ao salvar conclusão de desafio." });
  }
});

app.post("/api/challenges/uncomplete", (req, res) => {
  try {
    const { email, challengeId } = req.body;
    if (!email || !challengeId) {
      return res.status(400).json({ error: "Parâmetros e-mail e challengeId obrigatórios." });
    }
    dbOperations.uncompleteChallenge(email.trim().toLowerCase(), challengeId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao desmarcar desafio:", error);
    return res.status(500).json({ error: "Erro ao remover conclusão de desafio." });
  }
});

// Audio settings persistence endpoints
app.get("/api/audio-settings", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório." });
    }
    const settings = dbOperations.getAudioSettings(email);
    return res.json({ settings: settings || null });
  } catch (error) {
    console.error("Erro ao obter configurações de áudio:", error);
    return res.status(500).json({ error: "Erro ao carregar configurações de áudio." });
  }
});

app.post("/api/audio-settings", (req, res) => {
  try {
    const { email, masterVolume, guitarType, metronomeFrequency, strumSpeed } = req.body;
    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório." });
    }
    const success = dbOperations.saveAudioSettings(
      email.trim().toLowerCase(),
      Number(masterVolume || 80),
      String(guitarType || "acoustic_steel"),
      Number(metronomeFrequency || 1000),
      String(strumSpeed || "strum")
    );
    return res.json({ success });
  } catch (error) {
    console.error("Erro ao salvar configurações de áudio:", error);
    return res.status(500).json({ error: "Erro ao salvar configurações de áudio." });
  }
});

// Student personal notes
app.get("/api/notes", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const itemId = String(req.query.itemId || "");
    const itemType = String(req.query.itemType || "");

    if (!email || !itemId || !itemType) {
      return res.status(400).json({ error: "Parâmetros imcompletos." });
    }

    const content = dbOperations.getNote(email, itemId, itemType);
    return res.json({ content });
  } catch (error) {
    console.error("Erro ao ler anotações:", error);
    return res.status(500).json({ error: "Erro ao obter anotações." });
  }
});

app.post("/api/notes", (req, res) => {
  try {
    const { email, itemId, itemType, content } = req.body;
    if (!email || !itemId || !itemType || content === undefined) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    dbOperations.saveNote(email.trim().toLowerCase(), itemId, itemType, content);
    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar anotação:", error);
    return res.status(500).json({ error: "Erro ao salvar anotação." });
  }
});

app.get("/api/quiz/questions", (req, res) => {
  try {
    const level = String(req.query.level || "Iniciante");
    const email = String(req.query.email || "").trim().toLowerCase();
    const isPractice = req.query.practice === "true";

    if (email && !isPractice) {
      const results = dbOperations.getQuizResults(email);
      const resultForLevel = results.find((r: any) => r.level === level);
      if (resultForLevel && resultForLevel.blocked_until) {
        const blockedUntil = new Date(resultForLevel.blocked_until);
        if (blockedUntil > new Date()) {
          return res.status(403).json({
            error: "Acesso bloqueado temporariamente para estudos. Tente novamente mais tarde.",
            blockedUntil: resultForLevel.blocked_until
          });
        }
      }

      // Check if all lessons of this level are completed (Only for official exam)
      const allLessons = dbOperations.getLessons(level);
      const completedLessonIds = dbOperations.getCompletedLessons(email);
      const incomplete = allLessons.filter(l => !completedLessonIds.includes(l.id));

      if (incomplete.length > 0) {
        return res.status(403).json({
          error: `Você precisa concluir todas as lições do nível ${level} antes de realizar a prova oficial! (${allLessons.length - incomplete.length}/${allLessons.length} concluídas)`
        });
      }
    }

    const questionsRaw = dbOperations.getQuizQuestions(level);
    const questions = questionsRaw.map((q) => ({
      id: q.id,
      level: q.level,
      question: q.question,
      options: JSON.parse(q.options),
      correctIndex: q.correct_index,
      explanation: q.explanation
    }));
    return res.json({ questions });
  } catch (error) {
    console.error("Erro ao obter questões do quiz:", error);
    return res.status(500).json({ error: "Erro ao obter questões do quiz." });
  }
});

app.get("/api/quiz/results", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "O e-mail é obrigatório." });
    }
    const results = dbOperations.getQuizResults(email);
    return res.json({ results });
  } catch (error) {
    console.error("Erro ao obter resultados do quiz:", error);
    return res.status(500).json({ error: "Erro ao carregar resultados das avaliações." });
  }
});

app.post("/api/quiz/results", (req, res) => {
  try {
    const { email, level, score, total, passed, practice } = req.body;
    if (!email || !level || score === undefined || total === undefined || passed === undefined) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes para salvar o resultado do quiz." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const isPractice = practice === true || practice === "true";
    dbOperations.saveQuizResult(cleanEmail, level, score, total, passed, isPractice);
    
    // Get updated user so we can return their current guitar_level
    const user = dbOperations.getUserByEmail(cleanEmail);
    
    return res.json({ 
      success: true, 
      guitarLevel: user ? user.guitar_level : level 
    });
  } catch (error) {
    console.error("Erro ao salvar resultado do quiz:", error);
    return res.status(500).json({ error: "Erro ao salvar resultado da avaliação." });
  }
});

// Persistent AI chat history logs
app.get("/api/chat/history", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "O e-mail é obrigatório." });
    }

    const history = dbOperations.getChatLog(email);
    return res.json({ messages: history });
  } catch (error) {
    console.error("Erro ao carregar histórico do chat:", error);
    return res.status(500).json({ error: "Erro ao carregar histórico de conversas." });
  }
});

app.post("/api/chat/history/clear", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "O e-mail é obrigatório." });
    }
    dbOperations.clearChat(email.trim().toLowerCase());
    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao apagar histórico do chat:", error);
    return res.status(500).json({ error: "Erro ao limpar histórico." });
  }
});

// Endpoint for guitar assistant chat
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, email } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Mensagens são obrigatórias e devem ser um array." });
    }

    const userEmail = email ? email.trim().toLowerCase() : null;

    // Check last user message and save it to SQL db list
    if (userEmail && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "user") {
        dbOperations.addMessage(userEmail, "user", lastMsg.content);
      }
    }

    const systemInstruction = `Você é o "Professor de Violão IA", um instrutor de violão virtual extremamente atencioso, didático, encorajador e apaixonado pela música de violão clássico, folk e popular brasileiro (MPB, bossa nova, rock nacional, etc.). Seu objetivo é ajudar iniciantes a darem os seus primeiros passos com o violão acústico de nylon ou aço.

Sempre responda em português brasileiro.
Mantenha suas respostas estruturadas e elegantes, usando formatação Markdown (negritos, listas de tópicos) de fácil leitura para um iniciante absoluto.

Diretrizes importantes:
1. Encorajamento constante: lembre-os de que dor nas pontas dos dedos e desafios para formar pestanas são comuns e desaparecem em poucas semanas.
2. Dicas de postura: lembre de manter a coluna ereta, o dedão (polegar) atrás do braço do violão de forma correta (verticalizado e sem subir demais) e as unhas curtas na mão esquerda (ou direita se canhoto).
3. Ensino de ritmos (levadas): represente graficamente com setas sempre que falar de batidas (ex: ↓, ↑, etc.) para ritmos comuns como Pop, Valsa, Sertanejo, Rock e Samba/MPB.
4. Recomende acordes simples como Am, C, G, D, E, Em, Dm antes de sugerir acordes com pestana complexos (como F ou B).
As respostas devem ser acolhedoras, amigáveis, precisas e focadas estritamente na prática musical e teórica de iniciantes em violão.`;

    // Map conversation into Gemini's format
    const contents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "";

    // Save reply status to local DB as well
    if (userEmail && replyText) {
      dbOperations.addMessage(userEmail, "assistant", replyText);
    }

    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Erro no assistente Gemini:", error);
    res.status(500).json({ error: error?.message || "Erro de conexão com o assistente do violão." });
  }
});

// Performance analytics routes
app.get("/api/performance/summary", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório." });
    }
    const summary = dbOperations.getUserPerformanceSummary(email);
    return res.json({ summary });
  } catch (error) {
    console.error("Erro ao obter resumo de desempenho:", error);
    return res.status(500).json({ error: "Erro interno ao consolidar relatório de desempenho." });
  }
});

app.post("/api/performance/session", (req, res) => {
  try {
    const { email, durationMinutes, focusArea, notes, difficulty } = req.body;
    if (!email || !durationMinutes || !focusArea || !difficulty) {
      return res.status(400).json({ error: "Muitos campos obrigatórios estão ausentes." });
    }
    const success = dbOperations.addPracticeSession(
      email.trim().toLowerCase(),
      Number(durationMinutes),
      String(focusArea),
      String(notes || ""),
      String(difficulty)
    );
    return res.json({ success });
  } catch (error) {
    console.error("Erro ao adicionar sessão de treino:", error);
    return res.status(500).json({ error: "Erro interno no servidor de treinos." });
  }
});

// Video lessons routes
app.get("/api/video-lessons", (req, res) => {
  try {
    const level = String(req.query.level || "").trim();
    if (level) {
      const videos = dbOperations.getVideoLessons(level);
      return res.json({ videos });
    } else {
      const videos = dbOperations.getAllVideoLessons();
      return res.json({ videos });
    }
  } catch (error) {
    console.error("Erro ao carregar videoaulas:", error);
    return res.status(500).json({ error: "Erro interno ao buscar as videoaulas por nível." });
  }
});

// Student questions routes
app.get("/api/student-questions", (req, res) => {
  try {
    const level = String(req.query.level || "").trim();
    if (!level) {
      return res.status(400).json({ error: "O parâmetro de nível é obrigatório." });
    }
    const questions = dbOperations.getStudentQuestions(level);
    return res.json({ questions });
  } catch (error) {
    console.error("Erro ao carregar dúvidas dos alunos:", error);
    return res.status(500).json({ error: "Erro interno ao buscar as dúvidas por nível." });
  }
});

app.post("/api/student-questions", (req, res) => {
  try {
    const { email, level, title, question } = req.body;
    if (!email || !level || !title || !question) {
      return res.status(400).json({ error: "Todos os campos (email, level, title, question) são obrigatórios." });
    }
    const result = dbOperations.addStudentQuestion(
      email.trim().toLowerCase(),
      String(level).trim(),
      String(title).trim(),
      String(question).trim()
    );
    return res.json({ success: true, insertId: result.lastInsertRowid });
  } catch (error) {
    console.error("Erro ao registrar dúvida do aluno:", error);
    return res.status(550).json({ error: "Erro interno ao enviar sua pergunta." });
  }
});

// Admin student questions routes for seeding/managing custom explanatory videos
app.get("/api/admin/student-questions", (req, res) => {
  try {
    const adminEmail = String(req.query.adminEmail || "").trim().toLowerCase();
    if (adminEmail !== "arturguilhermechecchi@gmail.com") {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores podem ver todas as dúvidas." });
    }
    const questions = dbOperations.getAllStudentQuestions();
    return res.json({ questions });
  } catch (error) {
    console.error("Erro ao puxar todas as dúvidas pelo administrador:", error);
    return res.status(500).json({ error: "Erro interno ao buscar as dúvidas gerais." });
  }
});

app.post("/api/admin/student-questions/answer", (req, res) => {
  try {
    const { adminEmail, questionId, answer, videoUrl, videoTitle } = req.body;
    if (!adminEmail || !questionId || !answer) {
      return res.status(400).json({ error: "Parâmetros adminEmail, questionId e answer são obrigatórios para registrar uma resposta." });
    }

    if (adminEmail.trim().toLowerCase() !== "arturguilhermechecchi@gmail.com") {
      return res.status(403).json({ error: "Acesso negado. Apenas o administrador Artur pode responder às dúvidas." });
    }

    const success = dbOperations.answerStudentQuestion(
      Number(questionId),
      String(answer).trim(),
      videoUrl ? String(videoUrl).trim() : undefined,
      videoTitle ? String(videoTitle).trim() : undefined
    );

    if (!success) {
      return res.status(404).json({ error: "Pergunta do aluno não encontrada no SQLite." });
    }

    return res.json({ success: true, message: "Resposta e vídeo explicativo gravados com sucesso no SQLite!" });
  } catch (error) {
    console.error("Erro ao salvar resposta do administrador no SQLite:", error);
    return res.status(500).json({ error: "Erro interno do servidor ao registrar resposta." });
  }
});

// Advanced Chords Lock API
app.get("/api/chords/lock-status", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const status = dbOperations.getChordLockStatus(email || undefined);
    return res.json(status);
  } catch (error) {
    console.error("Erro ao buscar status do bloqueio de acordes:", error);
    return res.status(500).json({ error: "Erro interno ao consultar status de bloqueio dos acordes." });
  }
});

app.post("/api/admin/chords/toggle-lock", (req, res) => {
  try {
    const { adminEmail, isLocked } = req.body;
    if (!adminEmail || adminEmail.trim().toLowerCase() !== "arturguilhermechecchi@gmail.com") {
      return res.status(403).json({ error: "Acesso negado. Apenas o administrador Artur pode alterar configurações globais." });
    }
    
    const success = dbOperations.toggleChordLock(!!isLocked);
    return res.json({ success, globalLocked: !!isLocked, message: `Bloqueio dos acordes avançados alterado para: ${!!isLocked}` });
  } catch (error) {
    console.error("Erro ao alterar bloqueio de acordes avançados:", error);
    return res.status(500).json({ error: "Erro interno do servidor ao alterar bloqueio." });
  }
});

// PDF download logging routes
app.post("/api/pdf-download/log", (req, res) => {
  try {
    const { email, downloadType } = req.body;
    if (!email || !downloadType) {
      return res.status(400).json({ error: "E-mail e tipo de download são obrigatórios." });
    }
    const success = dbOperations.logPdfDownload(email.trim().toLowerCase(), String(downloadType));
    return res.json({ success });
  } catch (error) {
    console.error("Erro ao registrar log de download de PDF:", error);
    return res.status(500).json({ error: "Erro interno ao salvar log de download do PDF." });
  }
});

app.get("/api/pdf-download/history", (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório." });
    }
    const history = dbOperations.getUserPdfDownloads(email);
    return res.json({ history });
  } catch (error) {
    console.error("Erro ao carregar histórico de downloads de PDF:", error);
    return res.status(500).json({ error: "Erro interno ao buscar histórico de downloads de PDF." });
  }
});

app.get("/api/admin/pdf-downloads", (req, res) => {
  try {
    const adminEmail = String(req.query.adminEmail || "").trim().toLowerCase();
    if (adminEmail !== "arturguilhermechecchi@gmail.com") {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores podem ver o log global de downloads." });
    }
    const downloads = dbOperations.getAllPdfDownloads();
    return res.json({ downloads });
  } catch (error) {
    console.error("Erro ao puxar todos os downloads de PDF pelo administrador:", error);
    return res.status(500).json({ error: "Erro interno ao buscar histórico completo de downloads." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express dev/production server running on http://localhost:${PORT}`);
  });
}

startServer();
