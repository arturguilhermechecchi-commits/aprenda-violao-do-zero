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

    return res.json({
      username: user.username,
      email: user.email,
      joinedAt: user.joined_at,
    });
  } catch (error: any) {
    console.error("Erro na autenticação de login (SQLite):", error);
    return res.status(500).json({ error: "Erro interno no servidor de login." });
  }
});

app.post("/api/auth/register", (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Todos os campos (e-mail, nome, senha) são obrigatórios." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    const existingUser = dbOperations.getUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Este e-mail de usuário já está cadastrado." });
    }

    dbOperations.createUser(cleanEmail, cleanUsername, password);
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
    return res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas do SQLite:", error);
    return res.status(500).json({ error: "Erro para consolidar as estatísticas gerais." });
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
