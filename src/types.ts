export interface Chord {
  name: string;
  frets: (number | "x")[]; // from 6th (E) on index 0 to 1st (e) on index 5
  fingers: (number | null)[]; // finger for each fret position (1=indicator, 2=middle, 3=ring, 4=little)
  baseFret: number; // usually 1
  barre?: {
    fret: number;
    startString: number; // 0 to 5
    endString: number; // 0 to 5
  };
  altName?: string;
  usageTip: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: "anatomy" | "posture" | "technique" | "theory";
  description: string;
  contentMarkdown: string;
  order: number;
}

export interface SongLine {
  chords: { chord: string; position: number }[];
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  rhythm: string;
  strummingPattern: string[]; // ['down', 'down', 'up', 'up', 'down']
  chordsUsed: string[];
  lines: SongLine[];
  videoTip?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UserSession {
  username: string;
  email: string;
  joinedAt: string;
}

