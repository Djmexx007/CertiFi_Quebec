import { Chapter } from '@/types/chapter';
import { chapter1 } from './chapitre1';
import { chapter2 } from './chapitre2';
import { chapter3 } from './chapitre3';
import { chapter4 } from './chapitre4';
import { chapter5 } from './chapitre5';
import { chapter6 } from './chapitre6';
import { chapter7 } from './chapitre7';

export const deontologie = {
  id: 4,
  name: "Deonto",
  title: "La Citadelle Déontologique",
  description: "Affrontez les défis de la déontologie",
  chapters: [
    chapter1,
    chapter2,
    chapter3,
    chapter4,
    chapter5,
    chapter6,
    chapter7
  ]
};