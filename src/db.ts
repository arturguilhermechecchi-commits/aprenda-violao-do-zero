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
    joined_at TEXT NOT NULL,
    guitar_level TEXT DEFAULT 'Iniciante'
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

  CREATE TABLE IF NOT EXISTS user_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    login_at TEXT NOT NULL,
    user_agent TEXT,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS level_test_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON stringified array of strings
    correct_index INTEGER NOT NULL,
    explanation TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS level_test_results (
    user_email TEXT NOT NULL,
    level TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    passed INTEGER NOT NULL, -- 1 for True, 0 for False
    completed_at TEXT NOT NULL,
    blocked_until TEXT, -- ISO Date String when the block expires
    PRIMARY KEY (user_email, level),
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS completed_challenges (
    user_email TEXT NOT NULL,
    challenge_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (user_email, challenge_id),
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_audio_settings (
    user_email TEXT PRIMARY KEY,
    master_volume INTEGER DEFAULT 80,
    guitar_type TEXT DEFAULT 'acoustic_steel',
    metronome_frequency INTEGER DEFAULT 1000,
    strum_speed TEXT DEFAULT 'strum',
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    lesson_order INTEGER NOT NULL,
    content_markdown TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'Iniciante'
  );

  CREATE TABLE IF NOT EXISTS practice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    session_date TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    focus_area TEXT NOT NULL,
    notes TEXT,
    difficulty TEXT NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS video_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    level TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructor TEXT NOT NULL,
    thumbnail_url TEXT
  );

  CREATE TABLE IF NOT EXISTS student_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    level TEXT NOT NULL,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    video_url TEXT,
    video_title TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pdf_downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    download_type TEXT NOT NULL,
    downloaded_at TEXT NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS harmonic_fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_key TEXT UNIQUE NOT NULL,
    main_chord TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS harmonic_field_chords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_id INTEGER NOT NULL,
    degree TEXT NOT NULL,
    chord_name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (field_id) REFERENCES harmonic_fields (id) ON DELETE CASCADE
  );

`);

// Migrate existing databases to have 'guitar_level' column if they don't have it
try {
  db.exec("ALTER TABLE users ADD COLUMN guitar_level TEXT DEFAULT 'Iniciante'");
  console.log("[Database] Coluna 'guitar_level' adicionada com sucesso.");
} catch (e) {
  // Column already exists or index is set, no problem
}

// Migrate to have 'blocked_until' on level_test_results if it does not exist
try {
  db.exec("ALTER TABLE level_test_results ADD COLUMN blocked_until TEXT");
  console.log("[Database] Coluna 'blocked_until' adicionada a level_test_results com sucesso.");
} catch (e) {
  // Column already exists, no problem
}

// Create and seed system_locks table for restricting features such as advanced chords
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_locks (
      lock_name TEXT PRIMARY KEY,
      is_locked INTEGER DEFAULT 1
    )
  `);
  db.prepare("INSERT OR IGNORE INTO system_locks (lock_name, is_locked) VALUES ('advanced_chords', 1)").run();
  console.log("[Database] Tabela 'system_locks' criada e semeada com sucesso.");
} catch (e) {
  console.error("Erro ao configurar system_locks no SQLite:", e);
}

