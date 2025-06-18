// /src/hooks/useGameProgress.ts

import { ChapterModule } from '@/types/chapter';

export function calculateProgressFromModules(
  modules: ChapterModule[],
  completedChapters: string[] = []
) {
  let totalChapters = 0;
  let completed = 0;

  for (const module of modules) {
    for (const chapter of module.chapters) {
      totalChapters++;
      if (completedChapters.includes(chapter.id)) {
        completed++;
      }
    }
  }

  return {
    completed,
    totalChapters,
    percentage: totalChapters === 0 ? 0 : Math.round((completed / totalChapters) * 100),
  };
}

