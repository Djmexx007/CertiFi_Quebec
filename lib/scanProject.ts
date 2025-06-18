// lib/scanProject.ts
export async function scanTSXFiles(): Promise<string[]> {
  const files = import.meta.glob(['../components/**/*.tsx', '../app/**/*.tsx', '../tests/**/*.tsx'], { eager: false });
  return Object.keys(files).map((path) => path.replace('../', ''));
}