// Create custom_songs table for allowing administrator to add custom songs dynamically
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      bpm INTEGER NOT NULL,
      rhythm TEXT NOT NULL,
      strumming_pattern TEXT NOT NULL,
      chords_used TEXT NOT NULL,
      lines TEXT NOT NULL,
      video_tip TEXT
    )
  `);
  console.log("[Database] Tabela 'custom_songs' configurada com sucesso.");
} catch (e) {
  console.error("Erro ao configurar custom_songs no SQLite:", e);
}

// Seed all lessons (beginner, intermediate, advanced) in the database
try {
  console.log("[Database] Semeando/atualizando tabela de lições no SQLite...");
  
  // Clear existing lessons to ensure no duplicate or dangling IDs exist
  db.prepare("DELETE FROM lessons").run();
  
  const insertLesson = db.prepare(`
    INSERT OR REPLACE INTO lessons (id, title, category, description, lesson_order, content_markdown, level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Original beginner lessons
  const beginnerLessons = [
    {
      id: "les-1",
      title: "Anatomia do Violão",
      category: "anatomy",
      description: "Conheça as partes essenciais do seu instrumento para entender lições e cifras.",
      order: 1,
      contentMarkdown: `O violão acústico clássico tem componentes essenciais que você precisa conhecer:

1. **Mão (Headstock ou Paleta):** Parte superior onde ficam as tarraxas que apertam ou afrouxam as cordas para afiná-las.
2. **Braço (Neck):** Onde você posiciona sua mão de apoio. O braço é dividido por pedaços metálicos chamados **Trastes**. O espaço entre os trastes são as **Casas**. Para tirar o som correto, pressione a corda sempre perto do traste metálico, e nunca em cima dele!
3. **Corpo (Cassa acústica):** A caixa de ressonância de madeira do violão. Ela amplifica o som das cordas naturalmente.
4. **Boca (Soundhole):** O buraco no corpo do violão por onde o ar vibra e o som sai projetado.
5. **Cavalete (Bridge):** Onde as cordas são presas na parte inferior do corpo do violão.

*Super dica para iniciantes:* O violão possui **6 cordas**, contadas de baixo para cima (da mais fina para a mais grossa):
- **1ª corda:** Mi aguda (Bordonzinho ou "mizinha")
- **2ª corda:** Si
- **3ª corda:** Sol
- **4ª corda:** Ré
- **5ª corda:** Lá
- **6ª corda:** Mi grave (Bordão ou "mizão")`
    },
    {
      id: "les-2",
      title: "Postura e Posicionamento dos Dedos",
      category: "posture",
      description: "Evite dores e lesões mantendo a coluna e braços alinhados corretamente.",
      order: 2,
      contentMarkdown: `Antes de tocar, certifique-se de estar confortável:

### 1. Como Sentar
- Sente-se na beirada de uma cadeira sem braços e apoie ambos os pés no chão.
- Se preferir o estilo de viola clássico, apoie a curva do violão sobre a coxa esquerda usando um apoio de pé. Se preferir estilo popular, apoie sobre a coxa direita.
- Mantenha as costas retas. Não curve a coluna sobre o violão para tentar olhar as casas, pois isso causa dor no pescoço!

### 2. O Polegar da Mão de Apoio (Mão Esquerda para destros)
- O dedão deve ficar escondido verticalmente atrás do braço do violão.
- Evite subir demais o dedão parecendo que está pendurado no instrumento. Ele deve servir como ponto de apoio centralizado para dar firmeza às pontas dos outros quatro dedos.

### 3. Arqueando os Dedos
- Seus dedos (1, 2, 3 e 4) devem tocar as cordas como se fossem garras - usando somente a **ponta bem verticalizada**.
- Mantenha as unhas da mão esquerda bem cortadas! Se a unha estiver comprida, ela baterá na madeira e impedirá que você consiga pressionar a corda corretamente.`
    },
    {
      id: "les-3",
      title: "O Primeiro Ritmo: Batida de Pop / Rock",
      category: "technique",
      description: "Sua primeira levada rítmica (Strumming) com a mão direita para acompanhar canções.",
      order: 3,
      contentMarkdown: `A batida de Pop ou Rock leve é perfeita porque serve para milhares de músicas populares. Veja como realizá-la com a sua mão rítmica (normalmente a direita):

### A Frequência das Batidas (Setas):
A sequência é composta por 6 movimentos simples. Desenhe esse padrão no ar e depois replique nas cordas abafadas:

**↓  ↓  ↑  ↑  ↓  ↑**

*Onde:*
- **↓** = Batida para baixo (use o polegar ou o dorso dos dedos indicador/médio descendo).
- **↑** = Batida para cima (use principalmente a ponta do polegar subindo delicadamente).

#### Como praticar com ritmo constante:
1. Comece imitando o ritmo de forma bem lenta e sussurrada.
2. Não pare os movimentos da mão direita! A mão deve continuar balançando em um fluxo contínuo.
3. Se o som sair meio 'áspero', relaxe o pulso. O segredo da batida bonita é o punho mole e leve!`
    },
    {
      id: "les-4",
      title: "Teoria Musical Sem Medo: O que são Cifras?",
      category: "theory",
      description: "Aprenda a ler o alfabeto musical universal aplicado ao braço do violão.",
      order: 4,
      contentMarkdown: `Na internet e nos aplicativos de cifragem, nós lemos as notas e acordes através de 7 letras do alfabeto. É de extrema importância decorá-las:

- **A** = Lá
- **B** = Si
- **C** = Dó
- **D** = Ré
- **E** = Mi
- **F** = Fá
- **G** = Sol

### Acordes Maiores vs. Menores:
- Quando a letra está sozinha (ex: **C**, **G**, **D**), o acorde é **Maior** (soa alegre e brilhante).
- Quando há a letra acompanhada de um "m" minúsculo (ex: **Am**, **Em**, **Dm**), o acorde é **Menor** (soa melancólico, introspectivo ou triste).

### Entendendo Casas e Diagramas:
- Nos dicionários de acordes, a linha horizontal superior representa o Nut (capotraste inicial plástico).
- As linhas verticais são as 6 cordas.
- O espaço entre as linhas horizontais são as marcas de dobras ou casas. Os números nos círculos indicam qual dedo pressionar naquela exata casa.`
    },
    {
      id: "les-5",
      title: "Dedilhado Dedos Livres (P.I.M.A)",
      category: "technique",
      description: "Esconda a palheta e domine a independência do dedilhado clássico e folk brasileiro.",
      order: 5,
      contentMarkdown: `O dedilhado é uma das técnicas mais bonitas e expressivas do violão. Ele dispensa a palheta e utiliza cada dedo da mão rítmica para vibrar cordas individuais:

### 1. Papel de cada Dedo:
- **P (Polegar):** Responsável por apoiar e desferir os baixos do acorde (as cordas de metal mais grossas: 6ª, 5ª e 4ª cordas). O polegar sempre puxa a corda de cima para baixo.
- **I (Indicador):** Encarregado estrito da 3ª corda (Sol). Puxa de baixo para cima.
- **M (Médio):** Encarregado da 2ª corda (Si). Puxa de baixo para cima.
- **A (Anelar):** Encarregado da 1ª corda (Mizinha). Puxa de baixo para cima.

### 2. O Padrão Mais Famoso (Arpejo Clássico 6/8):
Pratique a seguinte sequência de forma repetitiva e lenta no acorde de **Am** (Lá menor) ou **C** (Dó maior):

P -> I -> M -> A -> M -> I

*Como ler o exercício:*
1. Pressione o acorde de Dó maior (**C**).
2. Toque o baixo com o **Polegar** na 5ª corda.
3. Puxe a 3ª corda com o **Indicador**.
4. Puxe a 2ª corda com o **Médio**.
5. Puxe a 1ª corda com o **Anelar**.
6. Volte puxando a 2ª corda com o **Médio**.
7. Finalize o ciclo puxando a 3ª corda com o **Indicador**.

*Dica de Ouro:* Mantenha sua mão direita em formato de uma "concha" relaxada, afastando ligeiramente o polegar dos demais dedos para evitar que eles colidam ao dedilhar.`
    },
    {
      id: "les-6",
      title: "A Conquista Definitiva das Pestanas",
      category: "technique",
      description: "Resolva definitivamente suas dores ao tocar acordes como Fá (F) e Si menor (Bm).",
      order: 6,
      contentMarkdown: `A primeira grande barreira de todo estudante de violão é a temida **Pestana** (espremer todas as cordas com o dedo 1 indicador). Siga estes princípios para dominá-la rapidamente:

### 1. Ângulo Anatômico do Dedo 1 (Indicador):
- **Não use o lado de trás ou mole do dedo:** O erro comum é tentar esmagar as cordas usando a parte de trás do dedo (a sola digital). Em vez disso, gire seu dedo indicador levemente para fora, usando a **borda lateral externa** que é mais rígida (óssea). Isso facilitará as coisas!
- **Dedo arqueado próximo ao traste:** Posicione o dedo indicador um milímetro antes do traste metálico, e nunca no meio da casa. Quanto mais próximo ao metal, menor a força necessária.

### 2. O Posicionamento do Dedão de Apoio:
- Baixe o polegar atrás do braço do violão. Ele deve ficar centralizado, servindo de pinça no mesmo nível em que o seu dedo da pestana aperta a madeira.
- Não aperte apenas fechando os dedos, puxe o braço do violão sutilmente em direção ao seu peito usando o ombro esquerdo. Isso divide a carga física do aperto!

### 3. Exercício de Fortalecimento (Sem Acorde):
1. Monte apenas a pestana na **5ª casa** do violão (onde a tensão das cordas é mais maleável).
2. Toque corda por corda assegurando que todas estão vibrando sem zumbido.
3. Se soar limpo, arraste a pestana para a **4ª casa**, depois **3ª casa**, até chegar ao som cristalino no acorde de **F (Fá Maior)** na 1ª casa!`
    },
    {
      id: "les-beg7",
      title: "Desvendando o Sistema CAGED",
      category: "theory",
      description: "Aprenda o mapa definitivo do braço do violão para localizar e transportar acordes facilmente.",
      order: 7,
      contentMarkdown: `O **Sistema CAGED** (pronuncia-se "queibid") é possivelmente a ferramenta mais poderosa existente para desmistificar todo o braço do violão. Ele serve como uma bússola que permite que batesse o olho em qualquer casa e soubesse exatamente quais notas e acordes estão disponíveis.

### 1. O Nome Enigmático: C - A - G - E - D
O nome vem das 5 fôrmas de acordes maiores abertos (que aprendemos no início sem pestana):
- **C** (Dó Maior)
- **A** (Lá Maior)
- **G** (Sol Maior)
- **E** (Mi Maior)
- **D** (Ré Maior)

Essas cinco formas básicas de acordes conectam-se sequencialmente ao longo do braço do violão como um quebra-cabeça infinito!

---

### 2. O Conceito de Fôrma Móvel (Pestana como Capotraste)
A mágica acontece quando percebemos que podemos **mover** qualquer um desses 5 desenhos comuns ao longo das casas do violão. 

Para mover um acorde aberto, o metal do traste inicial (Nut) precisa ser substituído pelo nosso **dedo de pestana** (agindo como um capotraste móvel) ou deslocando os demais dedos.

#### Exemplo Prático: Movendo a Fôrma de Lá (A)
Pense no acorde de **Lá Maior (A)** comum, montado na casa 2:
- Se você avançar todo o desenho do acorde duas casas para a frente e colocar uma pestana na **Casa 2** do braço, a fôrma de "Lá" se transforma no acorde real de **Si Maior (B)**!
- Se você avançar mais uma casa (pestana na Casa 3) e mantiver o desenho/formato de Lá, você terá um **Dó Maior (C) com fôrma de Lá**.

---

### 3. O Mapa de Conexões de Tônicas (Root Notes)
Para dominar o posicionamento, você precisa saber em qual corda reside a nota tônica (a raiz/nome do acorde) de cada fôrma. Memorize esse mapa simples:

- **Fôrma de C (Dó)**: Tônica na **5ª corda** (e na 2ª corda)
- **Fôrma de A (Lá)**: Tônica na **5ª corda** (e na 3ª corda)
- **Fôrma de G (Sol)**: Tônica na **6ª corda** (e na 1ª e 3ª cordas)
- **Fôrma de E (Mi)**: Tônica na **6ª corda** (e na 4ª e 1ª cordas)
- **Fôrma de D (Ré)**: Tônica na **4ª corda** (e na 2ª corda)

#### O Encaixe Perfeito (C-A-G-E-D):
Os formatos vizinhos compartilham suas notas primárias. Veja como elas são unidas por suas tônicas comuns:
\`\`\`text
  [Fôrma C] --- (Compartilha Tônica na 5ª corda) --- [Fôrma A]
  [Fôrma A] --- (Compartilha Tônica na 3ª corda) --- [Fôrma G]
  [Fôrma G] --- (Compartilha Tônica na 6ª corda) --- [Fôrma E]
  [Fôrma E] --- (Compartilha Tônica na 4ª corda) --- [Fôrma D]
  [Fôrma D] --- (Compartilha Tônica na 2ª corda) --- [Fôrma C] ... (repete ciclo!)
\`\`\`

---

### 4. A Ordem das Conexões (C-A-G-E-D) ao Longo do Braço
Qualquer acorde maior do mundo pode ser tocado em 5 posições diferentes acompanhando a exata ordem da palavra **C-A-G-E-D**:

Se você montou um **Dó Maior (C)** na posição aberta comum (fôrma de Dó), a próxima posição deste mesmo acorde é usando a fôrma de **Lá (A)** na casa 3. A próxima será a fôrma de **Sol (G)** na casa 5, depois a fôrma de **Mi (E)** na casa 8 e, finalmente, a fôrma de **Ré (D)** na casa 10!

Essa regra se aplica a qualquer tom! Se você começa com a fôrma de **Mi (E)**, a sequência continua com a próxima letra da palavra: **Ré (D)**, depois volta para **Dó (C)**, **Lá (A)** e **Sol (G)**.

---

### 5. Exercício Prático de Fixação
Para treinar a sua percepção espacial no braço do violão:
1. Monte o acorde de **Dó Maior (C)** simples aberto.
2. Agora, monte o mesmo **Dó Maior (C)** usando a fôrma de **Lá (A)**: faça uma pestana na **3ª casa** e use os dedos 2, 3 e 4 para fazer o desenho de Lá na 5ª casa.
3. Alterne entre esses dois formatos sutilmente de 4 em 4 tempos. Sentiu como o som mais agudo ganha um brilho e preenchimento totalmente novos?

*Dica de Prática IA:* O CAGED elimina a necessidade de decorar milhões de acordes soltos. Se você domina as 5 fôrmas iniciais, você domina o braço inteiro!`
    }
  ];

  // Brand new Intermediate Level Guitar Teaching Method
  const intermediateLessons = [
    {
      id: "les-int1",
      title: "Campo Harmônico Maior e Conexão de Acordes",
      category: "theory",
      description: "Entenda como agrupar acordes que combinam entre si e crie suas próprias progressões harmônicas.",
      order: 1,
      contentMarkdown: `O Campo Harmônico é a família de acordes gerada a partir de uma escala. Dominar este conceito poupará horas tentando adivinhar de ouvido os acordes de uma música!

### 1. A Estrutura da Escala Maior (Dó - C)
A sequência de intervalos em tons (T) e semitons (ST) da escala maior é:
**T - T - ST - T - T - T - ST**

Gerando as notas: Dó (C), Ré (D), Mi (E), Fá (F), Sol (G), Lá (A), Si (B).

### 2. Formação do Campo Harmônico de Dó Maior
Ao empilharmos terças sobre cada nota da escala, obtemos a base harmônica padrão composta por acordes Maiores, Menores e um Diminuto:

1. **Iº Grau:** C - Dó Maior (Tônica)
2. **IIº Grau:** Dm - Ré Menor (Subdominante opcional)
3. **IIIº Grau:** Em - Mi Menor (Atuante como substituto da tônica)
4. **IVº Grau:** F - Fá Maior (Subdominante)
5. **Vº Grau:** G (ou G7) - Sol Maior (Dominante - gera tensão para voltar para C)
6. **VIº Grau:** Am - Lá Menor (Subdominante/Tônica Relativa)
7. **VIIº Grau:** Bm7(b5) - Si Meio-Diminuto (Raro no início!)

### 3. Macete para Conectar Acordes:
Sempre que estiver tocando em tom maior (ex: C), saiba que os acordes **C**, **F**, **G** e **Am** são os mais comuns e fáceis de transitar! Chutou um acorde fora desses graus? Provavelmente soará desalinhado rítmica ou melodicamente.`
    },
    {
      id: "les-int2",
      title: "Acordes com Sétima (Dissonâncias Fundamentais)",
      category: "technique",
      description: "Dê sofisticação e suavidade às suas músicas básicas trocando acordes simples por acordes com 7ª.",
      order: 2,
      contentMarkdown: `A sétima é a primeira nota dissonante que adicionamos à tríade (acorde básico de 3 notas) para transformá-la em uma tétrade. Ela traz maior calor, tensão ou romance para a música.

### 1. Sétima Maior (7M ou maj7) vs. Sétima Menor (7)
- **Sétima Maior (7M):** Soa extremamente suave, nostálgica, "MPB" e Jazzística. É a tônica com acréscimo da 7ª nota da escala.
  - **C7M:** x-3-2-0-0-0 (Pressione apenas os dedos de C, mas solte o indicador!).
  - **F7M:** x-8-7-5-5-x (Muito mais fácil que a pestana tradicional de F!).
- **Sétima Menor / Dominante (7):** É o acorde tenso, que "pede" para resolver em outra nota importante. Muito comum no Blues, Rock and Roll e Sertanejo.
  - **A7:** x-0-2-0-2-0 (Apenas dois dedos no braço do violão).
  - **D7:** x-0-0-2-1-2 (O clássico formato de 'triângulo' invertido).

### 2. O Exercício dos Ciclos Estilosos:
Toque a seguinte progressão repetindo a batida de Pop que você já conhece:

**C7M  →  Am7  →  Dm7  →  G7**

*Dica acústica:* Tente dedilhar essas transições sentindo a ressonância limpa de cada corda modificada, o som parecerá o lounge de um café aconchegante!`
    },
    {
      id: "les-int3",
      title: "Técnica de Palhetada Alternada e Arpejos",
      category: "technique",
      description: "Desenvolva independência com a palheta tocando para cima e para baixo de forma simétrica.",
      order: 3,
      contentMarkdown: `A palhetada alternada (Alternate Picking) é a fundação para ganhar velocidade, coordenação de solo e precisão rítmica no violão de aço ou guitarra.

### 1. Seguro Correto da Palheta:
- Apoie a palheta sobre a lateral do dedo indicador.
- Pressione com a polpa do polegar deixando apenas 1 centímetro da ponta da palheta visível.
- Não a aperte muito forte! Seus músculos do punho devem ficar soltos e relaxados.

### 2. A Regra de Alternância:
A regra número um é: independente de mudar de corda ou saltar casas, a palheta deve fazer movimentos alternados rígidos:

**↓  ↑  ↓  ↑  ↓  ↑  ↓  ↑**

### 3. O Exercício Cromático \"Aranha\" (1-2-3-4):
Usando uma corda de cada vez (começando na 6ª corda):
1. Toque Casa 5 (Dedo 1) com batida de palheta para **BAIXO (↓)**.
2. Toque Casa 6 (Dedo 2) com batida para **CIMA (↑)**.
3. Toque Casa 7 (Dedo 3) com batida para **BAIXO (↓)**.
4. Toque Casa 8 (Dedo 4) com batida para **CIMA (↑)**.
5. Desça para a 5ª corda e repita exatamente o mesmo ciclo sem perder o tempo do metrônomo!`
    },
    {
      id: "les-int4",
      title: "Batida Sincopada de Reggae, Funky e Ska",
      category: "technique",
      description: "Aprenda a tocar no tempo fraco (Off-Beat) abafando as cordas no tempo forte.",
      order: 4,
      contentMarkdown: `O segredo do Reggae e do Ska está no balanço do \"contra-tempo\". Enquanto na música clássica batemos forte no tempo 1, no reggae nós cortamos e batemos forte exatamente no \"e\" de cada compasso.

### 1. Como realizar o corte (Muting ou Ghost Notes):
Para dar aquele estalido seco (\"tchak\") característico:
- **Mão esquerda:** Se estiver fazendo acordes com pestana, basta folgar um pouquinho a força dos dedos imediatamente após bater a palheta. A corda para de vibrar e emite um som abafado.
- **Mão direita:** Apoie o lado da palma da mão sobre as cordas perto do cavalete (Palm Mute).

### 2. O Ritmo Reggae Tradicional:
A pulsação é dividida assim:
- **Tempo 1:** Abafado (Tchak / Silêncio)
- **Tempo 2:** Batida rápida para baixo (Acorde limpo)
- **Tempo 3:** Abafado (Tchak / Silêncio)
- **Tempo 4:** Batida rápida para baixo (Acorde limpo)

### 3. Padronização do Ritmo para Praticar:
Coloque um metrônomo e use os acordes de **Am** e **G**:

**↓ (Abafado)  →  ↑ (Toca Forte)  →  ↓ (Abafado)  →  ↑ (Toca Forte)**`
    },
    {
      id: "les-int5",
      title: "Ritmo de Guarânia e Dedilhado Ternário 3/4",
      category: "technique",
      description: "Sinta a beleza do tempo ternário (valsa sertaneja e guarânia sul-americana) com batida fluida.",
      order: 5,
      contentMarkdown: `Diferente dos ritmos em 4/4 (Pop/Rock/Reggae), a Guarânia e a Valsa usam o compasso **3/4**, onde contamos 1, 2, 3... 1, 2, 3...

### 1. A Divisão dos Tempos na Guarânia:
A pulsação de três tempos se divide em batidas sequenciais famosas na canção sertaneja de raiz (como \"Galopeira\" ou \"Cabecinha no Ombro\"):

**↓ (Baixo - com polegar acentuado)  →  ↓ (Baixo - rápido)  →  ↑ (Cima - médio/unha)  →  ↓ (Abafado rápido)**

No compasso ternário clássico:
- **Tempo 1:** Um toque de polegar descendo nas cordas graves.
- **Tempo 2:** Duas puxadas para baixo nas cordas finas.
- **Tempo 3:** Uma subida e uma descida curta.

### 2. Prática da Valsa Simples (Dedilhado 3/4):
Usando o polegar, indicador, médio e anelar (PIMA):
1. Toque o baixo com o **Polegar (P)** na 5ª corda (Tempo 1 - Forte).
2. Puxe as três cordas finas juntas com **IMA** (Tempo 2).
3. Puxe novamente as três cordas finas juntas com **IMA** (Tempo 3).

Repita isso continuamente no acorde de **Am** and **E**:

P -> [IMA] -> [IMA]

Esse dedilhado é a base de belíssimas canções acústicas da MPB e folclores!`
    },
    {
      id: "les-int6",
      title: "Dedilhado Dinâmico com Baixo Alternado",
      category: "technique",
      description: "Ganhe independência de arranjo fazendo o seu polegar alternar e caminhar entre as notas fundamentais do acorde.",
      order: 6,
      contentMarkdown: `Em arranjos solistas e músicas folclóricas, o violonista nunca toca o mesmo baixo repetidamente. O polegar caminha alternando entre o baixo principal e o baixo secundário.

### 1. Entendendo os Baixos de cada Acordo:
- **C (Dó maior):** Baixo Principal na 5ª corda (Dó). Baixo Secundário na 4ª corda (Mi ou Sol na 6ª corda).
- **G (Sol maior):** Baixo Principal na 6ª corda (Sol). Baixo Secundário na 4ª corda (Ré).
- **Am (Lá menor):** Baixo Principal na 5ª corda (Lá). Baixo Secundário na 4ª corda (Ré).

### 2. O Exercício Clássico de Dedilhado Alternado (Estilo Country/Folk):
Monte o acorde de **C** e faça o seguinte ciclo:
1. Toque a 5ª corda com o **Polegar** (Nota Dó).
2. Puxe as cordas finas com **I  M  A** em sequência.
3. Toque a 4ª corda com o **Polegar** (Nota Ré/Mi).
4. Puxe as cordas finas com **I  M  A** novamente.

Seu dedão fará um som de balanço constante \"Tum-Taca-Tum-Taca\" simulando uma banda acústica inteira tocando ao seu redor!`
    },
    {
      id: "les-int7",
      title: "Escala Pentatônica Menor - O Segredo dos Solos",
      category: "theory",
      description: "Conheça a escala de 5 notas que serve como pedra fundamental para improvisar no rock, blues e pop.",
      order: 7,
      contentMarkdown: `A escala pentatônica menor é, sem sombra de dúvidas, a ferramenta mais importante da história dos solos modernos. Ela é elegante, livre de notas difíceis ou semitons dissonantes indesejados e funciona de prima sobre bases do mesmo tom.

### 1. O que é a Pentatônica?
Como o nome sugere, é uma escala de 5 notas (\`penta\`). Enquanto as escalas maiores e menores tradicionais possuem 7 notas, a pentatônica remove os intervalos de maior tensão (a 2ª e a 6ª menor no caso do tom de Am).

- Escala de Lá Menor Natural: \`Lá - Si - Dó - Ré - Mi - Fá - Sol\` (7 notas)
- Escala Pentatônica de Lá Menor: \`Lá - Dó - Ré - Mi - Sol\` (5 notas, retirando-se o \`Si\` e o \`Fá\`).

### 2. O Desenho Clássico \"Formato 1\" (Em Lá Menor):
Para tocar de ponta a ponta nas seis cordas a partir da Casa 5 do violão real:

- **6ª Corda:** Casa 5 (Lá - tônica) e Casa 8 (Dó)
- **5ª Corda:** Casa 5 (Ré) e Casa 7 (Mi)
- **4ª Corda:** Casa 5 (Sol) e Casa 7 (Lá)
- **3ª Corda:** Casa 5 (Dó) e Casa 7 (Ré)
- **2ª Corda:** Casa 5 (Mi) e Casa 8 (Sol)
- **1ª Corda (Mizinha):** Casa 5 (Lá) e Casa 8 (Dó)

### 3. Rotina Prática:
1. Use palhetada alternada rígida (↓ ↑) para subir e descer por essas notas.
2. Certifique-se de prender cada casa com as pontas dos dedos para que não haja vibrações abafadas ou ruídos extras.`
    },
    {
      id: "les-int8",
      title: "Tríade de Cadência II - V - I (Dominância e Resolução)",
      category: "theory",
      description: "Desvende a progressão harmônica mais famosa e amplamente utilizada na música Ocidental.",
      order: 8,
      contentMarkdown: `Se você já ouviu uma música de jazz, MPB ou Bossa Nova e sentiu que a harmonia flui como se contasse uma história, provavelmente estava ouvindo a Cadência **II - V - I**.

### 1. O Concepto de Tensão e Movimento (Funções Harmônicas)
Os acordes de uma escala não servem apenas para soar bem isoladamente; eles possuem funções psicológicas específicas:
- **Tônica (I):** Sensação de repouso, estabilidade, casa e fim de jornada.
- **Subdominante (II ou IV):** Sensação de movimento, afastamento e preparação.
- **Dominante (V ou VII):** Sensação de tensão máxima, expectativa intensa e urgência de voltar para a Tônica.

### 2. A Sequência II - V - I (No Tom de Dó Maior - C)
Ao usarmos esses graus sequencialmente, criamos uma narrativa clássica do violonista:

1. **II Grau (Subdominante / Preparação):** **Dm7** (Menor)
2. **V Grau (Dominante / Alta Tensão):** **G7** (Maior com 7ª menor)
3. **I Grau (Tônica / Resolução Doce):** **C7M** (Maior com 7ª maior)

### 3. Execução no Violão:
Toque este loop lento para treinar seu ouvido rítmico a discernir a mudança de emoção do acorde:

**Dm7 (2 compassos) → G7 (2 compassos) → C7M (4 compassos)**

Perceba como o som começa introspectivo no **Dm7**, ganha uma urgência ansiosa no **G7** e descansa incrivelmente pacífico ao pousar no **C7M**!`
    },
    {
      id: "les-int9",
      title: "CAGED Menor: Mapeando Acordes Menores",
      category: "theory",
      description: "Adapte as 5 fôrmas móveis do sistema CAGED para acordes menores de fôrma livre.",
      order: 9,
      contentMarkdown: `O sistema CAGED não serve apenas para acordes maiores! Quase todos os violonistas de nível intermediário dominam as pestanas maiores, mas travam ao tentar transportar acordes menores em outras regiões do braço. 

Nesta lição, vamos aprender a transpor as correspondências menores das 5 fôrmas básicas.

---

### 1. As 5 Fôrmas Menores Abertas Equivalentas
Embora a palavra "CAGED" utilize as letras dos acordes maiores, cada uma possui um formato menor aberto bem conhecido:
- **C** (Dó maior) vira **Cm** (Dó menor - executado na 3ª casa na fôrma de Am)
- **A** (Lá maior) vira **Am** (Lá menor)
- **G** (Sol maior) vira **Gm** (Sol menor)
- **E** (Mi maior) vira **Em** (Mi menor)
- **D** (Ré maior) vira **Dm** (Ré menor)

---

### 2. Mapeamento das Fôrmas Menores mais Importantes

#### A. A Fôrma de Am (Lá Menor Móvel) - Tônica na 5ª Corda
É a fôrma menor móvel mais popular do mundo. 
- Para fazer o acorde de **Dó Menor (Cm)**: monte uma pestana na **Casa 3** e faça o formato de Lá Menor à frente.
- **Digitação**: \`X - 3 - 5 - 5 - 4 - 3\`

#### B. A Fôrma de Em (Mi Menor Móvel) - Tônica na 6ª Corda
É a segunda fôrma mais usada, ideal para canções de rock e MPB de peso.
- Para fazer o acorde de **Sol Menor (Gm)**: monte uma pestana na **Casa 3** e faça o formato de Mi Menor (folgue o dedo 2).
- **Digitação**: \`3 - 5 - 5 - 3 - 3 - 3\`

#### C. A Fôrma de Dm (Ré Menor Móvel) - Tônica na 4ª Corda
Excelente para sonoridades mais brilhantes nas três primeiras cordas, muito usada no flamenco e dedilhados jazzísticos.
- Para fazer o acorde de **Fá Menor (Fm)** em fôrma de Dm: suba 3 casas e mude as notas.
- **Digitação**: \`X - X - 3 - 5 - 6 - 4\` (Pestana curta nas primeiras cordas)

#### D. A Fôrma de Gm e Cm Móveis
Esses formatos inteiros são menos utilizados em pestanas completas por exigirem lances e aberturas de dedos muito desconfortáveis (como a fôrma de Gm aberta). 
- **O Segredo Profissional**: Toque apenas partes (tríades) dessas fôrmas nas cordas do meio!
- Exemplo de **Dó Menor (Cm)** na fôrma de **Gm**: toque apenas as cordas 4, 3 e 2 na Casa 5 (\`X - 5 - 5 - 5 - X - X\`). Isso soará limpo e poupará sua mão fisicamente!

---

### 3. Exercício Prático do CAGED Menor
Para fixar esses desenhos, toque a seguinte progressão usando fôrmas móveis diferentes para o mesmo tom menor de **Am (Lá Menor)**:

1. Toque **Am** aberto (Fôrma de Lá Menor comum).
2. Toque **Am** na fôrma de **Em** (Pestana na Casa 5 e formato de Mi menor).
3. Toque **Am** na fôrma de **Dm** (Formato de Ré Menor na Casa 7).

*Dica IA:* Sentir o mesmo tom "andar" pelo braço em três oitavas e timbres variados abrirá seus ouvidos de forma definitiva!`
    }
  ];

  // Original advanced lessons
  const advancedLessons = [
    {
      id: "les-adv1",
      title: "Síncope Brasileira e Harmonia de Bossa Nova",
      category: "technique",
      description: "Desvende acordes complexos com extensões e o marcante balanço de João Gilberto.",
      order: 1,
      contentMarkdown: `A Bossa Nova revolucionou o violão mundial com o seu ritmo altamente sincopado (onde acentuamos os tempos fracos da música) e seus acordes cheios de cores sonoras.

### 1. Acordes com Extensões de Jazz:
Deixe de lado os acordes básicos e experimente montagens com Dissonâncias. Elas soam sofisticadas e maravilhosas no violão de nylon:

- **C7M (Dó com Sétima Maior):** \`X - 3 - 2 - 4 - 1 - X\` (Som nostálgico e elegante)
- **Dm9 (Ré menor com Nona):** \`X - 5 - 3 - 5 - 5 - X\`
- **G7(13) (Sol com Sétima e Décima Terceira):** \`3 - X - 3 - 4 - 5 - X\`

### 2. O Balanço Rítmico (Síncope da Guitarrística):
A Bossa Nova é movida pela independência entre o Baixo (Polegar - marcando o tempo) e a Harmonia (Indicador, Médio, Anelar - puxando os acordes flutuantes entre os tempos).

Pratique a sequência rítmica abafando as cordas no início:
- **Tempo 1:** Baixo (Polegar) e Acorde (IMA) juntos.
- **Contra-tempo:** Toque o Acorde sutilmente enquanto a pulsação principal está em silêncio.
- **Padrão clássico de Bossa:** \`[P + IMA] -> [Silêncio] -> [IMA] -> [P] -> [IMA]\`

*Conselho musical:* Pratique lentamente batendo o pé no chão no tempo de metrônomo 60 BPM para fixar o sincopado sem correr.`
    },
    {
      id: "les-adv2",
      title: "Escala Pentatônica e Solarização",
      category: "theory",
      description: "Abra as asas da improvisação no braço inteiro com o mapa mais amado dos guitarristas.",
      order: 2,
      contentMarkdown: `A Escala Pentatônica é uma sequência mágica composta por **5 notas essenciais**. Por não possuir semitons diretos ou intervalos muito dissonantes, qualquer nota que você improvisar dentro dela sempre soará bem com a base menor.

### 1. O Padrão Clássico: Pentatônica de Am (Lá Menor):
Começando na **5ª casa** do violão, este é o shape que você deve digitalizar e decorar:

\`\`\`text
Mão Esquerda (C-C-D-D-D-D):
Cordas:
6ª Corda (Mizão): |---(5)---|---------|---(8)---| (Dedos 1 e 4)
5ª Corda (Lá):    |---(5)---|---------|---(7)---| (Dedos 1 e 3)
4ª Corda (Ré):    |---(5)---|---------|---(7)---| (Dedos 1 e 3)
3ª Corda (Sol):   |---(5)---|---------|---(7)---| (Dedos 1 e 3)
2ª Corda (Si):    |---(5)---|---------|---(8)---| (Dedos 1 e 4)
1ª Corda (Mizinha):|---(5)---|---------|---(8)---| (Dedos 1 e 4)
Casa:               5ª Casa             8ª Casa
\`\`\`

### 2. Exercícios de Pentatônica Avançada (Sequências e Padrões):
Para de fato dominar o improviso e destravar a velocidade mecânica no braço, você não deve solar apenas subindo e descendo as notas linearmente. Pratique estas 4 rotinas refinadas:

#### Exercício A: Padrão Rítmico de 3 em 3 (Tercinas de Velocidade)
Suba a escala tocando 3 notas consecutivas, volte 1 e toque mais 3. Esse exercício quebra a linearidade do movimento e é o segredo do fraseado rápido e refinado.
- **Notas em Am:** \`(Lá, Dó, Ré) -> (Dó, Ré, Mi) -> (Ré, Mi, Sol) -> (Mi, Sol, Lá) -> ...\`
- **Modo prático:** Ajuste o metrônomo para **80 BPM** em tercinas (três notas por batida do click: *TÁ-ca-ta TÁ-ca-ta*). Mantenha a palhetada alternada estrita: Baixo (↓), Cima (↑), Baixo (↓).

#### Exercício B: Padrão de 4 em 4 (Quadras de Alta Célula)
Ideal para sincronia de palheta em compassos 4/4 (Estilo Semicolcheia). Suba 4 notas, retorne para a segunda nota e faça mais 4.
- **Digitação nas cordas 6ª e 5ª:** \`Casa: 6ª-(5), 6ª-(8), 5ª-(5), 5ª-(7) | Avança: 6ª-(8), 5ª-(5), 5ª-(7), 4ª-(5)\`
- **Sabor rítmico:** Toque acentuando fortemente a primeira nota de cada grupo de 4 (*UM-dois-três-quatro, UM-dois-três-quatro*). Ideal para ganhar velocidade em solos de rock, metal e pop.

#### Exercício C: Salto de Cordas (String Skipping)
Faça a palhetada alternando entre cordas intercaladas para dar um ar moderno e saltitante ao improviso, muito comum no Jazz-Fusion moderno.
- **Como treinar:**
  1. Toque as notas da **6ª corda** \`[5, 8]\`
  2. Pule a 5ª corda e vá direto para as notas da **4ª corda** \`[5, 7]\`
  3. Volte e toque as notas da **5ª corda** \`[5, 7]\`
  4. Pule a 4ª corda e vá direto para a **3ª corda** \`[5, 7]\`

#### Exercício D: Lick Avançado (Blues-Rock clássico na 5ª casa)
Combine bends, double-stops e ligaduras num só fraseado espetacular de improviso:
\`\`\`text
1. Faça um "Bend" de 1 tom na 2ª corda (casa 8) subindo a afinação até o som da casa 10.
2. Com o mesmo dedo apoiado sob as cordas finas, toque ao mesmo tempo as cordas 1ª e 2ª na casa 5 (Double Stop clássico de Blues!).
3. Toque a 3ª corda na casa 7 fazendo um rápido "Pull-off" (puxão de corda) para a casa 5.
4. Finalize resolvendo com firmeza na tônica Lá (4ª corda, casa 7) com um generoso vibrato selvagem!
\`\`\`

### 3. Técnicas Expressivas Essenciais:
- **Hammer-ons e Pull-offs:** Use o martelado dos dedos para ligar uma nota a outra suavemente sem palhetar duas vezes.
- **Slide:** Deslize o dedo de uma casa para outra arrastando-o (ex: da casa 7 para a 9) para criar um efeito fluído e emotivo.
- **Vibrato:** Balance o dedo sutilmente após pressionar a nota para encorpar a vibração natural da corda, mantendo o sustento do timbre.`
    },
    {
      id: "les-adv3",
      title: "Harmonia Funcional Avançada: Dominantes Secundários e SubV7",
      category: "theory",
      description: "Domine o uso de tensões secundárias e desça baixos cromaticamente de forma cinematográfica.",
      order: 3,
      contentMarkdown: `A Harmonia Funcional analisa os acordes baseados nas sensações e funções que provocam no ouvido (Tônica/Repouso, Subdominante/Transição, Dominante/Tensão). No nível avançado, expandimos estas ideias de forma extraordinária.

### 1. Dominantes Secundários (V7 Secundário)
Um dominante secundário é um acorde maior com 7ª menor (X7) adicionado temporariamente para preparar qualquer acorde do campo harmônico que não seja a tônica principal (I).
Fórmula: É o quinto grau (V) de algum grau de destino.

Exemplo no tom de **C** (Dó maior):
- Queremos ir para o segundo grau, **Dm** (Ré menor). O quinto grau de Ré é **Lá**. Então introduzimos um **A7** logo antes de Dm!
- A cadência fica: \`C -> A7 -> Dm -> G7 -> C\`
- Esse **A7** é denotado como **V7/II** (Dominante do segundo grau).

Os dominantes secundários mais comuns no tom de Dó:
- **A7** (V7/II) preparando Dm
- **B7** (V7/III) preparando Em
- **C7** (V7/IV) preparando F
- **D7** (V7/V) preparando G
- **E7** (V7/VI) preparando Am

### 2. O Acorde Substituto do Dominante: SubV7
O **SubV7** é uma das resoluções mais sofisticadas do jazz e bossa nova. Trata-se de um acorde maior com sétima menor localizado exatamente **meio tom acima** do acorde de resolução.
- Por que funciona? Porque ele compartilha o mesmo "Trítono" (intervalo tenso) do dominante primário, mas resolve descendo cromaticamente de forma extremamente suave.

Exemplo:
- O dominante natural de C é **G7** (suas notas de tensão são Si e Fá).
- O substituto de G7 é o **Db7** (Ré bemol com sétima). Note que Db7 está meio tom acima de C! Suas notas de tensão também são Fá e Dób (que é Si).
- A cadência fica: \`Dm7 -> Db7 -> C7M\`
- Experimente tocar essa transição: o baixo desce perfeitamente (\`Ré -> Ré bemol -> Dó\`). Um efeito magnífico!

### 3. Exercício de Prática Funcional:
Dedilhe lentamente com ritmo de bossa a clássica sequência funcional:
**C7M  →  E7  →  Am7  →  Gm7  →  C7  →  F7M  →  Fm6  →  Em7  →  A7  →  Dm7  →  Db7  →  C7M**`
    },
    {
      id: "les-adv4",
      title: "Modos Gregos: A Aplicação Prática no Violão",
      category: "theory",
      description: "Entenda os 7 modos gregos e aprenda a colorir seus solos mudando o 'sabor' emocional da escala.",
      order: 4,
      contentMarkdown: `Os Modos Gregos são sete maneiras diferentes de organizar os tons e semitons partindo das sete notas da escala maior. Cada modo gera um clima emocional e sonoro diferente (um "sabor" modal).

### 1. Prontuário Rápido dos 7 Modos:
Comparando as escalas com a escala maior padrão:

1. **Jônio (Maior natural):** Brilhante e triunfante. Fóco na sensação de lar. \`Formula: 1 - 2 - 3 - 4 - 5 - 6 - 7\`.
2. **Dórico (Menor Bossa/Jazz):** Menor com a 6ª maior. Soa místico, sofisticado e suingado. É a escala perfeita para dedilhar sobre o acorde de **Am6** ou **Dm6**. \`Formula: 1 - 2 - b3 - 4 - 5 - 6 - b7\`.
3. **Frígio (Som Espanhol/Flamenco):** Menor com a 2ª menor. Clima dramático, árido, cigano. Monte uma batida cigana em **Em** e **F** (a famosa cadência andaluza). \`Formula: 1 - b2 - b3 - 4 - 5 - b6 - b7\`.
4. **Lídio (Som Espacial/Ficção):** Maior com a 4ª aumentada. Soa mágico, sonhador e cinematográfico. Sabor característico ao solar em cima de **C7M(#11)**. \`Formula: 1 - 2 - 3 - #4 - 5 - 6 - 7\`.
5. **Mixolídio (Nordestino/Baião/Blues):** Maior com a 7ª menor. O modo preferido das canções nordestinas e do rock básico. Encaixa perfeitamente com **G7** ou **A7**. \`Formula: 1 - 2 - 3 - 4 - 5 - 6 - b7\`.
6. **Eólio (Menor natural):** Melancólico, clássico, introspectivo. \`Formula: 1 - 2 - b3 - 4 - 5 - b6 - b7\`.
7. **Lócrio (Tensão Diminuta):** Sombrio e instável. Praticamente exige resolução imediata. Usado sobre acorde meio-diminuto como **Bm7(b5)**. \`Formula: 1 - b2 - b3 - 4 - b5 - b6 - b7\`.

### 2. Identificando a "Nota Característica":
Para fazer solos modais de alta categoria, você não precisa pensar em todas as escalas ao mesmo tempo. Apenas realce a **Nota Característica** daquele modo em suas melodias sobre um acorde estático:
- No **Dórico**, destaque a **6ª maior** no acorde menor (ex: a nota Fá sustenido sobre o acorde de Am).
- No **Mixolídio**, destaque a **7ª menor** sobre o acorde maior (ex: a nota Sol sobre Dó maior - C7).
- No **Lídio**, abuse da **4ª aumentada** para aquele som flutuante (ex: a nota Fá sustenido sobre Dó maior - C7M).

### 3. Exemplo de Conexão Prática:
Toque o acorde de **Am7** e faça solos focando na nota Fá sustenido (6ª maior) para ouvir de imediato o clássico sabor do **Modo Dórico de Lá**!`
    },
    {
      id: "les-adv5",
      title: "Modulações Harmônicas: Estratégias e Transições",
      category: "theory",
      description: "Aprenda a mudar de tonalidade com elegância usando acordes comuns ou de passagem.",
      order: 5,
      contentMarkdown: `Modular significa transitar de uma tonalidade para outra no meio da música. Fazer isso de maneira imprevisível e suave diferencia o violonista comum de um compositor ou arranjador de nível profissional.

### 1. Modulação por Acorde Pivô (Common Chord Modulation)
É a técnica de usar um acorde que pertence, ao mesmo tempo, ao tom atual (Tom A) e ao novo tom (Tom B). O acorde funciona como uma "ponte giratória" imperceptível para o ouvinte.

Exemplo de mudança de Dó Maior (**C**) para Sol Maior (**G**):
- O acorde de **Am** (Lá menor) pertence a ambos os campos harmônicos: é o VIº grau de C e o IIº grau de G.
- Progressão: \`C -> F -> [Am] -> D7 -> G\`
- Veja como o **Am** entra e, em seguida, o **D7** se junta para nos arremessar de forma natural para o novo tom de **G maior**!

### 2. Modulação Direta (Cromática Dinâmica)
Consiste em subir ou transcionar a música de forma abrupta, mas rítmica, geralmente elevando o tom em meio tom ou um tom inteiro para criar um clímax de vigor e energia na última estrofe.

Exemplo clássico de MPB e baladas pop:
- Termina um refrão em **G** (Sol maior).
- Na reentrada do próximo refrão, sobe-se a pestana de todos os acordes em 1 casa, mudando para **Ab** (Lá bemol maior).
- Use o dominante do novo tom para suavizar: prepare o **Ab** usando o acorde **Eb7** (seu dominante primário) logo na batida final da estrofe anterior!

### 3. O Truque Infalível do Acorde Diminuto
O acorde diminuto de sete cordas (ex: **G#dim** ou **Bdim**) é composto inteiramente por intervalos simétricos de terças menores. Devido a essa simetria perfeita, ele possui quatro tônicas possíveis e serve de portal para resolver em quatro campos harmônicos diferentes!
- Se estiver perdido e quiser mudar o tom para surpreender, monte um acorde diminuto meio tom abaixo do seu novo acorde tônica alvo e prepare o pouso ideal.`
    },
    {
      id: "les-adv6",
      title: "Dicionário de Escalas Exóticas: Menor Harmônica e Melódica",
      category: "theory",
      description: "Experimente o ar misterioso do flamenco espanhol e a sofisticação harmônica do jazz de vanguarda.",
      order: 6,
      contentMarkdown: `Para quebrar os padrões lineares das escalas maiores e pentatônicas ordinárias, grandes músicos utilizam as variações melódicas da menor clássica. Elas geram solos rápidos de suspense, mistério andaluz e texturas de fusion/jazz.

### 1. Escala Menor Harmônica: O Ar Árabe e Espanhol
A Escala Menor Harmônica difere da escala menor natural por ter o seu **sétimo grau elevado de forma cromática** (um semitom de distância da tônica, conhecido como sensível). Isso cria um intervalo de terça menor de extrema expressividade entre o 6º e o 7º grau (segunda aumentada).

\`Formula: 1 - 2 - b3 - 4 - 5 - b6 - 7\`

**Aplicações no Violão:**
- Soa extremamente dramática e neoclássica.
- Muito usada sobre o acorde dominante de um tom menor (ex: solar a escala de Lá Menor Harmônica sobre o acorde de **E7** para terminar resolvendo em **Am**).
- O acorde de apoio perfeito é o **E7(b9)** (Mi com sétima e nona bemol) ou acordes de passagem diminutos correlacionados.

### 2. Escala Menor Melódica: A Escala Real do Jazz
A Escala Menor Melódica resolve o intervalo "árabe" saltado da menor harmônica elevando também o **sexto grau**. Ela soa como uma escala maior na primeira metade e como uma menor na segunda metade.
No estilo clássico ela sobe de um jeito e desce de outro, mas no Jazz e na música de fusão moderna nós a usamos na forma real: igual para subir e descer (Escala Menor de Jazz).

\`Formula: 1 - 2 - b3 - 4 - 5 - 6 - 7\`

**Aplicações no Violão:**
- Essencial para solos de Jazz e Bossa Nova modernos.
- Usada para solar sobre acordes menores com sétima maior (ex: **Am(7M)**) ou acordes menores com sexta (**Am6**), dando um clima cinematográfico.
- Gera acordes espetaculares de tensão alterada (como o acorde de **D7(#9)** ou **G7alt**).

### 3. Shape Único para Praticar: Am Harmônica (5ª Casa)
Pratique em cima do acorde estático de **E7** com resolução em **Am**:
\`\`\`text
6ª corda: (5ª casa, 7ª casa, 8ª casa)
5ª corda: (5ª casa, 7ª casa, 8ª casa)
4ª corda: (6ª casa, 7ª casa) -> Note o salto na 4ª corda
3ª corda: (4ª casa, 5ª casa, 7ª casa)
2ª corda: (5ª casa, 6ª casa)
1ª corda: (4ª casa, 5ª casa) -> A sensível está na 4ª casa (Sol#)
\`\`\`
Experimente tocar essa digitação de forma acelerada e sinta o aroma clássico das composições ciganas de violão flamenco!`
    },
    {
      id: "les-adv7",
      title: "Treinamento Auditivo: Como Tirar Músicas de Ouvido",
      category: "theory",
      description: "Desenvolva sua percepção musical e pare de depender apenas de cifras na tela.",
      order: 7,
      contentMarkdown: `Tirar músicas de ouvido é uma das habilidades mais libertadoras para um violonista. Desenvolver uma escuta ativa tira as amarras de depender de uma tela de cifras ou tablaturas o tempo todo. 

Ao contrário do que muitos pensam, tirar músicas de ouvido não exige o dom fantástico do "ouvido absoluto"! Trata-se de um método científico e prático de eliminação, focado no reconhecimento de intervalos e do **Campo Harmônico**.

Siga o método passo a passo abaixo para estruturar sua audição:

---

### Passo 1: Encontre os Graves (O Segredo do Baixo)
Quando você ouve uma música e não sabe onde começar, o erro número um de todo iniciante é tentar adivinhar as cordas finas e brilhantes primeiro. No entanto, são os **graves** (os baixos das notas e o contrabaixo da gravação) que ditam as tônicas dos acordes!
- Ouça a canção focando apenas nos sons profundos de fundo.
- Na 6ª ou 5ª cordas do seu violão, deslize o dedo casa por casa até encontrar a nota grave que se alinha perfeitamente com a harmonia de fundo.
- Se no início de um compasso você bater o seu polegar na 2ª casa da 6ª corda (nota Fá#) e o som soar incrivelmente consonante, as chances são colossais de que o acorde atual seja **F#** (Fá sustenido maior ou menor).

---

### Passo 2: Descubra o "Centro de Gravidade" (A Tônica)
Toda música tem uma nota central de repouso absoluto. Pense na tônica como o "lar" da música — o lugar onde a melodia ou a estrofe repousa com total sensação de finalização e alívio.
- **Dica Prática:** Cantarole a nota que você sente que daria o ponto final ideal para a música. Encontre essa exata nota no braço do violão.
- Se essa nota central de repouso é **Dó (C)**, o tom da música é muito provavelmente Dó maior ou Dó menor.

---

### Passo 3: Determine a "Felicidade" ou "Melancolia" (Maior vs. Menor)
Assim que tiver a tônica de repouso (digamos que seja **Sol - G**), você precisa identificar o tipo do acorde principal:
- **Acordes Maiores:** Soam abertos, felizes, triunfantes e estáveis.
- **Acordes Menores:** Soam pensativos, dramáticos, tristes ou introspectivos.
- Toque o acorde **G** (Sol Maior) e em seguida o **Gm** (Sol Menor) por cima da música. Um deles se fundirá suavemente ao fundo, enquanto o outro soará com uma nota desalinhada do arranjo. 

---

### Passo 4: Mapeie o Campo Harmônico
Uma vez que você encontrou o tom da música (por exemplo, **C** - Dó Maior), você já eliminou milhares de acordes desnecessários! Agora você só precisa procurar a resposta dentro da família de acordes de Dó Maior:
- **I** (Primeiro Grau): **C** (Dó Maior - O Lar)
- **ii** (Segundo Grau): **Dm** (Ré Menor)
- **iii** (Terceiro Grau): **Em** (Mi Menor)
- **IV** (Quarto Grau): **F** (Fá Maior - Suporte)
- **V** (Quinto Grau): **G** ou **G7** (Sol Maior com sétima - A Tensão)
- **vi** (Sexto Grau): **Am** (Lá Menor - O Relativo triste do lar)

90% de todas as músicas populares de rádio usam apenas esses acordes no tom de Dó!

---

### Passo 5: Decifre Progressões e Clichês Clássicos
Músicos amam utilizar as mesmas pontes harmônicas por se provarem agradáveis ao ouvido humano há séculos. Se você reconhecer o padrão das trocas de graus, tirará na hora canções inteiras de ouvido:

#### 1. A Progressão Pop dos 4 Acordes: **I → V → vi → IV**
É a progressão mais famosa da história moderna (ex: "Let It Be", "Someone Like You", "No Woman No Cry").
- Em tom de Dó, a sequência é: **C → G → Am → F**.
- Em tom de Sol, a sequência correspondente é: **G → D → Em → C**.
- Ao ouvir os acordes trocarem exatamente nesses intervalos de emoção, você já sabe de imediato o arranjo inteiro!

#### 2. O Clichê de Preparação do Bossa/Jazz: **ii → V → I**
Uma cadência de imensa sofisticação, preparando um repouso perfeito:
- Em tom de Ré Menor ou Fá, soa lindamente como: **Em7(b5) → A7 → Dm7**.
- Em tom de Dó Maior: **Dm7 → G7 → C7M**.

---

### Exercício de Desafio Auditivo:
1. Coloque uma música simples que você adore no reprodutor de mídia do celular ou computador.
2. Esconda as cifras. Não as procure na internet!
3. Toque a melodia do baixo (notas individuais graves na 6ª e 5ª cordas) até escrever o rascunho de onde estão as tônicas.
4. Experimente colocar acordes Maiores ou Menores sobre estas tônicas baseando-se no Campo Harmônico correspondente.
5. Repita isso por 10 minutos por dia e observe a mágica de sua intuição acústica desabrochar!`
    },
    {
      id: "les-adv8",
      title: "Campo Harmônico Menor e suas Três Vertentes",
      category: "theory",
      description: "Desvende as sutilezas melódicas e harmônicas que surgem ao sobrepor as escalas Menor Natural, Harmônica e Melódica.",
      order: 8,
      contentMarkdown: `O Campo Harmônico Menor é consideravelmente mais complexo que o Campo Maior. Isso acontece porque, enquanto o tom maior possui apenas uma escala de referência, o tom menor se fundamenta em **três escalas distintas**: a Menor Natural (Eólia), a Menor Harmônica (com o 7º grau elevado) e a Menor Melódica (com o 6º e 7º graus elevados).

Essa fusão tripla confere ao violonista de nível avançado um leque incomparável de acordes para exprimir tensão, repouso e melancolia.

---

### 1. A Trindade de Escalas Menores (Em Lá Menor):
Para compreender a origem dos acordes, observe as notas que mudam a cada escala:
- **Menor Natural (Eólio):** \`Lá - Si - Dó - Ré - Mi - Fá - Sol\` (Nenhum acidente)
- **Menor Harmônica:** \`Lá - Si - Dó - Ré - Mi - Fá - Sol#\` (O Sol# cria a sensível que atrai a tônica Lá)
- **Menor Melódica:** \`Lá - Si - Dó - Ré - Mi - Fá# - Sol#\` (Subida moderna com 6ª e 7ª maiores)

---

### 2. Comparativo de Acordes por Grau:
Como as escalas possuem notas diferentes, os acordes gerados em cima de cada grau também variam de forma espetacular. Veja as opções mais ricas para cada grau em **Am**:

#### Grau I (O Repouso Principal):
- **Na Menor Natural:** **Am7** \`[A - C - E - G]\` (Suave e comum)
- **Na Menor Harmônica/Melódica:** **Am(7M)** \`[A - C - E - G#]\` (Som de suspense, espionagem, extremamente misterioso)
- **Na Menor Melódica:** **Am6** ou **Am6/9** (Clássico som de Bossa Nova e Jazz)

#### Grau IV (Subdominante - Transição):
- **Na Menor Natural/Harmônica:** **Dm7** (Menor puro)
- **Na Menor Melódica:** **D7(9)** (O quarto grau vira um dominante maior com sétima! Efeito Bluesy magnífico)

#### Grau V (Dominante - Tensão Máxima):
- **Na Menor Natural:** **Em7** (Sem força de atração devido à ausência da nota sensível Sol#)
- **Na Menor Harmônica/Melódica:** **E7** ou **E7(b9)** (Contém o trítono de alta voltagem de tensão que resolve perfeitamente em Am!)

---

### 3. A Tabela Resumo do Intercâmbio Menor:
Ao compor ou arranjar no tom de Lá Menor, você pode mesclar estes acordes livremente. Os blocos mais sofisticados são:

\`\`\`text
Grau:    I         II        III        IV       V        VI       VII
Acorde:  Am(7M) -> Bm7(b5) -> C7M(#5) -> D7(9) -> E7(b9) -> F#m7(b5) -> G#dim
\`\`\`

---

### 4. Exercício Prático Teórico:
Monte em sequência este ciclo de acordes que passeia pelas três vertentes menores:
**Am7 (Natural) → Dm7 (Natural) → Am(7M) (Harmônica) → E7(b9) (Harmônica) → Am6 (Melódica) → D7(9) (Melódica)**

Sinta como cada variação expande a atmosfera emocional do ambiente e anote suas notas prediletas!`
    },
    {
      id: "les-adv9",
      title: "Exercícios de Alta Performance: Sweep Picking e Tapping",
      category: "technique",
      description: "Desenvolva velocidade fluida de palhetada e independência total de dedos com técnicas modernas de legato.",
      order: 9,
      contentMarkdown: `Até o momento, focamos muito em ritmos, digitações comuns e harmonia. Mas o domínio completo do violão de aço ou nylon de alta performance exige também técnicas avançadas de articulação física de nível solo. 

Nesta lição de rotina prática, vamos explorar e treinar duas das maiores armas de destreza motora: o **Sweep Picking** (Palhetada por Varredura) e o **Tapping** (Toque de Duas Mãos).

---

### 1. Sweep Picking: O Movimento de Varredura Confluente
No violão acústico, o segredo do Sweep Picking é a economia absoluta de movimentos. Em vez de palhetar alternando para cima e para baixo a cada corda, nós deixamos a palheta "deslizar" ou "escorregar" de forma contínua em uma única direção através das cordas adjacentes, imitando o gesto de uma vassoura.

#### Rotina de Treino - Tríade de Am (Lá Menor) em 3 Cordas:
Pratique esta clássica fôrma triangular na ponta do braço com precisão milimétrica.

\`\`\`text
Direção da Palheta:
1ª Corda (Mizinha): |--12(Down)--17(Pull-off)--12--| (Dedo 1 e Dedo 4)
2ª Corda (Si):      |------13(Up)------------------| (Dedo 2)
3ª Corda (Sol):     |----------14(Up)--------------| (Dedo 3)
\`\`\`

**Regras de Execução:**
1. Desça com palhetada única para baixo (Down) na corda 3 e corda 2 de forma amortecida.
2. Na corda 1, palhete para baixo e faça um **Pull-off** rápido da casa 17 para a 12.
3. Suba palhetando para cima (Up) as notas das cordas 2 e 3 consecutivamente.
4. Use a lateral da mão direita para abafar as cordas imediatamente após soarem, para que os sons não embolem entre si. Comece a 60 BPM em tercinas!

---

### 2. Tapping Acústico de Duas Mãos (Estilo Michael Hedges)
O Tapping utiliza o dedo indicador ou médio da mão direita (mão da batida) para martelar diretamente uma casa na escala do braço do violão. Isso possibilita saltos de intervalos gigantescos que seriam fisicamente impossíveis de alcançar apenas com a mão esquerda.

#### Rotina de Treino - Linha de Baixo e Melodia de Tapping:
Martele as notas indicadas com força suficiente para fazer a corda vibrar no corpo acústico sem palhetar.

- **Mão Esquerda (LH):** Segura com firmeza um Hammer-on na casa 5 da 5ª corda (Nota Ré).
- **Mão Direita (RH):** Com o dedo indicador ou médio esticado, martele (Tap) a casa 12 da mesma de forma percussiva.

\`\`\`text
Padrão Loop:
1. LH (Mão Esquerda): Solta a corda solta (0)
2. LH: Hammer-on na Casa 5 (dedo indicador esquerdo)
3. RH (Mão Direita): Tapping na Casa 12 (com o dedo indicador direito)
4. RH: Pull-off puxando levemente a corda para as notas de trás
\`\`\`

---

### 3. Cronograma de Prática Diária:
Para ganhar performance muscular sem lesionar seus tendões:
- **5 minutos:** Alongamento de dedos e punhos.
- **10 minutos:** Sweep picking focado no abafamento estrito em 70 BPM.
- **10 minutos:** Padrões de duas mãos (Tapping) priorizando a clareza e dinâmicas de volumes iguais.
- Mantenha o metrônomo sempre ativo na aba Metrônomo!`
    },
    {
      id: "les-adv10",
      title: "Campo Harmônico Maior Avançado: Tétrades e Tensões",
      category: "theory",
      description: "Aprofunde-se na estrutura harmônica avançada adicionando sétimas e notas de tensão aos acordes maiores.",
      order: 10,
      contentMarkdown: `O estudo inicial do Campo Harmônico Maior se dá por tríades básicas. No entanto, para alcançar a maturidade harmônica típica do Jazz, Bossa Nova e MPB refinada, é obrigatório dominar o **Campo Harmônico Maior em Tétrades (acordes com 4 notas) e suas Tensões Disponíveis (9ª, 11ª, 13ª)**.

---

### 1. A Estrutura de Sétimas (Tétrades em C Maior):
Ao empilhar quatro terças sucessivas (Tônica, Terça, Quinta e Sétima) sobre cada grau da escala maior, geramos sete tipos de acordes refinados:

1. **I7M (Grau I):** C7M (Dó com Sétima Maior) - Jônio \`[C - E - G - B]\`
2. **IIm7 (Grau II):** Dm7 (Ré menor com Sétima) - Dórico \`[D - F - A - C]\`
3. **IIIm7 (Grau III):** Em7 (Mi menor com Sétima) - Frígio \`[E - G - B - D]\`
4. **IV7M (Grau IV):** F7M (Fá com Sétima Maior) - Lídio \`[F - A - C - E]\`
5. **V7 (Grau V):** G7 (Sol dominante com Sétima) - Mixolídio \`[G - B - D - F]\`
6. **VIm7 (Grau VI):** Am7 (Lá menor com Sétima) - Eólio \`[A - C - E - G]\`
7. **VIIm7(b5) (Grau VII):** Bm7(b5) (Si Meio-Diminuto) - Lócrio \`[B - D - F - A]\`

---

### 2. Notas de Tensão Disponíveis (Extensions):
No nível avançado, podemos colorir as tétrades empilhando mais terças: as **Nonas (9ª)**, **Décimas Primeiras (11ª)** e **Décimas Terceiras (13ª)**. Nem todas as tensões são permitidas em todos os graus pois algumas criam dissonâncias duras e indesejadas (notas evitadas). Veja o mapa de sofisticação:

- **Grau I (7M):** Aceita **9ª** (C9 ou C7M/9) e **13ª** (C7M/13). *Evite a 11ª justa*, pois briga com a terça maior do acorde. Se desejar usar a 11ª, ela deve ser aumentada (**#11**).
- **Grau II (m7):** Altamente maleável. Aceita **9ª** e **11ª** com extrema doçura sonhadora (Ex: \`Dm7(9)\` ou \`Dm7(11)\`). É o som predileto da bossa nova.
- **Grau III (m7):** Som de suspense. Aceita **11ª**. *Evite a 9ª e a 13ª*, pois criam intervalos de segunda menor em relação às notas do acorde e soam muito tensas.
- **Grau IV (7M):** O ápice da flutuação. Aceita **9ª** e **#11** (Lídio). O acorde de \`F7M(#11)\` soa mágico, brilhando como trilha sonora de ficção científica.
- **Grau V (7):** O mais flexível por ser um acorde de tensão. Aceita **9ª**, **13ª** (Ex: \`G7(9)\`, \`G7(13)\`) ou tensões alteradas se estiver preparando uma resolução menor (\`G7(b9)\`, \`G7(#9)\`).
- **Grau VI (m7):** Clima introspectivo. Aceita **9a** e **11a** (Ex: \`Am7(9)\` ou \`Am11\`).
- **Grau VII (m7b5):** Aceita a **11ª** para suavizar o caráter instável do acorde meio-diminuto (Ex: \`Bm7(b5/11)\`).

---

### 3. Digitações Clássicas de Jazz e MPB (Em Lá - A):
Experimente usar estes shapes sofisticados para reescrever o campo harmônico na região central do braço:

\`\`\`text
Acordes Disponíveis em A:
A7M (I)      : X - 12 - 11 - 13 - 10 - X  (Dedo de pinça preciso)
Bm7(9) (II)  : X - 2 - X - 2 - 2 - 2      (Lindo toque de bossa)
C#m7(11) (III): X - 4 - 2 - 4 - 5 - X
D7M(#11) (IV): X - 5 - 4 - 6 - 7 - X      (Aura sonhadora lídia)
E7(9) (V)    : X - 7 - 6 - 7 - 7 - X      (Funk/Fusion de peso)
F#m7(9) (VI) : X - 9 - 7 - 9 - 9 - X
G#m7(b5) (VII): 4 - X - 4 - 4 - 3 - X
\`\`\`

---

### 4. Exercício de Conexão Rítmica Avançada (MPB Groove):
Substitua uma cadência pop básica (\`A -> F#m -> D -> E\`) por tétrades e extensões:

**A7M  →  F#m7(9)  →  Bm7(9)  →  E7(9,13)  →  A7M**

Toque com o polegar tocando o baixo e os dedos I, M, A agindo como puxadas sincopadas nos contra-tempos. Sinta a incrível doçura e maturidade harmônica dessa sequência e incorpore esse conhecimento às suas composições!`
    },
    {
      id: "les-adv11",
      title: "CAGED Master: Tétrades e Arpejos do Sistema",
      category: "theory",
      description: "Integre as sétimas (tétrades) nas fôrmas móveis e mapeie os arpejos correspondentes ao longo de todo o braço.",
      order: 11,
      contentMarkdown: `Até o momento, vimos o sistema CAGED sob a perspectiva de tríades simples. Mas para arranjistas e improvisadores profissionais de Jazz, Fusion, MPB e Pop, o verdadeiro poder do CAGED desabrocha quando integramos **Tétrades** e seus **Arpejos de escala correspondentes**.

---

### 1. Transformando o Desenho em Tétrades (Sétimas)
Ao invés de ver a fôrma apenas como acordes maiores comuns, podemos posicionar as Sétimas Maiores ou Menores de forma relacional.

Observe como posicionar Sétimas Maiores (7M) nos dois shapes prediletos de pestana móvel:

- **Na Fôrma de E (Mi Móvel) - Exemplo de Sol Maior com 7M (G7M)**:
  - Tônica na 6ª corda, Casa 3.
  - Sétima Maior (Fá#) adicionada na 4ª corda, Casa 4.
  - **Digitação**: \`3 - X - 4 - 4 - 3 - X\` (Som de jazz, pulando cordas graves)

- **Na Fôrma de A (Lá Móvel) - Exemplo de Dó Maior com 7M (C7M)**:
  - Tônica na 5ª corda, Casa 3.
  - Sétima Maior (Si) adicionada na 3ª corda, Casa 4.
  - **Digitação**: \`X - 3 - 5 - 4 - 5 - 3\`

---

### 2. Mapeando Arpejos Dentro do CAGED
Arpejo significa tocar as notas de um acorde individualmente, uma após a outra (Tônica - Terça - Quinta - Sétima). Se você sabe os formatos físicos de acordes móveis do CAGED, você já sabe onde seus dedos devem pousar para solar em cima de qualquer acorde!

#### O Arpejo de Sol Maior com Sétima Maior (G7M) - Fôrma de E (Mi)
Aqui estão as exatas notas do acorde de Sol Maior com 7M nos arredores da Casa 3, percorrido dedilhado a dedilhado:

\`\`\`text
1ª Corda (Mizinha): |---------|---(2 - Fá#)---|---(3 - Sol)---| (Dedos 1 e 2)
2ª Corda (Si):      |---------|---(3 - Ré)----|---------------| (Dedo 2)
3ª Corda (Sol):     |---------|---------------|---(4 - Si)----| (Dedo 3)
4ª Corda (Ré):      |---------|---------------|---(4 - Fá#)---| (Dedo 3)
5ª Corda (Lá):      |---------|---(2 - Si)----|---(5 - Ré)----| (Dedos 1 e 4)
6ª Corda (Mizão):   |---------|---(3 - Sol)---|---------------| (Dedo 2)
Casas:                Casa 2      Casa 3          Casa 5
\`\`\`

#### O Arpejo de Dó Maior com Sétima Maior (C7M) - Fôrma de A (Lá)
Notas nos arredores da Casa 3 (Tônica na 5ª corda):

\`\`\`text
1ª Corda (Mizinha): |---------|---(3 - Sol)---|---------------| (Dedo 1)
2ª Corda (Si):      |---------|---------------|---(5 - Mi)----| (Dedo 3)
3ª Corda (Sol):     |---------|---------------|---(4 - Si)----| (Dedo 2)
4ª Corda (Ré):      |---------|---------------|---(5 - Sol)---| (Dedo 3)
5ª Corda (Lá):      |---------|---(3 - Dó)----|---------------| (Dedo 1)
Casas:                Casa 2      Casa 3          Casa 5
\`\`\`

---

### 3. Rotina Avançada de Improviso
Para solar livremente usando o conceito CAGED master:
1. Monte um loop rítmico lento no metrônomo alternando entre os graus: **G7M** (em formato de E na Casa 3) e **C7M** (em formato de A na Casa 3).
2. Toque as notas sequenciais dos arpejos de cima de cada um desses acordes mostrados acima.
3. Comece a misturar a ordem das notas (por exemplo: Tônica -> Quinta -> Terça -> Sétima) para criar pequenos frases melódicas (licks).

*Visão Suprema:* Você não precisa de escalas gigantes para solar. O melhor improvisador é aquele que toca os arpejos de cada acorde acompanhando a harmonia em tempo real!`
    }
  ];

  const allLessonsToSeed = [
    ...beginnerLessons.map(l => ({ ...l, level: "Iniciante" })),
    ...intermediateLessons.map(l => ({ ...l, level: "Intermediário" })),
    ...advancedLessons.map(l => ({ ...l, level: "Avançado" }))
  ];

  allLessonsToSeed.forEach((l) => {
    insertLesson.run(l.id, l.title, l.category, l.description, l.order, l.contentMarkdown, l.level);
  });
  
  console.log("[Database] Lições semeadas e atualizadas com sucesso!");
} catch (e) {
  console.error("[Database] Erro ao semear lições no SQLite:", e);
}

