interface User {
  nickname: string | null;
}

interface Archetype {
  name: string| null;
}

export interface Deck {
  id: string;
  name: string;
  imagen: string;
  cards: string;
  likesCount: number;
  createdAt: Date;
  user: User;
  archetype: Archetype;
}