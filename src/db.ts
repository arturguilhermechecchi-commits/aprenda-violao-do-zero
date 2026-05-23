import Database from "better-sqlite3";
import path from "path";

// Locate or create the SQLite database file in the project workspace
const dbPath = path.resolve(process.cwd(), "guitar_studio.db");
console.log(`[Database] Inicializando banco de dados SQLite em: ${dbPath}`);

const db = new Database(dbPath);

// Configure the database connection for high concurrency and safety
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    joined_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lessons_completed (
    user_email TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (user_email, lesson_id),
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS student_notes (
    user_email TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'lesson' ou 'song'
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_email, item_id, item_type),
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' ou 'assistant'
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );
`);

// Seed default test student account so it works out of the box
try {
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, username, password, joined_at)
    VALUES (?, ?, ?, ?)
  `);
  
  // Seed default student
  insertUser.run(
    "aluno@violao.com",
    "Iniciante no Violão",
    "123", // Simple default password
    new Date().toLocaleDateString("pt-BR")
  );
  
  // Seed admin user using metadata email
  insertUser.run(
    "arturguilhermechecchi@gmail.com",
    "Artur Guilherme (Admin)",
    "admin123", // Admin default password
    new Date().toLocaleDateString("pt-BR")
  );
  
  console.log("[Database] Contas iniciais semeadas com sucesso no SQLite.");
} catch (error) {
  console.error("[Database] Erro ao semear contas iniciais:", error);
}

// Database helper operations
export const dbOperations = {
  // Users
  getUserByEmail(email: string) {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email) as any;
  },

  createUser(email: string, username: string, passwordHash: string) {
    const stmt = db.prepare(`
      INSERT INTO users (email, username, password, joined_at)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(email, username, passwordHash, new Date().toLocaleDateString("pt-BR"));
    return info.changes > 0;
  },

  // Admin query dashboards stats
  getAdminConsoleData() {
    // 1. Total users
    const usersCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
    
    // 2. Total completed lessons count
    const completedLessonsCount = (db.prepare("SELECT COUNT(*) as count FROM lessons_completed").get() as any).count;
    
    // 3. Total active notes
    const notesCount = (db.prepare("SELECT COUNT(*) as count FROM student_notes").get() as any).count;
    
    // 4. Total support messages sent to AI
    const messagesCount = (db.prepare("SELECT COUNT(*) as count FROM chat_messages").get() as any).count;

    // 5. Active list of registered users with completed lesson counts
    const usersList = db.prepare(`
      SELECT 
        u.id, 
        u.email, 
        u.username, 
        u.joined_at,
        (SELECT COUNT(*) FROM lessons_completed lc WHERE lc.user_email = u.email) as lessons_done,
        (SELECT COUNT(*) FROM student_notes sn WHERE sn.user_email = u.email) as notes_done,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.user_email = u.email) as messages_sent
      FROM users u
      ORDER BY u.id DESC
    `).all() as any[];

    // 6. Recent study notes across all users
    const recentNotes = db.prepare(`
      SELECT 
        sn.user_email, 
        u.username,
        sn.item_id, 
        sn.item_type, 
        sn.content, 
        sn.updated_at
      FROM student_notes sn
      JOIN users u ON sn.user_email = u.email
      ORDER BY sn.updated_at DESC
      LIMIT 12
    `).all() as any[];

    return {
      usersCount,
      completedLessonsCount,
      notesCount,
      messagesCount,
      usersList,
      recentNotes
    };
  },

  // Lessons track
  getCompletedLessons(email: string): string[] {
    const stmt = db.prepare("SELECT lesson_id FROM lessons_completed WHERE user_email = ?");
    const rows = stmt.all(email) as any[];
    return rows.map((row) => row.lesson_id);
  },

  completeLesson(email: string, lessonId: string) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO lessons_completed (user_email, lesson_id, completed_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(email, lessonId, new Date().toISOString());
  },

  uncompleteLesson(email: string, lessonId: string) {
    const stmt = db.prepare(`
      DELETE FROM lessons_completed WHERE user_email = ? AND lesson_id = ?
    `);
    stmt.run(email, lessonId);
  },

  // Notes
  getNote(email: string, itemId: string, itemType: string): string {
    const stmt = db.prepare(`
      SELECT content FROM student_notes 
      WHERE user_email = ? AND item_id = ? AND item_type = ?
    `);
    const row = stmt.get(email, itemId, itemType) as any;
    return row ? row.content : "";
  },

  saveNote(email: string, itemId: string, itemType: string, content: string) {
    const stmt = db.prepare(`
      INSERT INTO student_notes (user_email, item_id, item_type, content, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_email, item_id, item_type) DO UPDATE SET
        content = excluded.content,
        updated_at = excluded.updated_at
    `);
    stmt.run(email, itemId, itemType, content, new Date().toISOString());
  },

  // Chat message logs helper
  getChatLog(email: string) {
    const stmt = db.prepare(`
      SELECT role, content, timestamp FROM chat_messages 
      WHERE user_email = ? 
      ORDER BY id ASC
    `);
    return stmt.all(email) as any[];
  },

  addMessage(email: string, role: "user" | "assistant", content: string) {
    const stmt = db.prepare(`
      INSERT INTO chat_messages (user_email, role, content, timestamp)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(email, role, content, new Date().toISOString());
  },

  clearChat(email: string) {
    const stmt = db.prepare("DELETE FROM chat_messages WHERE user_email = ?");
    stmt.run(email);
  }
};

export default db;
