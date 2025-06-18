// src/lib/__filesMap.ts

export const files: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob(
      ['../components/**/*.tsx', '../app/**/*.tsx', '../pages/**/*.tsx', './**/*.tsx'],
      { as: 'raw', eager: true }
    )
  ).map(([path, content]) => {
    const cleanPath = path.replace(/^(\.\.\/)+/, ''); // Nettoie ../
    return [cleanPath, content as string];
  })
);
