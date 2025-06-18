import { ElementType } from 'react';

export interface Choice {
  text: string;
  correct: boolean;
  explanation: string;
}

export interface Question {
  question: string;
  choices: Choice[];
}

export interface MiniGame {
  type: string;
  title: string;
  description: string;
  rewards: {
    xp: number;
    badge: string;
    title: string;
  };
}

export interface Boss {
  name: string;
  description: string;
  difficulty: number;
  rewards: {
    xp: number;
    badge: string;
    title: string;
  };
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  quiz?: Question[];
  minigame?: MiniGame;
  boss?: Boss;
}

// Default values for optional properties
export const defaultChapter: Partial<Chapter> = {
  quiz: [],
  minigame: undefined,
  boss: undefined
};

// Helper function to ensure chapter has all required properties
export function createChapter(chapter: Partial<Chapter>): Chapter {
  return {
    id: chapter.id || '',
    title: chapter.title || '',
    summary: chapter.summary || '',
    quiz: chapter.quiz || defaultChapter.quiz,
    minigame: chapter.minigame,
    boss: chapter.boss
  };
}