// Seed level quiz questions
try {
  const checkQuestionsCount = db.prepare("SELECT COUNT(*) as count FROM level_test_questions").get() as any;
  if (!checkQuestionsCount || checkQuestionsCount.count < 21) {
    console.log("[Database] Semeando tabela completa de perguntas do quiz no SQLite (21 questões)...");
    db.prepare("DELETE FROM level_test_questions").run();
    const insertQuestion = db.prepare(`
      INSERT INTO level_test_questions (level, question, options, correct_index, explanation)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Iniciante
    insertQuestion.run(
      "Iniciante",
      "O que significa a sigla do método 'CAGED' amplamente utilizado para mapear o braço do violão?",
      JSON.stringify([
        "Uma abreviação para os acordes maiores abertos: C (Dó), A (Lá), G (Sol), E (Mi) e D (Ré)",
        "O nome do criador do método de dedilhado moderno",
        "Uma afinação alternativa usada no flamenco e blues",
        "A nomenclatura internacional para cordas de aço pesadas"
      ]),
      0,
      "A sigla CAGED refere-se aos 5 formatos/desenhos básicos de acordes maiores abertos (Dó, Lá, Sol, Mi e Ré). Movendo estas fôrmas com pestanas, você consegue tocar qualquer acorde em todo o braço do violão."
    );

    insertQuestion.run(
      "Iniciante",
      "No violão de 6 cordas padrão, qual é o nome e a afinação da corda mais grossa (6ª corda)?",
      JSON.stringify(["Lá (A)", "Mi grave (E)", "Dó (C)", "Sol (G)"]),
      1,
      "A 6ª corda (mais grossa) é afinada em Mi (E) grave, popularmente conhecida como 'Mizão'. A contagem das cordas do violão se dá de baixo para cima."
    );

    insertQuestion.run(
      "Iniciante",
      "Qual letra do alfabeto romano representa o acorde de Lá Maior na cifragem universal?",
      JSON.stringify(["A", "C", "D", "E"]),
      0,
      "A cifragem universal utiliza as letras de A a G para representar as notas. A letra 'A' corresponde ao Lá."
    );

    insertQuestion.run(
      "Iniciante",
      "Ao montar uma pestana para acordes básicos (como o Fá Maior), qual a melhor técnica para obter um som limpo e sem dores?",
      JSON.stringify([
        "Esmagar as cordas com a parte traseira mole do dedo indicador",
        "Usar a borda lateral externa e mais rígida (óssea) do dedo indicador levemente girado",
        "Apertar as cordas na madeira exatamente em cima do traste de metal",
        "Usar dois dedos juntos para fazer a pestana"
      ]),
      1,
      "Girar o dedo indicador levemente para fora permite usar a borda lateral externa que é mais óssea e rígida, facilitando uma pressão uniforme nas cordas sem exigir força excessiva."
    );

    insertQuestion.run(
      "Iniciante",
      "Qual a postura correta para o polegar da mão esquerda (em violonistas destros) atrás do braço do violão?",
      JSON.stringify([
        "Apontado para o teto saindo muito acima da escala",
        "Apoiado no centro da parte traseira do braço, de forma perpendicular e relaxada",
        "Dobrado totalmente para trás deitado na madeira",
        "Pressionando as cordas junto com o indicador"
      ]),
      1,
      "O polegar deve apoiar a parte de trás do braço do instrumento (como apoio/pinça) na parte central, sem tensão de esmagamento e sem sobressair exageradamente por cima nas formas de acordes limpos."
    );

    insertQuestion.run(
      "Iniciante",
      "O que representa a sigla 'P.I.M.A' frequentemente usada no estudo técnico do violão?",
      JSON.stringify([
        "Uma afinação alternativa para o violão de nylon",
        "A indicação de dedos da mão direita: Polegar, Indicador, Médio e Anelar",
        "Os quatro acordes fundamentais para tocar sertanejo",
        "O nome do metrônomo analógico tradicional"
      ]),
      1,
      "Na indicação de dedilhados e técnica clássica, a letra 'P' representa o Polegar, 'I' o Indicador, 'M' o Médio e 'A' o Anelar."
    );

    insertQuestion.run(
      "Iniciante",
      "Quantas notas existem em uma escala musical cromática ocidental padrão (contando tons e semitons)?",
      JSON.stringify(["7 notas", "12 notas", "5 notas", "8 notas"]),
      1,
      "A escala cromática ocidental é formada por 12 notas separadas por intervalos de semitono (meio tom): C, C#, D, D#, E, F, F#, G, G#, A, A#, B."
    );

    // Intermediário
    insertQuestion.run(
      "Intermediário",
      "No Campo Harmônico de Dó Maior (C), quais acordes são classificados como maiores de grau I, IV e V?",
      JSON.stringify(["C, Dm e Em", "C, F e G", "C, Am e Bm7(b5)", "C, Fm e G7"]),
      1,
      "Os três graus maiores do campo harmônico de C são o primeiro (I - C), o quarto (IV - F) e o quinto (V - G)."
    );

    insertQuestion.run(
      "Intermediário",
      "Qual a diferença estrutural e sonora entre um acorde de 'Dó com sétima maior' (C7M) e 'Dó com sétima menor (C7)'?",
      JSON.stringify([
        "C7M tem um som mais feliz/suave pois a sétima está a meio tom da tônica; C7 tem um som tenso/preparatório com a sétima menor a um tom de distância",
        "C7M possui pestana e o C7 não possui pestana",
        "C7M usa apenas cordas soltas; C7 exige 5 dedos na montagem",
        "Ambos possuem o exato som, sendo apenas nomenclaturas opcionais"
      ]),
      0,
      "C7M (sétima maior) possui um som suave de repouso muito associado à bossa nova, enquanto C7 (sétima menor) possui a dissonância perfeita para preparar e gerar tensão (grau dominante)."
    );

    insertQuestion.run(
      "Intermediário",
      "Qual é o compasso rítmico característico de ritmos tradicionais como a Guarânia sertaneja e a Valsa?",
      JSON.stringify(["Compasso Quaternário (4/4)", "Compasso Binário (2/4)", "Compasso Ternário (3/4)", "Compasso Composto de Jazz"]),
      2,
      "A guarânia e a valsa são ritmos baseados em compassos de três tempos (um tempo forte e dois fracos: Tum-Taca-Taca)."
    );

    insertQuestion.run(
      "Intermediário",
      "Qual a função do acessório chamado 'Capotaste' (ou Capo) no violão?",
      JSON.stringify([
        "Ajustar a afinação das tarrachas automaticamente",
        "Prender as cordas no cavalete caso quebrem",
        "Transpor a tonalidade da música mantendo os formatos físicos dos acordes",
        "Abafar o ruído das cordas agudas ao solar"
      ]),
      2,
      "O capotaste funciona como uma pestana móvel, encurtando o braço do instrumento e transpondo o tom da música para que você possa usar fôrmas de acordes conhecidas em outras tonalidades mais altas."
    );

    insertQuestion.run(
      "Intermediário",
      "Se uma música está no tom de Lá Menor (Am), qual é o seu Tom Relativo Maior correspondente, que compartilha a mesma armadura de clave?",
      JSON.stringify(["Sol Maior (G)", "Dó Maior (C)", "Ré Maior (D)", "Mi Maior (E)"]),
      1,
      "Toda escala menor possui uma escala relativa maior localizada a 1 tom e meio acima (uma terça menor). Para Lá Menor, a escala relativa maior é Dó Maior (C)."
    );

    insertQuestion.run(
      "Intermediário",
      "Qual é a fórmula de intervalos que define a formação de uma Tríade Menor (como o acorde Am)?",
      JSON.stringify([
        "Tônica, Terça Maior e Quinta Justa",
        "Tônica, Terça Menor e Quinta Justa",
        "Tônica, Terça Menor e Quinta Diminuta",
        "Tônica, Terça Maior e Sétima Menor"
      ]),
      1,
      "Uma tríade menor é composta pela Tônica (grau I), Terça Menor (grau bIII - que dá o caráter triste/melancólico) e Quinta Justa (grau V)."
    );

    insertQuestion.run(
      "Intermediário",
      "No Sistema CAGED, se você quiser tocar o acorde de Dó Maior (C) usando o formato físico de Lá Maior (A), em qual casa do violão deve ser posicionada a pestana?",
      JSON.stringify(["Na 1ª casa", "Na 3ª casa", "Na 5ª casa", "Na 7ª casa"]),
      1,
      "Para fazer o acorde de Dó Maior (C) usando a fôrma de Lá Maior (A), deslocamos o desenho de Lá de forma que a tônica (que fica na 5ª corda) seja a nota Dó. Como a nota Dó na 5ª corda está na 3ª casa, a pestana deve ser montada na 3ª casa!"
    );

    // Avançado
    insertQuestion.run(
      "Avançado",
      "O que é um 'Dominante Secundário' na harmonia funcional?",
      JSON.stringify([
        "O acorde de quarto grau (IV) que substitui o tom principal",
        "Um acorde menor que atua como repouso triste da tônica",
        "Um acorde maior com 7ª menor (X7) adicionado temporariamente para preparar qualquer grau de destino que não seja a tônica principal",
        "O acorde opcional de passagem diminuto que encerra a música"
      ]),
      2,
      "O dominante secundário (como A7 introduzido antes de Dm no campo de C) prepara temporariamente graus secundários do campo harmônico, adicionando uma tensão rica que resolve em seguida."
    );

    insertQuestion.run(
      "Avançado",
      "Qual é a característica distintiva do acorde substituto do dominante conhecidamente como SubV7?",
      JSON.stringify([
        "Ele se localiza uma quinta justa acima e é menor",
        "Ele se localiza exatamente meio tom acima do acorde de destino e desce o baixo cromaticamente",
        "Trata-se de um acorde de oitava alterada e de cinco notas",
        "Ele só pode ser usado em tons ciganos e espanhóis"
      ]),
      1,
      "O SubV7 (como Db7 resolvendo em C) fica exatamente meio tom acima do acorde alvo e resolve perfeitamente descendo cromática e sutilmente o baixo melódico."
    );

    insertQuestion.run(
      "Avançado",
      "Para solar com categoria sobre o acorde de Lá Menor no modo Dórico (Lá Dórico), qual 'Nota Característica' deve ser destacada melodicamente?",
      JSON.stringify(["A 6ª maior (nota Fá sustenido)", "A 2ª menor (nota Sib)", "A 5ª bemol (nota Mib)", "A 7ª menor (nota Sol)"]),
      0,
      "Lá Dórico (Am Dórico) é gerado a partir do segundo grau do campo harmônico de Sol Maior, tendo como nota característica a 6ª maior (Fá#) que o diferencia do modo menor natural (eólio)."
    );

    insertQuestion.run(
      "Avançado",
      "O que caracteriza o acorde Diminuto (como o C°) e qual seu intervalo de empilhamento de terças?",
      JSON.stringify([
        "Terças maiores empilhadas de forma consecutiva e tônica duplicada",
        "Sua sonoridade limpa de bossa nova baseada em quartas",
        "Quatro notas empilhadas em intervalos de terças menores (3 semitons) entre si",
        "Um acorde sem tônica"
      ]),
      2,
      "O acorde diminuto é simétrico e formado inteiramente por intervalos de terça menor (3 semitons) empilhados. Ele é altamente instável e ótimo para transições cromáticas."
    );

    insertQuestion.run(
      "Avançado",
      "O que significa 'Inversão de Acorde' (como C/E) e onde o baixo da harmonia deve se posicionar?",
      JSON.stringify([
        "A tônica é dobrada na oitava mais alta e o baixo fica mudo",
        "Inverter a ordem dos dedos mantendo o indicador fixo",
        "Colocar outra nota do acorde como o som mais grave (nesse caso, a terça Mi no baixo)",
        "Tocar o acorde de trás para frente no metrônomo"
      ]),
      2,
      "Na inversão de acorde, o baixo deixa de ser a nota tônica e passa a ser outra nota integrante do acorde (terça, quinta ou sétima). No caso de C/E, tocamos o acorde de C com a nota E (terça) no baixo."
    );

    insertQuestion.run(
      "Avançado",
      "Ao tocar a Escala Pentatônica Menor adicionando a famosa 'Blue Note', qual o nome dessa escala e qual intervalo foi adicionado?",
      JSON.stringify([
        "Escala Cigana com 2ª menor",
        "Escala de Blues (Pentablues) com a 4ª aumentada / 5ª diminuta",
        "Modo Frígio dominante com double-flat",
        "Escala Cromática reduzida"
      ]),
      1,
      "A escala de Blues (Pentablues) é formada pela pentatônica menor acrescida da 'Blue Note', que é a 4ª aumentada (ou 5ª diminuta), trazendo aquele som clássico e melancólico do Blues."
    );

    insertQuestion.run(
      "Avançado",
      "No mapeamento do braço através do Sistema CAGED, de que maneira se conectam as fôrmas vizinhas de Dó (C) e Lá (A)?",
      JSON.stringify([
        "Elas compartilham a mesma nota tônica localizada na 5ª corda",
        "Elas compartilham a tônica localizada na 6ª corda",
        "Elas não possuem nenhuma tônica em comum",
        "Suas tônicas ficam separadas por um intervalo de quinta justa"
      ]),
      0,
      "Os formatos adjacentes do Sistema CAGED se conectam compartilhando pontos comuns. O formato de C e o formato de A compartilham a exata mesma nota tônica localizada na 5ª corda (raiz comum)."
    );

    console.log("[Database] Tabela completa de perguntas do quiz (21 questões) semeada com sucesso no SQLite.");
  }
} catch (e) {
  console.error("[Database] Erro ao semear perguntas do quiz:", e);
}

// Seed video lessons
try {
  const checkVideoLessonsCount = db.prepare("SELECT COUNT(*) as count FROM video_lessons").get() as any;
  if (!checkVideoLessonsCount || checkVideoLessonsCount.count === 0) {
    console.log("[Database] Semeando tabela de videoaulas no SQLite...");
    const insertVideo = db.prepare(`
      INSERT INTO video_lessons (title, description, video_url, level, duration, instructor, thumbnail_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Iniciante
    insertVideo.run(
      "Aprenda a Tocar Violão do ZERO! (Primeira Aula Prática)",
      "Nesta aula você conhecerá a melhor postura e treinará suas primeiras notas e dedilhados básicos sem sentir dor nos dedos.",
      "https://www.youtube.com/embed/SgXMIpW8tjs",
      "Iniciante",
      "15:20",
      "Prof. Lucas - Cifra Club",
      ""
    );
    insertVideo.run(
      "Seu Primeiro Ritmo no Violão (Batida de Pop/Rock Básica)",
      "Como sincronizar a sua mão direita com movimentos constantes de palheta ou dedos de forma simples.",
      "https://www.youtube.com/embed/Z84g08J-6E8",
      "Iniciante",
      "10:45",
      "Prof. Gustavo",
      ""
    );

    // Intermediário
    insertVideo.run(
      "O Segredo Clínico para Fazer Pestana Sem Desafinar ou Doer",
      "Ajuste o ângulo do seu indicador e use a gravidade na escala para obter um som 100% limpo com zero esforço extremo.",
      "https://www.youtube.com/embed/fexn6l6tT_w",
      "Intermediário",
      "12:15",
      "Prof. Gabriel - Cordas Club",
      ""
    );
    insertVideo.run(
      "Os Padrões de Dedilhado de Violão Mais Lindos e Fáceis",
      "Aprenda os padrões clássicos (Tonic-I-M-A-M-I) e como usá-los sobre dezenas de músicas românticas.",
      "https://www.youtube.com/embed/5UfO_7B_g_I",
      "Intermediário",
      "14:30",
      "Prof. Leo Eymard",
      ""
    );

    // Avançado
    insertVideo.run(
      "Campo Harmônico Maior Avançado: Tétrades, Sétimas e Extensões",
      "Entenda o empilhamento em terças, evite notas desarmônicas e crie conexões de Jazz e Bossa Nova cheias de estilo.",
      "https://www.youtube.com/embed/K8U2Fp3jH50",
      "Avançado",
      "22:10",
      "Prof. Felipe - Harmonia Aplicada",
      ""
    );
    insertVideo.run(
      "A Batida Definitiva de Bossa Nova no Violão MPB",
      "Como conciliar o polegar independente no baixo (marcação rítmica do surdo) com as puxadas harmônicas das três cordas agudas.",
      "https://www.youtube.com/embed/D3sO_MbeR2c",
      "Avançado",
      "19:40",
      "Bossa Nova Prática",
      ""
    );

    console.log("[Database] Tabela de videoaulas semeada com sucesso.");
  }
} catch (e) {
  console.error("[Database] Erro ao semear videoaulas:", e);
}

// Seed helper student questions and explanation videos
try {
  const checkQuestionsCount = db.prepare("SELECT COUNT(*) as count FROM student_questions").get() as any;
  if (!checkQuestionsCount || checkQuestionsCount.count === 0) {
    console.log("[Database] Semeando dúvidas e perguntas do fórum no SQLite...");
    const insertQuestion = db.prepare(`
      INSERT INTO student_questions (user_email, level, title, question, answer, video_url, video_title, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Iniciante
    insertQuestion.run(
      "professor@violao.com",
      "Iniciante",
      "Como afinar o violão de ouvido se eu não tiver nenhum afinador por perto?",
      "No início parece impossível, mas é uma habilidade que você desenvolve rápido! O método clássico é usar a afinação relativa. Como fazer?",
      "Comece encontrando uma referência para dar a nota da 6ª corda solta (Mi). Depois, pressione a 5ª casa da 6ª corda: essa nota deve soar idêntica à 5ª corda solta. Repita para as outras cordas (5ª casa da 5ª corda = 4ª solta; 5ª casa da 4ª corda = 3ª solta; 4ª casa da 3ª corda = 2ª solta; 5ª casa da 2ª corda = 1ª solta).",
      "https://www.youtube.com/embed/n30D-Y5eU3c",
      "Como afinar o violão de ouvido (AULA COMPLETA)",
      new Date().toISOString()
    );

    insertQuestion.run(
      "professor@violao.com",
      "Iniciante",
      "Meus dedos doem muito ao pressionar as cordas! O que fazer?",
      "É normal sentir essa dorzinha nos primeiros dias enquanto a ponta dos seus dedos ainda está muito macia e os calos protetores não se formaram.",
      "A principal recomendação é praticar intervalos mais curtos todos os dias (ex: 15 a 20 minutos por dia) em vez de estudar 2 horas de uma só vez. Além disso, verifique se você não está usando força em excesso de forma desnecessária; aperte a nota o mais próximo possível do traste de metal, que exige bem menos esforço.",
      "https://www.youtube.com/embed/SgXMIpW8tjs",
      "Dicas fundamentais sobre a postura e dores nos dedos",
      new Date().toISOString()
    );

    // Intermediário
    insertQuestion.run(
      "professor@violao.com",
      "Intermediário",
      "Como dominar a pestana e fazê-la soar perfeitamente limpa sem doer tanto?",
      "Essa é a maior barreira para quem está subindo de nível! O segredo clínico não está na força bruta do indicador, mas sim na técnica e alavancagem.",
      "Primeiro: não use a parte da 'frente' mole do seu indicador. Gire o dedo indicador levemente para fora, utilizando a borda lateral externa, que é mais óssea e rígida. Segundo: ajuste a altura do dedão (polegar) atrás do braço, deixando-o bem centralizado. Terceiro: certifique-se de que a regulagem das cordas do seu violão (nut e rastilho) não está excessivamente alta.",
      "https://www.youtube.com/embed/fexn6l6tT_w",
      "Domine a pestana de uma vez por todas (Segredos)",
      new Date().toISOString()
    );

    insertQuestion.run(
      "professor@violao.com",
      "Intermediário",
      "Como posso usar a famosa Escala Pentatônica para começar a Solar no violão?",
      "A escala pentatônica é a mais famosa e amigável para solos porque ela remove as notas de intervalos tensos, permitindo improvisos sempre afinados.",
      "Comece aprendendo o Desenho 1 da escala pentatônica menor (ex: em Lá Menor). Pratique subir e descer a escala mantendo um ritmo constante com metrônomo a 60 bpm. Assim que solar as notas em sequência estiver fluido, tente criar melodias intercalando as notas e aplicando pequenos ligados (hammer-on e pull-off) sobre uma base harmônica menor.",
      "https://www.youtube.com/embed/7r-A7R4O7F0",
      "Como usar a Pentatônica para Improvisar do Zero",
      new Date().toISOString()
    );

    // Avançado
    insertQuestion.run(
      "professor@violao.com",
      "Avançado",
      "Como funciona a rearmonização funcional de músicas e aplicação de Tétrades?",
      "Estudar harmonia avançada no violão significa expandir os acordes de tríades básicas para tétrades ricamente coloridas (com 7ª maior, menor, 9ª, 11ª, e outras tensões).",
      "Para rearmonizar, identifique a função harmônica do acorde original (Tônica, Subdominante ou Dominante) e substitua-o por outro acorde da mesma família (ex: trocar C por Am7 ou Em7). Introduza acordes de passagem como diminutos ou faça conexões usando acordes de empréstimo modal (A.E.M). Assista à aula de harmonia aplicada para ver exemplos no violão.",
      "https://www.youtube.com/embed/K8U2Fp3jH50",
      "Como rearmonizar e aplicar harmonia funcional no violão",
      new Date().toISOString()
    );

    insertQuestion.run(
      "professor@violao.com",
      "Avançado",
      "Qual o padrão rítmico definitivo para tocar Bossa Nova e MPB?",
      "Toque com síncope! Diferente de batidas retas de pop ou rock, a Bossa Nova tem um balanço sofisticado onde o polegar e os dedos agudos se comportam de maneira independente.",
      "O polegar atua marcando as fundamentais dos acordes (simulando a batida do surdo no samba), ocorrendo nos tempos fortes. Enquanto isso, o conjunto de dedos indicador, médio e anelar (I-M-A) puxa as cordas agudas de forma sincopada, criando contratempos. Pratique puxar o acorde exatamente no contra-tempo do baixo e segurar a nota.",
      "https://www.youtube.com/embed/D3sO_MbeR2c",
      "Levada de Bossa Nova profissional com síncope e baixos",
      new Date().toISOString()
    );

    console.log("[Database] Tabela de dúvidas e perguntas semeada com sucesso.");
  }
} catch (e) {
  console.error("[Database] Erro ao semear perguntas e dúvidas:", e);
}

// Seed default test student account so it works out of the box
try {
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, username, password, joined_at, guitar_level)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  // Seed default student
  insertUser.run(
    "aluno@violao.com",
    "Iniciante no Violão",
    "123", // Simple default password
    new Date().toLocaleDateString("pt-BR"),
    "Iniciante"
  );
  
  // Seed admin user using metadata email
  insertUser.run(
    "arturguilhermechecchi@gmail.com",
    "Artur Guilherme (Admin)",
    "admin123", // Admin default password
    new Date().toLocaleDateString("pt-BR"),
    "Avançado"
  );

  // Seed default guest user for login tracking
  insertUser.run(
    "convidado@violao.com",
    "Aluno Convidado",
    "convidado123",
    new Date().toLocaleDateString("pt-BR"),
    "Iniciante"
  );
  
  console.log("[Database] Contas iniciais semeadas com sucesso no SQLite.");
} catch (error) {
  console.error("[Database] Erro ao semear contas iniciais:", error);
}

// Seed harmonic fields & chords
try {
  const checkFields = db.prepare("SELECT COUNT(*) as count FROM harmonic_fields").get() as any;
  if (!checkFields || checkFields.count < 24) {
    console.log("[Database] Semeando tabela completa de campos harmônicos (todas as tonalidades)...");
    // Clear existing to avoid duplicate conflicts
    db.prepare("DELETE FROM harmonic_field_chords").run();
    db.prepare("DELETE FROM harmonic_fields").run();

    const insertField = db.prepare(`
      INSERT INTO harmonic_fields (field_key, main_chord, description)
      VALUES (?, ?, ?)
    `);

    const insertFieldChord = db.prepare(`
      INSERT INTO harmonic_field_chords (field_id, degree, chord_name, role, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Define harmonic field records to seed
    const fieldsToSeed = [
      {
        key: "Dó Maior (C)",
        mainChord: "C",
        description: "O campo mais básico e brilhante do violão. Não possui nenhum sustenido (#) ou bemol (b). Perfeito para baladas doces e pop acústico.",
        chords: [
          { degree: "I", chordName: "C", role: "Tônica", description: "Acorde de repouso e resolução principal." },
          { degree: "I7M", chordName: "C7M", role: "Tônica", description: "Variação sofisticada do primeiro grau (Bossa Nova)." },
          { degree: "IIm", chordName: "Dm", role: "Subdominante", description: "Prepara o caminho, gerando um som suave de transição." },
          { degree: "IIIm", chordName: "Em", role: "Tônica (Atuante)", description: "Grau melancólico subordinado ao repouso." },
          { degree: "IV", chordName: "F", role: "Subdominante", description: "Gera sensação de suspensão e afastamento da tônica." },
          { degree: "V", chordName: "G", role: "Dominante", description: "Acorde de tensionamento forte que exige resolução voltando ao C." },
          { degree: "V7", chordName: "G7", role: "Dominante", description: "Tensão máxima com trítono clássico de preparação dominante." },
          { degree: "VIm", chordName: "Am", role: "Tônica (Atuante)", description: "Relativo menor oficial. Excelente para pontes reflexivas." },
          { degree: "VIIm7(b5)", chordName: "Bm7(b5)", role: "Dominante Pas.", description: "Meio-diminuto que adiciona dramaticidade jazzística." }
        ]
      },
      {
        key: "Dó Sustenido Maior (C#)",
        mainChord: "C#",
        description: "Tonalidade com sonorizaçao brilhante e cheia, rica em sustenidos. Possui 7 sustenidos.",
        chords: [
          { degree: "I", chordName: "C#", role: "Tônica", description: "Grau de estabilidade e repouso principal." },
          { degree: "IIm", chordName: "D#m", role: "Subdominante", description: "Excelente para caminhos de passagem suave." },
          { degree: "IIIm", chordName: "Fm", role: "Tônica", description: "Grau que serve como substituto suave da tônica." },
          { degree: "IV", chordName: "F#", role: "Subdominante", description: "Gera afastamento e sensação de amplitude." },
          { degree: "V", chordName: "G#", role: "Dominante", description: "Tensão clássica para preparar o repouso absoluto no C#." },
          { degree: "V7", chordName: "G#7", role: "Dominante", description: "Tensão máxima que puxa fortemente para a tônica." },
          { degree: "VIm", chordName: "A#m", role: "Tônica", description: "Relativo menor que acrescenta sobriedade." }
        ]
      },
      {
        key: "Ré Maior (D)",
        mainChord: "D",
        description: "Excelente para ritmos rápidos, pop nacional e rock. Possui 2 sustenidos (Fá# e Dó#).",
        chords: [
          { degree: "I", chordName: "D", role: "Tônica", description: "Alegre e extremamente vibrante." },
          { degree: "I7M", chordName: "D7M", role: "Tônica", description: "Textura aveludada romântica." },
          { degree: "IIm", chordName: "Em", role: "Subdominante", description: "Passagem fácil e de som redondo de dedilhado." },
          { degree: "IIIm", chordName: "F#m", role: "Tônica", description: "Contraste sereno e nostálgico." },
          { degree: "IV", chordName: "G", role: "Subdominante", description: "Contrapeso robusto e aberto." },
          { degree: "V", chordName: "A", role: "Dominante", description: "Encaminhamento direto e tenso rumo ao repouso." },
          { degree: "V7", chordName: "A7", role: "Dominante", description: "Tensão clássica indispensável de blues acústico." },
          { degree: "VIm", chordName: "Bm", role: "Tônica", description: "Relativo menor dramático que fecha bem estrofes." }
        ]
      },
      {
        key: "Mi Bemol Maior (Eb)",
        mainChord: "Eb",
        description: "Tonalidade com sonoridade aveludada e profunda, bastante usada em metais e arranjos sofisticados.",
        chords: [
          { degree: "I", chordName: "Eb", role: "Tônica", description: "Estabilidade principal da tonalidade com som encorpado." },
          { degree: "IIm", chordName: "Fm", role: "Subdominante", description: "Preparador melancólico de harmonia." },
          { degree: "IIIm", chordName: "Gm", role: "Tônica", description: "Sabor reflexivo com menor estável." },
          { degree: "IV", chordName: "Ab", role: "Subdominante", description: "Abertura aberta e cheia de ar." },
          { degree: "V", chordName: "Bb", role: "Dominante", description: "Empurrão de tensão harmônica." },
          { degree: "V7", chordName: "Bb7", role: "Dominante", description: "Preparador essencial para resolver no Eb." },
          { degree: "VIm", chordName: "Cm", role: "Tônica", description: "Relativo menor expressivo e nostálgico." }
        ]
      },
      {
        key: "Mi Maior (E)",
        mainChord: "E",
        description: "A tonalidade preferida dos tocadores de blues de Chicago, folk e modas de viola. 4 sustenidos (Fá#, Dó#, Sol# e Ré#).",
        chords: [
          { degree: "I", chordName: "E", role: "Tônica", description: "Som poderoso aproveitando todos os graves do violão de 6 cordas." },
          { degree: "IIm", chordName: "F#m", role: "Subdominante", description: "Acorde de suporte indispensável." },
          { degree: "IIIm", chordName: "C#m", role: "Tônica", description: "Nostalgias de menor relativo." },
          { degree: "IV", chordName: "A", role: "Subdominante", description: "Mudança aberta com os agudos livres." },
          { degree: "V", chordName: "B", role: "Dominante", description: "Tensão com abertura rítmica." },
          { degree: "V7", chordName: "B7", role: "Dominante", description: "A fôrma aberta de B7 gera uma das tensões mais ricas do violão." }
        ]
      },
      {
        key: "Fá Maior (F)",
        mainChord: "F",
        description: "Uma tonalidade robusta que exige pestana forte no violão, proporcionando canções encorpadas e expressivas.",
        chords: [
          { degree: "I", chordName: "F", role: "Tônica", description: "Base tônica com peso e sustentação na pestana." },
          { degree: "IIm", chordName: "Gm", role: "Subdominante", description: "Sonoridade suavemente sombria de preparação." },
          { degree: "IIIm", chordName: "Am", role: "Tônica", description: "Alternativa melancólica e levemente estável." },
          { degree: "IV", chordName: "Bb", role: "Subdominante", description: "Abertura de espaço e frescor melódico de passagem." },
          { degree: "V", chordName: "C", role: "Dominante", description: "Tensão luminosa de encaminhamento." },
          { degree: "V7", chordName: "C7", role: "Dominante", description: "Preparação dominante perfeita para voltar ao repouso no F." },
          { degree: "VIm", chordName: "Dm", role: "Tônica", description: "Relativo menor oficial que confere drama e emoção." }
        ]
      },
      {
        key: "Fá Sustenido Maior (F#)",
        mainChord: "F#",
        description: "Tonalidade ultra vibrante e complexa, com pestanas e timbres brilhantes no violão.",
        chords: [
          { degree: "I", chordName: "F#", role: "Tônica", description: "Grande brilho e estabilidade harmônica." },
          { degree: "IIm", chordName: "G#m", role: "Subdominante", description: "Gesto clássico de avanço e suspensão." },
          { degree: "IIIm", chordName: "A#m", role: "Tônica", description: "Contraponto estável romântico menor." },
          { degree: "IV", chordName: "B", role: "Subdominante", description: "Abertura cheia e limpa." },
          { degree: "V", chordName: "C#", role: "Dominante", description: "Tensão de impulsão clássica." },
          { degree: "V7", chordName: "C#7", role: "Dominante", description: "Tensão total para retorno glorioso à tônica F#." },
          { degree: "VIm", chordName: "D#m", role: "Tônica", description: "Relativo de extrema melancolia." }
        ]
      },
      {
        key: "Sol Maior (G)",
        mainChord: "G",
        description: "Um dos campos harmônicos mais populares no violão folk e sertanejo universitário. Contém 1 sustenido (Fá#).",
        chords: [
          { degree: "I", chordName: "G", role: "Tônica", description: "Base feliz e sólida da tonalidade." },
          { degree: "I7M", chordName: "G7M", role: "Tônica", description: "Som ultra-relaxante de fim de tarde." },
          { degree: "IIm", chordName: "Am", role: "Subdominante", description: "Transição suave e melancólica." },
          { degree: "IIIm", chordName: "Bm", role: "Tônica", description: "Ponto triste de estabilidade harmônica menor." },
          { degree: "IV", chordName: "C", role: "Subdominante", description: "Abertura de espaço e frescor melódico." },
          { degree: "V", chordName: "D", role: "Dominante", description: "Arremates de tensão brilhantes." },
          { degree: "V7", chordName: "D9", role: "Dominante", description: "A nona adiciona luxo resolvendo de volta no Sol." },
          { degree: "VIm", chordName: "Em", role: "Tônica", description: "Relativo melancólico de peso extremo." }
        ]
      },
      {
        key: "Lá Bemol Maior (Ab)",
        mainChord: "Ab",
        description: "Tonalidade doce e calorosa, de timbre fechado e aveludado.",
        chords: [
          { degree: "I", chordName: "Ab", role: "Tônica", description: "Tonalidade principal com timbre encorpado." },
          { degree: "IIm", chordName: "Bbm", role: "Subdominante", description: "Passagem melindrosa e intimista." },
          { degree: "IIIm", chordName: "Cm", role: "Tônica", description: "Tonalidade menor melancólica de estabilidade." },
          { degree: "IV", chordName: "Db", role: "Subdominante", description: "Efeito amplo de abertura de ar." },
          { degree: "V", chordName: "Eb", role: "Dominante", description: "Vigor com tensão que empurra de volta." },
          { degree: "V7", chordName: "Eb7", role: "Dominante", description: "Preparador mestre para resolução suave." },
          { degree: "VIm", chordName: "Fm", role: "Tônica", description: "Relativo apaixonado e melancólico menor." }
        ]
      },
      {
        key: "Lá Maior (A)",
        mainChord: "A",
        description: "Muito utilizado no blues, rock clássico e na Bossa Nova tradicional. Possui 3 sustenidos (Fá#, Dó# e Sol#).",
        chords: [
          { degree: "I", chordName: "A", role: "Tônica", description: "Acorde encorpado com os baixos na 5ª corda solta." },
          { degree: "I7M", chordName: "A7M", role: "Tônica", description: "Chave harmônica favorita dos amantes de Bossa Nova." },
          { degree: "IIm", chordName: "Bm", role: "Subdominante", description: "Pestana refinada de preparação." },
          { degree: "IIIm", chordName: "C#m", role: "Tônica", description: "Sensação reflexiva e intimista." },
          { degree: "IV", chordName: "D", role: "Subdominante", description: "Aperto vibrante de expansão." },
          { degree: "V", chordName: "E", role: "Dominante", description: "Preparador fundamental carregado de brilho." },
          { degree: "V7", chordName: "E7(9)", role: "Dominante", description: "Tensão com sabor de lounge jazz e brasilidade." },
          { degree: "VIm", chordName: "F#m", role: "Tônica", description: "Balanço melódico suave e elegante." }
        ]
      },
      {
        key: "Si Bemol Maior (Bb)",
        mainChord: "Bb",
        description: "Excelente para canções de MPB, Bossa Nova e jazz acústico. Possui 2 bemóis.",
        chords: [
          { degree: "I", chordName: "Bb", role: "Tônica", description: "Grande profundidade, muito macio e elegante." },
          { degree: "IIm", chordName: "Cm", role: "Subdominante", description: "Ponto de passagem redondo menor." },
          { degree: "IIIm", chordName: "Dm", role: "Tônica", description: "Melancolia reconfortante de suporte estável." },
          { degree: "IV", chordName: "Eb", role: "Subdominante", description: "Contrabalanço de ar que amplia a harmonia." },
          { degree: "V", chordName: "F", role: "Dominante", description: "Tensão luminosa clássica." },
          { degree: "V7", chordName: "F7", role: "Dominante", description: "Tensão com tritono perfeito de retorno para Bb." },
          { degree: "VIm", chordName: "Gm", role: "Tônica", description: "Relativo menor oficial forte e solene." }
        ]
      },
      {
        key: "Si Maior (B)",
        mainChord: "B",
        description: "Possui brilho penetrante e timbre muito vivo no violão. 5 sustenidos.",
        chords: [
          { degree: "I", chordName: "B", role: "Tônica", description: "Base brilhante e cheia de energia harmônica." },
          { degree: "IIm", chordName: "C#m", role: "Subdominante", description: "Ponto clássico menor de suporte rítmico." },
          { degree: "IIIm", chordName: "D#m", role: "Tônica", description: "Grau melancólico com afinação rica." },
          { degree: "IV", chordName: "E", role: "Subdominante", description: "Abertura limpa de grande amplitude." },
          { degree: "V", chordName: "F#", role: "Dominante", description: "Preparação brilhante e incisiva." },
          { degree: "V7", chordName: "F#7", role: "Dominante", description: "Tensão dominante irresistível puxando para o si." },
          { degree: "VIm", chordName: "G#m", role: "Tônica", description: "Relativo que confere drama denso." }
        ]
      },
      {
        key: "Dó Menor (Cm)",
        mainChord: "Cm",
        description: "Sonoridade dramática e densa, excelente para expressar sentimentos misteriosos ou solenes.",
        chords: [
          { degree: "Im", chordName: "Cm", role: "Tônica", description: "Fundação escura de enorme dramaticidade." },
          { degree: "IIm7(b5)", chordName: "Dm7(b5)", role: "Subdominante", description: "Prepara com angústia de meio-diminuto." },
          { degree: "bIII", chordName: "Eb", role: "Tônica", description: "O refúgio tônico maior brilhante e alegre." },
          { degree: "IVm", chordName: "Fm", role: "Subdominante", description: "Suporte melancólico clássico e sombrio." },
          { degree: "Vm", chordName: "Gm", role: "Dominante Natural", description: "Transição suave de clima nórdico." },
          { degree: "V7", chordName: "G7", role: "Dominante Harmônico", description: "Força dramática imperativa de retorno ao repouso." },
          { degree: "bVI", chordName: "Ab", role: "Subdominante", description: "Aumento de dinâmica épica e inspiradora." },
          { degree: "bVII", chordName: "Bb", role: "Dominante", description: "Caminho natural de glória maior." }
        ]
      },
      {
        key: "Dó Sustenido Menor (C#m)",
        mainChord: "C#m",
        description: "Um dos tons menores favoritos para violão acústico e pop rock. Muito expressivo e fácil encaixe harmônico.",
        chords: [
          { degree: "Im", chordName: "C#m", role: "Tônica", description: "Melancolia robusta, linda dedilhada de passagem." },
          { degree: "IIm7(b5)", chordName: "D#m7(b5)", role: "Subdominante", description: "Tensão meio-diminuta elegante." },
          { degree: "bIII", chordName: "E", role: "Tônica", description: "Passagem aberta e iluminada de tônica maior." },
          { degree: "IVm", chordName: "F#m", role: "Subdominante", description: "Cria atmosfera de recolhimento e profundidade." },
          { degree: "Vm", chordName: "G#m", role: "Dominante Natural", description: "Base límpida e repousante suave menor." },
          { degree: "V7", chordName: "G#7", role: "Dominante Harmônico", description: "Clássico preparador dominante de forte retorno." },
          { degree: "bVI", chordName: "A", role: "Subdominante", description: "Abertura tônica com grande fôlego acústico." },
          { degree: "bVII", chordName: "B", role: "Dominante", description: "Força de transição brilhante." }
        ]
      },
      {
        key: "Ré Menor (Dm)",
        mainChord: "Dm",
        description: "Tonalidade preferida para baladas profundas, canções renascentistas e músicas de clima misterioso.",
        chords: [
          { degree: "Im", chordName: "Dm", role: "Tônica", description: "O acorde mais triste possível, segundo cientistas harmônicos." },
          { degree: "Im9", chordName: "Dm9", role: "Tônica", description: "Sublime para músicas acústicas modernas estilo lofi." },
          { degree: "bIII", chordName: "F", role: "Tônica", description: "Abertura acolhedora de esperança." },
          { degree: "IVm", chordName: "Gm", role: "Subdominante", description: "Dramático e clássico de canções românticas." },
          { degree: "Vm", chordName: "Am", role: "Dominante Natural", description: "Clima limpo, nórdico ou medieval." },
          { degree: "V7", chordName: "A7", role: "Dominante Harmônico", description: "Prepara de forma imponente a entrada do Re Menor." },
          { degree: "bVI", chordName: "C", role: "Tônica", description: "Ponto suave de apoio." }
        ]
      },
      {
        key: "Mi Bemol Menor (Ebm)",
        mainChord: "Ebm",
        description: "Pesado, misterioso e profundo. Uma tonalidade carregada de sentimento de súplica ou introspecção profunda.",
        chords: [
          { degree: "Im", chordName: "D#m", role: "Tônica", description: "Tônica sombria mas infinitamente expressiva." },
          { degree: "IIm7(b5)", chordName: "Fm7(b5)", role: "Subdominante", description: "Tensão meio-diminuta complexa." },
          { degree: "bIII", chordName: "Gb", role: "Tônica", description: "Ponto maior de repouso refrescante." },
          { degree: "IVm", chordName: "G#m", role: "Subdominante", description: "Suporte profundo de base." },
          { degree: "Vm", chordName: "A#m", role: "Dominante Natural", description: "Contraste pacífico e suave menor." },
          { degree: "V7", chordName: "A#7", role: "Dominante Harmônico", description: "Fecho tenso clássico rumo à tônica." },
          { degree: "bVI", chordName: "B", role: "Subdominante", description: "Gera energia grandiosa de libertação." }
        ]
      },
      {
        key: "Mi Menor (Em)",
        mainChord: "Em",
        description: "Som de peso no rock nacional, folk nórdico e baladas acústicas intensas.",
        chords: [
          { degree: "Im", chordName: "Em", role: "Tônica", description: "O acorde menor mais fácil e encorpado do violão." },
          { degree: "IIm7", chordName: "F#m7", role: "Subdominante", description: "Pestana com passagem ágil de ritmo." },
          { degree: "bIII", chordName: "G", role: "Tônica", description: "Relativo alegre que contrasta a escuridão do Em." },
          { degree: "bIII7M", chordName: "G7M", role: "Tônica", description: "Estética suave e aberta." },
          { degree: "IVm", chordName: "Am", role: "Subdominante", description: "Sensação de profundidade no meio da música." },
          { degree: "Vm", chordName: "Bm7", role: "Dominante Natural", description: "Base moderna e fresca de transição." },
          { degree: "V7", chordName: "B7", role: "Dominante Harmônico", description: "Tensão clássica e forte de resolução para Em." },
          { degree: "bVI", chordName: "C", role: "Tônica", description: "Brilho aberto e expansivo de esperança." },
          { degree: "bVII", chordName: "D", role: "Dominante", description: "Ponto de partida clássico de retorno para Sol maior." }
        ]
      },
      {
        key: "Fá Menor (Fm)",
        mainChord: "Fm",
        description: "Tonalidade melancólica extrema, com som profundo e lamentos harmônicos requintados.",
        chords: [
          { degree: "Im", chordName: "Fm", role: "Tônica", description: "Sabor de extrema escuridão e seriedade de timbre." },
          { degree: "IIm7(b5)", chordName: "Gm7(b5)", role: "Subdominante", description: "Sinalizador melancólico sofisticado." },
          { degree: "bIII", chordName: "Ab", role: "Tônica", description: "O escape alegre tônico oficial." },
          { degree: "IVm", chordName: "Bbm", role: "Subdominante", description: "Efeito nostálgico e comovente de fado." },
          { degree: "Vm", chordName: "Cm", role: "Dominante Natural", description: "Grau que desacelera a tensão dramaticamente." },
          { degree: "V7", chordName: "C7", role: "Dominante Harmônico", description: "Tensão majestosa e forte imperativa sobre Fm." },
          { degree: "bVI", chordName: "Db", role: "Subdominante", description: "Abertura épica cheia de esperança." }
        ]
      },
      {
        key: "Fá Sustenido Menor (F#m)",
        mainChord: "F#m",
        description: "Muito amada na música popular brasileira e pop rock de tons reflexivos e profundidade poética.",
        chords: [
          { degree: "Im", chordName: "F#m", role: "Tônica", description: "Postura elegante de timbre equilibrado nas pestanas." },
          { degree: "IIm7(b5)", chordName: "G#m7(b5)", role: "Subdominante", description: "Preparador melancólico mestre." },
          { degree: "bIII", chordName: "A", role: "Tônica", description: "Brilho relaxante e espaçoso de tônica amorosa maior." },
          { degree: "IVm", chordName: "Bm", role: "Subdominante", description: "Suporte intimista excelente para rascunhos de compasso." },
          { degree: "Vm", chordName: "C#m", role: "Dominante Natural", description: "Suavidade de passagem no meio de estrofes." },
          { degree: "V7", chordName: "C#7", role: "Dominante Harmônico", description: "Gera forte empuxo espanhol direto ao repouso." },
          { degree: "bVI", chordName: "D", role: "Subdominante", description: "Contraste bonito e expansivo aberto." }
        ]
      },
      {
        key: "Sol Menor (Gm)",
        mainChord: "Gm",
        description: "Elegante e melancólico, muito comum no samba antigo, choro e no jazz melancólico.",
        chords: [
          { degree: "Im", chordName: "Gm", role: "Tônica", description: "Repouso elegante de sabor tradicional e refinado." },
          { degree: "IIm7(b5)", chordName: "Am7(b5)", role: "Subdominante", description: "Cadência meio-diminuta clássica brasileira." },
          { degree: "bIII", chordName: "Bb", role: "Tônica", description: "Repouso tômico maior de brilho sofisticadamente macio." },
          { degree: "IVm", chordName: "Cm", role: "Subdominante", description: "Delineador dramático de grande melancolia." },
          { degree: "Vm", chordName: "Dm", role: "Dominante Natural", description: "Suave transmutação de tons." },
          { degree: "V7", chordName: "D7", role: "Dominante Harmônico", description: "Alavanca de tensão clássica de re-resolução rápida." },
          { degree: "bVI", chordName: "Eb", role: "Subdominante", description: "Amplitude de tom que areja as estrofes." }
        ]
      },
      {
        key: "Sol Sustenido Menor (G#m)",
        mainChord: "G#m",
        description: "Altamente emotiva, com timbre denso e afinação com grande coloração acústica.",
        chords: [
          { degree: "Im", chordName: "G#m", role: "Tônica", description: "Base escura de grande introspecção." },
          { degree: "IIm7(b5)", chordName: "A#m7(b5)", role: "Subdominante", description: "Preparador sofisticado." },
          { degree: "bIII", chordName: "B", role: "Tônica", description: "Teto luminoso de estabilidade maior." },
          { degree: "IVm", chordName: "C#m", role: "Subdominante", description: "Contraste intimista menor excelente." },
          { degree: "Vm", chordName: "D#m", role: "Dominante Natural", description: "Suave andamento melancólico." },
          { degree: "V7", chordName: "D#7", role: "Dominante Harmônico", description: "Tensão imposta clássica." },
          { degree: "bVI", chordName: "E", role: "Subdominante", description: "Contrapeso robusto de libertação emocional." }
        ]
      },
      {
        key: "Lá Menor (Am)",
        mainChord: "Am",
        description: "Tonalidade melancólica e introspectiva por excelência. Sem acidentes na armadura, mas usa acordes harmônicos ricos (como E7).",
        chords: [
          { degree: "Im", chordName: "Am", role: "Tônica", description: "Fundação sombria e linda das canções mais sentimentais." },
          { degree: "Im9", chordName: "Am9", role: "Tônica", description: "Tensionado e elegante com a inclusão da nona." },
          { degree: "IIm7(b5)", chordName: "Bm7(b5)", role: "Subdominante", description: "Acorde de desequilíbrio dramático usado na descida." },
          { degree: "bIII", chordName: "C", role: "Tônica", description: "O repouso alternativo alegre da música." },
          { degree: "bIII7M", chordName: "C7M", role: "Tônica", description: "Bossa nova melancólica." },
          { degree: "IVm", chordName: "Dm", role: "Subdominante", description: "Nostalgia clássica do fado e canção popular." },
          { degree: "Vm", chordName: "Em", role: "Dominante Natural", description: "Cria uma melancolia limpa medieval." },
          { degree: "V7", chordName: "E7(9)", role: "Dominante Harmônico", description: "Aproximação espanhola flamenca e rítmica." },
          { degree: "bVI", chordName: "F", role: "Subdominante", description: "Aumento emotivo épico." },
          { degree: "bVII", chordName: "G", role: "Dominante", description: "Prepara o retorno à claridade." }
        ]
      },
      {
        key: "Si Bemol Menor (Bbm)",
        mainChord: "Bbm",
        description: "Uma tonalidade profunda, luxuosa e misteriosa, excelente para composições reflexivas lentas.",
        chords: [
          { degree: "Im", chordName: "Bbm", role: "Tônica", description: "Base tônica aveludada, escura e intimista." },
          { degree: "IIm7(b5)", chordName: "Cm7(b5)", role: "Subdominante", description: "Cadência de passagem meio-diminuta elegante." },
          { degree: "bIII", chordName: "Db", role: "Tônica", description: "Relativo alegre limpo de repouso." },
          { degree: "IVm", chordName: "Ebm", role: "Subdominante", description: "Intensidade sentimental e melancólica clássica." },
          { degree: "Vm", chordName: "Fm", role: "Dominante Natural", description: "Suavidade que acalma o drama." },
          { degree: "V7", chordName: "F7", role: "Dominante Harmônico", description: "Tensão alta que puxa vigorosamente rumo à tônica." },
          { degree: "bVI", chordName: "Gb", role: "Subdominante", description: "Amplitude que areja o sentimento melancólico." }
        ]
      },
      {
        key: "Si Menor (Bm)",
        mainChord: "Bm",
        description: "Umas das tonalidades menores mais belas no violão, extremamente usada em arranjos de violão dedilhado.",
        chords: [
          { degree: "Im", chordName: "Bm", role: "Tônica", description: "Sensação profunda de nostalgia e estabilidade." },
          { degree: "IIm7(b5)", chordName: "C#m7(b5)", role: "Subdominante", description: "Prepara a cadência com toque doloroso jazzístico." },
          { degree: "bIII", chordName: "D", role: "Tônica", description: "Equilíbrio feliz e tônico maior brilhante de passagem." },
          { degree: "IVm", chordName: "Em", role: "Subdominante", description: "Grande suporte de graves encorpados de passagem." },
          { degree: "Vm", chordName: "F#m", role: "Dominante Natural", description: "Conexão suave menor melancólica." },
          { degree: "V7", chordName: "F#7", role: "Dominante Harmônico", description: "Tensão de preparação clássica indispensável." },
          { degree: "bVI", chordName: "G", role: "Subdominante", description: "Contraste vibrante aberto de esperança." },
          { degree: "bVII", chordName: "A", role: "Dominante", description: "Base brilhante e luminosa de transição." }
        ]
      }
    ];

    fieldsToSeed.forEach((field) => {
      const fieldResult = insertField.run(field.key, field.mainChord, field.description);
      const fieldId = fieldResult.lastInsertRowid;
      field.chords.forEach((chord) => {
        insertFieldChord.run(fieldId, chord.degree, chord.chordName, chord.role, chord.description);
      });
    });

    console.log("[Database] Tabela completa de todos os 24 campos harmônicos individuais semeada com sucesso no SQLite.");
  }
} catch (e) {
  console.error("[Database] Erro ao semear campos harmônicos:", e);
}

// Database helper operations
export const dbOperations = {
  // Users
  getUserByEmail(email: string) {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email) as any;
  },

  createUser(email: string, username: string, passwordHash: string, guitarLevel?: string) {
    const stmt = db.prepare(`
      INSERT INTO users (email, username, password, joined_at, guitar_level)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(email, username, passwordHash, new Date().toLocaleDateString("pt-BR"), guitarLevel || "Iniciante");
    return info.changes > 0;
  },

  deleteUser(email: string) {
    const stmt = db.prepare("DELETE FROM users WHERE email = ?");
    const info = stmt.run(email);
    return info.changes > 0;
  },

  logUserLogin(email: string, userAgent: string | null) {
    const stmt = db.prepare(`
      INSERT INTO user_logins (user_email, login_at, user_agent)
      VALUES (?, ?, ?)
    `);
    stmt.run(email, new Date().toISOString(), userAgent || "");
  },

  // Songs
  getCustomSongs() {
    try {
      const stmt = db.prepare("SELECT * FROM custom_songs");
      const rows = stmt.all() as any[];
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        artist: row.artist,
        bpm: Number(row.bpm),
        rhythm: row.rhythm,
        strummingPattern: JSON.parse(row.strumming_pattern || "[]"),
        chordsUsed: JSON.parse(row.chords_used || "[]"),
        lines: JSON.parse(row.lines || "[]"),
        videoTip: row.video_tip || undefined,
      }));
    } catch (e) {
      console.error("Erro ao resgatar custom_songs do SQLite:", e);
      return [];
    }
  },

  createSong(song: any) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO custom_songs (id, title, artist, bpm, rhythm, strumming_pattern, chords_used, lines, video_tip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        song.id,
        song.title,
        song.artist,
        song.bpm,
        song.rhythm,
        JSON.stringify(song.strummingPattern),
        JSON.stringify(song.chordsUsed),
        JSON.stringify(song.lines),
        song.videoTip || null
      );
      return info.changes > 0;
    } catch (e) {
      console.error("Erro ao criar custom_song no SQLite:", e);
      return false;
    }
  },

  deleteSong(id: string) {
    try {
      const stmt = db.prepare("DELETE FROM custom_songs WHERE id = ?");
      const info = stmt.run(id);
      return info.changes > 0;
    } catch (e) {
      console.error("Erro ao deletar custom_song do SQLite:", e);
      return false;
    }
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
        u.guitar_level,
        (SELECT COUNT(*) FROM lessons_completed lc WHERE lc.user_email = u.email) as lessons_done,
        (SELECT COUNT(*) FROM student_notes sn WHERE sn.user_email = u.email) as notes_done,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.user_email = u.email) as messages_sent,
        (SELECT COUNT(*) FROM user_logins ul WHERE ul.user_email = u.email) as logins_count,
        (SELECT MAX(login_at) FROM user_logins ul WHERE ul.user_email = u.email) as last_login
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

    // 7. Recent login history across all users for analytics
    const recentLogins = db.prepare(`
      SELECT 
        ul.id,
        ul.user_email, 
        u.username,
        ul.login_at,
        ul.user_agent
      FROM user_logins ul
      JOIN users u ON ul.user_email = u.email
      ORDER BY ul.login_at DESC
      LIMIT 50
    `).all() as any[];

    return {
      usersCount,
      completedLessonsCount,
      notesCount,
      messagesCount,
      usersList,
      recentNotes,
      recentLogins
    };
  },

  // Lessons track
  getLessons(level?: string): any[] {
    if (level) {
      const stmt = db.prepare("SELECT * FROM lessons WHERE level = ? ORDER BY lesson_order ASC");
      return stmt.all(level) as any[];
    }
    const stmt = db.prepare("SELECT * FROM lessons ORDER BY level DESC, lesson_order ASC");
    return stmt.all() as any[];
  },

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
  },

  // Level Quiz Operations
  getQuizQuestions(level: string) {
    const stmt = db.prepare("SELECT * FROM level_test_questions WHERE level = ? ORDER BY id ASC");
    return stmt.all(level) as any[];
  },

  saveQuizResult(email: string, level: string, score: number, total: number, passed: boolean, isPractice: boolean = false) {
    const passedVal = passed ? 1 : 0;
    // Se reprovar na prova oficial, bloqueia por 5 minutos para encorajar estudos das lições. Treino livre nunca bloqueia.
    const blockedUntilStr = (passed || isPractice) ? null : new Date(Date.now() + 5 * 60 * 1000).toISOString();
 
    const stmt = db.prepare(`
      INSERT INTO level_test_results (user_email, level, score, total, passed, completed_at, blocked_until)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_email, level) DO UPDATE SET
        score = excluded.score,
        total = excluded.total,
        passed = excluded.passed,
        completed_at = excluded.completed_at,
        blocked_until = CASE WHEN excluded.blocked_until IS NULL THEN level_test_results.blocked_until ELSE excluded.blocked_until END
    `);
    const info = stmt.run(email, level, score, total, passedVal, new Date().toISOString(), blockedUntilStr);
 
    // Auto-promote level of the user if they passed the official test (not practice)!
    if (passed && !isPractice) {
      const user = this.getUserByEmail(email);
      if (user) {
        let newLevel = user.guitar_level;
        if (level === "Iniciante" && user.guitar_level === "Iniciante") {
          newLevel = "Intermediário";
        } else if (level === "Intermediário" && user.guitar_level === "Intermediário") {
          newLevel = "Avançado";
        }
        if (newLevel !== user.guitar_level) {
          const updateLvl = db.prepare("UPDATE users SET guitar_level = ? WHERE email = ?");
          updateLvl.run(newLevel, email);
          console.log(`[Database] Aluno ${email} promovido para nível ${newLevel}!`);
        }
      }
    }
    return info.changes > 0;
  },

  getQuizResults(email: string) {
    const stmt = db.prepare("SELECT * FROM level_test_results WHERE user_email = ? ORDER BY completed_at DESC");
    return stmt.all(email) as any[];
  },

  getCompletedChallenges(email: string): string[] {
    const stmt = db.prepare("SELECT challenge_id FROM completed_challenges WHERE user_email = ?");
    const rows = stmt.all(email) as any[];
    return rows.map((row) => row.challenge_id);
  },

  getAudioSettings(email: string) {
    const stmt = db.prepare("SELECT * FROM user_audio_settings WHERE user_email = ?");
    return stmt.get(email) as any;
  },

  saveAudioSettings(email: string, masterVolume: number, guitarType: string, metronomeFrequency: number, strumSpeed: string) {
    const stmt = db.prepare(`
      INSERT INTO user_audio_settings (user_email, master_volume, guitar_type, metronome_frequency, strum_speed, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_email) DO UPDATE SET
        master_volume = excluded.master_volume,
        guitar_type = excluded.guitar_type,
        metronome_frequency = excluded.metronome_frequency,
        strum_speed = excluded.strum_speed,
        updated_at = excluded.updated_at
    `);
    const info = stmt.run(email, masterVolume, guitarType, metronomeFrequency, strumSpeed, new Date().toISOString());
    return info.changes > 0;
  },

  completeChallenge(email: string, challengeId: string) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO completed_challenges (user_email, challenge_id, completed_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(email, challengeId, new Date().toISOString());
  },

  uncompleteChallenge(email: string, challengeId: string) {
    const stmt = db.prepare(`
      DELETE FROM completed_challenges WHERE user_email = ? AND challenge_id = ?
    `);
    stmt.run(email, challengeId);
  },

  addPracticeSession(email: string, durationMinutes: number, focusArea: string, notes: string, difficulty: string) {
    const stmt = db.prepare(`
      INSERT INTO practice_sessions (user_email, session_date, duration_minutes, focus_area, notes, difficulty)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const info = stmt.run(email, dateStr, durationMinutes, focusArea, notes, difficulty);
    return info.changes > 0;
  },

  getPracticeSessions(email: string) {
    const stmt = db.prepare(`
      SELECT * FROM practice_sessions
      WHERE user_email = ?
      ORDER BY id DESC
    `);
    return stmt.all(email) as any[];
  },

  getUserPerformanceSummary(email: string) {
    // 1. Total lessons available & completed
    const lessonsCountRow = db.prepare("SELECT COUNT(*) as count FROM lessons").get() as any;
    const lessonsCount = lessonsCountRow ? lessonsCountRow.count : 0;
    
    const completedLessonsCountRow = db.prepare("SELECT COUNT(*) as count FROM lessons_completed WHERE user_email = ?").get() as any;
    const completedLessonsCount = completedLessonsCountRow ? completedLessonsCountRow.count : 0;

    // 2. Quiz performance
    const quizResults = db.prepare("SELECT * FROM level_test_results WHERE user_email = ?").all(email) as any[];
    let totalScore = 0;
    let totalQuestions = 0;
    let examsPassed = 0;
    
    quizResults.forEach(r => {
      totalScore += r.score;
      totalQuestions += r.total;
      if (r.passed) examsPassed++;
    });

    const averageQuizScorePct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    // 3. Completed challenges count
    const challengesRow = db.prepare("SELECT COUNT(*) as count FROM completed_challenges WHERE user_email = ?").get() as any;
    const completedChallengesCount = challengesRow ? challengesRow.count : 0;

    // 4. Practice duration
    const practiceStatsRow = db.prepare(`
      SELECT 
        SUM(duration_minutes) as total_min,
        COUNT(DISTINCT session_date) as active_days
      FROM practice_sessions
      WHERE user_email = ?
    `).get(email) as any;

    const totalPracticeMinutes = (practiceStatsRow && practiceStatsRow.total_min) || 0;
    const activePracticeDays = (practiceStatsRow && practiceStatsRow.active_days) || 0;

    // 5. Group by focus area for stats chart
    const focusStats = db.prepare(`
      SELECT focus_area as focusArea, SUM(duration_minutes) as minutes
      FROM practice_sessions
      WHERE user_email = ?
      GROUP BY focus_area
    `).all(email) as any[];

    // 6. Group by difficulty
    const difficultyStats = db.prepare(`
      SELECT difficulty, COUNT(*) as count
      FROM practice_sessions
      WHERE user_email = ?
      GROUP BY difficulty
    `).all(email) as any[];

    // 7. Get last practice sessions
    const recentSessions = db.prepare(`
      SELECT * FROM practice_sessions
      WHERE user_email = ?
      ORDER BY id DESC
      LIMIT 10
    `).all(email) as any[];

    // 8. Calculate a Practice Streak (simplificado)
    let streak = 0;
    try {
      const datesRow = db.prepare(`
        SELECT DISTINCT session_date 
        FROM practice_sessions 
        WHERE user_email = ? 
        ORDER BY session_date DESC
      `).all(email) as any[];
      
      const dates = datesRow.map((d: any) => d.session_date);
      if (dates.length > 0) {
        let currentRef = new Date();
        const formatDateStr = (d: Date) => d.toISOString().split("T")[0];
        
        // Se treinou hoje ou ontem, começa o streak
        const todayStr = formatDateStr(currentRef);
        currentRef.setDate(currentRef.getDate() - 1);
        const yesterdayStr = formatDateStr(currentRef);
        
        if (dates.includes(todayStr) || dates.includes(yesterdayStr)) {
          streak = 1;
          let checkDate = new Date();
          if (!dates.includes(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1); // se treinou ontem, começa a checar de ontem para trás
          }
          
          while (true) {
            checkDate.setDate(checkDate.getDate() - 1);
            const checkingStr = formatDateStr(checkDate);
            if (dates.includes(checkingStr)) {
              streak++;
            } else {
              break;
            }
          }
        }
      }
    } catch (e) {
      console.error("Erro ao calcular streak de estudos:", e);
    }

    return {
      lessonsCount,
      completedLessonsCount,
      completedChallengesCount,
      totalPracticeMinutes,
      activePracticeDays,
      averageQuizScorePct,
      examsPassed,
      streak,
      focusStats,
      difficultyStats,
      recentSessions
    };
  },

  getVideoLessons(level: string) {
    const stmt = db.prepare(`
      SELECT * FROM video_lessons
      WHERE level = ?
      ORDER BY id ASC
    `);
    return stmt.all(level) as any[];
  },

  getAllVideoLessons() {
    const stmt = db.prepare(`
      SELECT * FROM video_lessons
      ORDER BY level, id ASC
    `);
    return stmt.all() as any[];
  },

  getStudentQuestions(level: string) {
    const stmt = db.prepare(`
      SELECT * FROM student_questions
      WHERE level = ?
      ORDER BY id DESC
    `);
    return stmt.all(level) as any[];
  },

  getAllStudentQuestions() {
    const stmt = db.prepare(`
      SELECT * FROM student_questions
      ORDER BY id DESC
    `);
    return stmt.all() as any[];
  },

  answerStudentQuestion(questionId: number, answer: string, videoUrl?: string, videoTitle?: string) {
    const stmt = db.prepare(`
      UPDATE student_questions
      SET answer = ?, video_url = ?, video_title = ?
      WHERE id = ?
    `);
    const result = stmt.run(answer, videoUrl || null, videoTitle || null, questionId);
    return result.changes > 0;
  },

  addStudentQuestion(userEmail: string, level: string, title: string, question: string) {
    const stmt = db.prepare(`
      INSERT INTO student_questions (user_email, level, title, question, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(userEmail, level, title, question, new Date().toISOString());
  },

  getChordLockStatus(userEmail?: string) {
    const lockStmt = db.prepare("SELECT is_locked FROM system_locks WHERE lock_name = 'advanced_chords'");
    const lockRow = lockStmt.get() as { is_locked: number } | undefined;
    const isGlobalLocked = lockRow ? lockRow.is_locked === 1 : true;

    let userLevel = "Iniciante";
    if (userEmail) {
      const userStmt = db.prepare("SELECT guitar_level FROM users WHERE email = ?");
      const userRow = userStmt.get(userEmail) as { guitar_level: string } | undefined;
      if (userRow) {
        userLevel = userRow.guitar_level;
      }
    }

    const isLockedForUser = isGlobalLocked && userLevel !== "Avançado";

    return {
      globalLocked: isGlobalLocked,
      userLevel,
      isLockedForUser
    };
  },

  toggleChordLock(isLocked: boolean) {
    const stmt = db.prepare(`
      UPDATE system_locks
      SET is_locked = ?
      WHERE lock_name = 'advanced_chords'
    `);
    const result = stmt.run(isLocked ? 1 : 0);
    return result.changes > 0;
  },

  logPdfDownload(email: string, downloadType: string) {
    const stmt = db.prepare(`
      INSERT INTO pdf_downloads (user_email, download_type, downloaded_at)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(email, downloadType, new Date().toISOString());
    return result.changes > 0;
  },

  getUserPdfDownloads(email: string) {
    const stmt = db.prepare(`
      SELECT * FROM pdf_downloads
      WHERE user_email = ?
      ORDER BY id DESC
    `);
    return stmt.all(email) as any[];
  },

  getAllPdfDownloads() {
    const stmt = db.prepare(`
      SELECT p.*, u.username FROM pdf_downloads p
      LEFT JOIN users u ON p.user_email = u.email
      ORDER BY p.id DESC
    `);
    return stmt.all() as any[];
  },

  getHarmonicFields(): any[] {
    const fields = db.prepare("SELECT * FROM harmonic_fields ORDER BY id ASC").all() as any[];
    return fields.map((field) => {
      const chords = db.prepare("SELECT * FROM harmonic_field_chords WHERE field_id = ? ORDER BY id ASC").all(field.id) as any[];
      return {
        key: field.field_key,
        mainChord: field.main_chord,
        description: field.description,
        chords: chords.map(c => ({
          degree: c.degree,
          chordName: c.chord_name,
          role: c.role,
          description: c.description
        }))
      };
    });
  },

  getUserBackup(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    
    // Fetch completed lessons
    const lessonsCompleted = db.prepare(`
      SELECT lesson_id, completed_at FROM lessons_completed WHERE user_email = ?
    `).all(cleanEmail) as any[];

    // Fetch notes
    const studentNotes = db.prepare(`
      SELECT item_id, item_type, content, updated_at FROM student_notes WHERE user_email = ?
    `).all(cleanEmail) as any[];

    // Fetch completed challenges
    const completedChallenges = db.prepare(`
      SELECT challenge_id, completed_at FROM completed_challenges WHERE user_email = ?
    `).all(cleanEmail) as any[];

    // Fetch audio settings
    const audioSettings = db.prepare(`
      SELECT master_volume, guitar_type, metronome_frequency, strum_speed, updated_at 
      FROM user_audio_settings WHERE user_email = ?
    `).get(cleanEmail) as any || null;

    // Fetch practice sessions
    const practiceSessions = db.prepare(`
      SELECT session_date, duration_minutes, focus_area, notes, difficulty 
      FROM practice_sessions WHERE user_email = ?
    `).all(cleanEmail) as any[];

    // Fetch quiz results
    const quizResults = db.prepare(`
      SELECT level, score, total, passed, completed_at, blocked_until 
      FROM level_test_results WHERE user_email = ?
    `).all(cleanEmail) as any[];

    return {
      lessonsCompleted,
      studentNotes,
      completedChallenges,
      audioSettings,
      practiceSessions,
      quizResults
    };
  },

  restoreUserBackup(email: string, backup: any) {
    const cleanEmail = email.trim().toLowerCase();
    
    // We use a transaction to guarantee data integrity
    const restoreTx = db.transaction(() => {
      // 1. Restore completed lessons
      db.prepare(`DELETE FROM lessons_completed WHERE user_email = ?`).run(cleanEmail);
      if (Array.isArray(backup.lessonsCompleted)) {
        const stmt = db.prepare(`
          INSERT INTO lessons_completed (user_email, lesson_id, completed_at)
          VALUES (?, ?, ?)
        `);
        for (const item of backup.lessonsCompleted) {
          stmt.run(cleanEmail, item.lesson_id, item.completed_at || new Date().toISOString());
        }
      }

      // 2. Restore student notes
      db.prepare(`DELETE FROM student_notes WHERE user_email = ?`).run(cleanEmail);
      if (Array.isArray(backup.studentNotes)) {
        const stmt = db.prepare(`
          INSERT INTO student_notes (user_email, item_id, item_type, content, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const item of backup.studentNotes) {
          stmt.run(cleanEmail, item.item_id, item.item_type, item.content, item.updated_at || new Date().toISOString());
        }
      }

      // 3. Restore completed challenges
      db.prepare(`DELETE FROM completed_challenges WHERE user_email = ?`).run(cleanEmail);
      if (Array.isArray(backup.completedChallenges)) {
        const stmt = db.prepare(`
          INSERT INTO completed_challenges (user_email, challenge_id, completed_at)
          VALUES (?, ?, ?)
        `);
        for (const item of backup.completedChallenges) {
          stmt.run(cleanEmail, item.challenge_id, item.completed_at || new Date().toISOString());
        }
      }

      // 4. Restore audio settings
      if (backup.audioSettings) {
        db.prepare(`DELETE FROM user_audio_settings WHERE user_email = ?`).run(cleanEmail);
        const stmt = db.prepare(`
          INSERT INTO user_audio_settings (user_email, master_volume, guitar_type, metronome_frequency, strum_speed, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const s = backup.audioSettings;
        stmt.run(
          cleanEmail,
          s.master_volume || 80,
          s.guitar_type || "acoustic_steel",
          s.metronome_frequency || 1000,
          s.strum_speed || "strum",
          s.updated_at || new Date().toISOString()
        );
      }

      // 5. Restore practice sessions
      db.prepare(`DELETE FROM practice_sessions WHERE user_email = ?`).run(cleanEmail);
      if (Array.isArray(backup.practiceSessions)) {
        const stmt = db.prepare(`
          INSERT INTO practice_sessions (user_email, session_date, duration_minutes, focus_area, notes, difficulty)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const item of backup.practiceSessions) {
          stmt.run(
            cleanEmail,
            item.session_date,
            item.duration_minutes || 15,
            item.focus_area || "Geral",
            item.notes || "",
            item.difficulty || "Médio"
          );
        }
      }

      // 6. Restore quiz results
      db.prepare(`DELETE FROM level_test_results WHERE user_email = ?`).run(cleanEmail);
      if (Array.isArray(backup.quizResults)) {
        const stmt = db.prepare(`
          INSERT INTO level_test_results (user_email, level, score, total, passed, completed_at, blocked_until)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const item of backup.quizResults) {
          stmt.run(
            cleanEmail,
            item.level,
            item.score,
            item.total,
            item.passed,
            item.completed_at || new Date().toISOString(),
            item.blocked_until || null
          );
        }
      }
    });

    restoreTx();
    return true;
  }
};

export default db;
