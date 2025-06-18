import fs from 'fs/promises'; // ✅ Utilise la bonne API

export const autofixAll = async (files: Record<string, string>) => {
  const fixedFiles: Record<string, string> = {};

  for (const [path, content] of Object.entries(files)) {
    let updated = content;

    if (!updated.includes('export default')) {
      updated += '\n\nexport default function MonComposant() { return <div />; }';
    }

    if (updated.includes('useState') && !updated.includes("import { useState")) {
      updated = `import { useState } from 'react';\n` + updated;
    }

    if (updated.includes('useEffect') && !updated.includes("import { useEffect")) {
      updated = `import { useEffect } from 'react';\n` + updated;
    }

    fixedFiles[path] = updated;

    try {
      await fs.writeFile(`src/${path}`, updated, 'utf-8'); // ✅ Corrige le fichier
      console.log(`✅ Fichier corrigé : src/${path}`);
    } catch (err) {
      console.error(`❌ Erreur écriture fichier : src/${path}`, err);
    }
  }

  return fixedFiles;
};
