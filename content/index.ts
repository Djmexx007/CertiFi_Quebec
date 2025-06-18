import { assuranceMaladie } from './assurance-maladie';
import { assuranceVie } from './assurance-vie';
import { deontologie } from './deontologie';
import { fondsDistincts } from './fonds-distincts';

export interface Chapter {
  id: number;
  title: string;
  content: string;
  summary: string;
}

export interface Module {
  id: number;
  name: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

export const modules: Module[] = [
  assuranceMaladie,
  assuranceVie,
  fondsDistincts,
  deontologie
];