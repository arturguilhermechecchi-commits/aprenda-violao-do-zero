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

// Seed all lessons (beginner, intermediate, advanced) in the database
try {
  console.log("[Database] Semeando/atualizando tabela de lições no SQLite...");
  
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
    }
  ];

  // Original advanced lessons
  const advancedLessons = [
    {
      id: "les-7",
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
      id: "les-8",
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
  if (!checkQuestionsCount || checkQuestionsCount.count < 15) {
    console.log("[Database] Semeando tabela completa de perguntas do quiz no SQLite (18 questões)...");
    db.prepare("DELETE FROM level_test_questions").run();
    const insertQuestion = db.prepare(`
      INSERT INTO level_test_questions (level, question, options, correct_index, explanation)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Iniciante
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

    console.log("[Database] Tabela completa de perguntas do quiz (18 questões) semeada com sucesso no SQLite.");
  }
} catch (e) {
  console.error("[Database] Erro ao semear perguntas do quiz:", e);
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
  }
};

export default db;
