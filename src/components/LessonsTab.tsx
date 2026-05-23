import { useState, useEffect } from "react";
import { Lesson, UserSession } from "../types";
import { Check, BookOpen, Music, Shield, Award, Sparkles, CheckCircle2, Circle, Edit3, Save } from "lucide-react";

const LESSON_DATABASE: Lesson[] = [
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

$$\\text{P} \\rightarrow \\text{I} \\rightarrow \\text{M} \\rightarrow \\text{A} \\rightarrow \\text{M} \\rightarrow \\text{I}$$

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
    id: "les-7",
    title: "Síncope Brasileira e Harmonia de Bossa Nova",
    category: "technique",
    description: "Desvende acordes complexos com extensões e o marcante balanço de João Gilberto.",
    order: 7,
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
    order: 8,
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

### 2. Dicas para solar de verdade:
Não suba e desça a escala apenas como uma máquina de exercícios:
- **Hammer-ons e Pull-offs:** Use o martelado dos dedos para ligar uma nota a outra suavemente sem palhetar duas vezes.
- **Slide:** Deslize o dedo de uma casa para outra arrastando-o (ex: da casa 7 para a 9) para criar um efeito fluído e emotivo.
- **Vibrato:** Balance o dedo sutilmente após pressionar a nota para encorpar a vibração natural da corda, mantendo o sustento do timbre.`
  }
];

interface LessonsTabProps {
  currentUser: UserSession | null;
}

export default function LessonsTab({ currentUser }: LessonsTabProps) {
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSON_DATABASE[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const userEmail = currentUser?.email || "convidado@violao.com";

  // Fetch completed lessons list from SQLite
  useEffect(() => {
    fetch(`/api/lessons/completed?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.completed) {
          setCompletedLessons(data.completed);
        }
      })
      .catch((err) => console.error("Erro ao carregar progresso SQLite:", err));
  }, [userEmail]);

  // Fetch student note whenever active lesson changes
  useEffect(() => {
    setSaveSuccess(false);
    fetch(`/api/notes?email=${encodeURIComponent(userEmail)}&itemId=${encodeURIComponent(activeLesson.id)}&itemType=lesson`)
      .then((res) => res.json())
      .then((data) => {
        setNoteText(data.content || "");
      })
      .catch((err) => console.error("Erro ao carregar anotação do SQLite:", err));
  }, [userEmail, activeLesson.id]);

  const toggleLessonComplete = async (id: string) => {
    let isCurrentlyCompleted = completedLessons.includes(id);
    let updated: string[];
    if (isCurrentlyCompleted) {
      updated = completedLessons.filter((item) => item !== id);
    } else {
      updated = [...completedLessons, id];
    }
    
    // Optimistic UI update
    setCompletedLessons(updated);

    try {
      const apiPath = isCurrentlyCompleted ? "/api/lessons/uncomplete" : "/api/lessons/complete";
      await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, lessonId: id }),
      });
    } catch (err) {
      console.error("Erro ao sincronizar lição no SQLite:", err);
    }
  };

  const completeLessonAndGoToNext = async (currentId: string) => {
    if (!completedLessons.includes(currentId)) {
      const updated = [...completedLessons, currentId];
      setCompletedLessons(updated);
      try {
        await fetch("/api/lessons/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, lessonId: currentId }),
        });
      } catch (err) {
        console.error("Erro ao sincronizar conclusão de lição no SQLite:", err);
      }
    }

    const next = LESSON_DATABASE.find(l => l.order === activeLesson.order + 1);
    if (next) setActiveLesson(next);
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          itemId: activeLesson.id,
          itemType: "lesson",
          content: noteText,
        }),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao salvar anotação:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const getPercentageComplete = () => {
    return Math.round((completedLessons.length / LESSON_DATABASE.length) * 100);
  };

  const currentCompleteness = getPercentageComplete();

  return (
    <div id="lessons-tab-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Lessons Sidebar Menu / Left */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Course Progress Dashboard card */}
        <div className="bg-gradient-to-br from-amber-900 to-amber-950 p-5 rounded-2xl text-stone-100 shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200/80 font-mono">
                Seu Aprendizado
              </span>
              <h4 className="font-extrabold text-lg mt-0.5">Módulo Geral Iniciante</h4>
            </div>
            <Award className="w-6 h-6 text-yellow-400 rotate-6" />
          </div>

          <div className="mb-2 flex justify-between text-xs text-amber-200">
            <span>Progresso Geral</span>
            <span className="font-bold">{currentCompleteness}%</span>
          </div>
          <div className="w-full bg-amber-950/60 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentCompleteness}%` }}
            />
          </div>

          {currentCompleteness === 100 && (
            <div className="mt-4 p-2 bg-yellow-400/10 rounded-xl border border-yellow-400/25 flex gap-2 items-center text-[10px] text-yellow-300">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Parabéns! Você completou as lições base! Vá para a aba "Músicas" e pratique.</span>
            </div>
          )}
        </div>

        {/* Lesson Items list */}
        <div className="flex flex-col gap-2">
          {LESSON_DATABASE.map((les) => {
            const isCompleted = completedLessons.includes(les.id);
            const isActive = activeLesson.id === les.id;

            return (
              <div
                key={les.id}
                id={`lesson-card-${les.id}`}
                onClick={() => setActiveLesson(les)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3.5 text-left relative overflow-hidden ${
                  isActive
                    ? "bg-white dark:bg-stone-900 border-amber-600 dark:border-amber-700 shadow-sm"
                    : "bg-white dark:bg-stone-900 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
                }`}
              >
                {/* Completion radio circle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLessonComplete(les.id);
                  }}
                  title={isCompleted ? "Marcar como não concluído" : "Marcar como concluído"}
                  className="mt-0.5 shrink-0 focus:outline-none"
                  id={`lesson-complete-checkbox-${les.id}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 fill-green-150 dark:fill-green-950/40" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-stone-700 hover:text-amber-700" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 dark:bg-stone-800 rounded text-slate-550 dark:text-stone-400">
                      Aula {les.order}
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-500 font-semibold italic">
                      {les.category === "anatomy" && "Anatomia"}
                      {les.category === "posture" && "Postura"}
                      {les.category === "technique" && "Rítmica"}
                      {les.category === "theory" && "Teoria"}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{les.title}</h5>
                  <p className="text-xs text-slate-500 dark:text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                    {les.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lesson View Area / Right panel */}
      <div className="lg:col-span-8 bg-white dark:bg-stone-900/40 rounded-3xl border border-slate-205 dark:border-stone-800 p-6 md:p-8 flex flex-col justify-between shadow-sm min-h-[500px]">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-stone-800 pb-5 mb-5">
            <div>
              <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-amber-700 dark:text-amber-500">
                Curso Prático de Violão do Zero
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
                {activeLesson.title}
              </h2>
            </div>
            
            <button
              onClick={() => toggleLessonComplete(activeLesson.id)}
              id="lesson-complete-toggle-top-btn"
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                completedLessons.includes(activeLesson.id)
                  ? "bg-green-500/10 border-green-300 text-green-700 dark:text-green-400"
                  : "bg-slate-50 dark:bg-stone-950 border-slate-200 dark:border-stone-800 text-slate-600 dark:text-stone-300 hover:bg-slate-100"
              }`}
            >
              <Check className="w-4 h-4" />
              {completedLessons.includes(activeLesson.id) ? "Concluída!" : "Concluir Lição"}
            </button>
          </div>

          {/* Lesson Interactive Markdown Parser */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-stone-200 text-sm leading-relaxed space-y-4">
            {activeLesson.contentMarkdown.split("\n\n").map((part, pIdx) => {
              if (part.startsWith("### ")) {
                return (
                  <h4 key={pIdx} className="text-base font-bold text-slate-900 dark:text-amber-200 mt-5 mb-2">
                    {part.substring(4)}
                  </h4>
                );
              }
              if (part.startsWith("#### ")) {
                return (
                  <h5 key={pIdx} className="text-sm font-bold text-amber-800 dark:text-amber-400 mt-4 mb-2">
                    {part.substring(5)}
                  </h5>
                );
              }
              if (part.startsWith("↓ ")) {
                // Interactive strumming rhythm line representer
                const strokeArray = part.split("  ");
                return (
                  <div key={pIdx} className="my-6 bg-amber-50/50 dark:bg-stone-950/30 border border-amber-100 dark:border-stone-800 p-5 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-450 dark:text-stone-500 uppercase tracking-widest font-mono font-bold block mb-3">
                      Toque as Cordas no Ritmo Indicado (Bata com Polegar ou Dedos)
                    </span>
                    <div className="flex justify-center items-center gap-4">
                      {strokeArray.map((stroke, sIdx) => {
                        const isDown = stroke.trim() === "↓";
                        return (
                          <div key={sIdx} className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border shadow-sm ${
                              isDown
                                ? "bg-amber-800 text-stone-50 border-amber-900"
                                : "bg-yellow-500 text-stone-900 border-yellow-600"
                            }`}>
                              {stroke}
                            </div>
                            <span className="text-[10px] font-mono mt-1 font-semibold text-slate-500">
                              {isDown ? "BAIXO" : "CIMA"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              if (part.startsWith("- ") || part.startsWith("1. ")) {
                // List parsing simple text helper
                const isOrdered = part.startsWith("1. ");
                const listItems = part.split("\n");
                return (
                  <ul key={pIdx} className={`space-y-2 my-3 ${isOrdered ? "list-decimal" : "list-disc"} list-inside`}>
                    {listItems.map((item, lIdx) => {
                      const cleanText = item.replace(/^(-\s||\d+\.\s)/, "");
                      return (
                        <li key={lIdx} className="text-slate-650 dark:text-stone-300">
                          {formatInlineMarkdown(cleanText)}
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // Simple line
              return (
                <p key={pIdx} className="text-slate-650 dark:text-stone-300">
                  {formatInlineMarkdown(part)}
                </p>
              );
            })}
          </div>

          {/* Diário de Estudo - SQLite backend */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-stone-800 text-left">
            <h4 className="text-sm font-bold text-slate-900 dark:text-stone-100 flex items-center gap-2 mb-1.5">
              <Edit3 className="w-4 h-4 text-amber-600" />
              Anotações desta Aula (Salvo no SQLite)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-stone-400 mb-3 leading-relaxed">
              Escreva notas pessoais sobre esta aula (postura correta, dicas do dedão, ou andamento do ritmo). Suas anotações são salvas de forma exclusiva e permanente no banco de dados SQLite.
            </p>
            <div className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Exemplo: Focar em curvar bem a articulação do dedo 1 no acorde C. Lembrar da batida: desce-desce-sobe-sobe..."
                className="w-full min-h-[90px] p-3 text-xs bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-stone-200"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 dark:text-stone-500">
                  {saveSuccess ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Diário de estudos atualizado no SQLite!</span>
                  ) : "Persistência em banco de dados ativo"}
                </span>
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  id="save-lesson-note-btn"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-850 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingNote ? "Salvando..." : "Salvar Notas"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-1.50 dark:border-stone-800 flex gap-4 justify-between">
          <div className="flex gap-2">
            <span className="text-xs text-slate-400 dark:text-stone-500 self-center">
              Anotado as dicas? Lembre de descansar a mão se cansar.
            </span>
          </div>

          <div className="flex gap-2">
            {activeLesson.order > 1 && (
              <button
                onClick={() => {
                  const prev = LESSON_DATABASE.find(l => l.order === activeLesson.order - 1);
                  if (prev) setActiveLesson(prev);
                }}
                id="lesson-prev-btn"
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-stone-800 text-slate-650 dark:text-stone-300 hover:bg-slate-50"
              >
                Voltar
              </button>
            )}

            {activeLesson.order < LESSON_DATABASE.length ? (
              <button
                onClick={() => completeLessonAndGoToNext(activeLesson.id)}
                id="lesson-next-btn"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white shadow"
              >
                Próxima Lição
              </button>
            ) : (
              <div className="text-xs font-medium bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 px-3.5 py-2 rounded-xl border border-emerald-200/50">
                Curso Base Finalizado! 🎉
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple Helper to handle bold (**), italic (*), etc. in inline lesson text
function formatInlineMarkdown(text: string) {
  const parts = [];
  let index = 0;

  // Let's replace simple markdown notations
  // Matches **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-bold text-amber-950 dark:text-amber-400 text-slate-900">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Returns formatted or plain text
  return parts.length > 0 ? parts : text;
}
