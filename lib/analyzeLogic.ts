export interface LogicWarning {
  file: string;
  warning: string;
  solution?: string;
}

export function analyzeLogic(file: string, content: string): LogicWarning[] {
  const warnings: LogicWarning[] = [];

  // Hook useState sans import
  if (content.includes('useState') && !/import\s+\{\s*useState\s*\}/.test(content)) {
    warnings.push({
      file,
      warning: "Hook 'useState' utilisé sans être importé.",
      solution: "Ajoutez : import { useState } from 'react';"
    });
  }

  // Hook useEffect sans import
  if (content.includes('useEffect') && !/import\s+\{\s*useEffect\s*\}/.test(content)) {
    warnings.push({
      file,
      warning: "Hook 'useEffect' utilisé sans être importé.",
      solution: "Ajoutez : import { useEffect } from 'react';"
    });
  }

  // JSX sans return
  if (/<[a-zA-Z]/.test(content) && !/return\s*\(/.test(content)) {
    warnings.push({
      file,
      warning: "JSX détecté sans return().",
      solution: "Ajoutez return (...) dans votre composant pour afficher le JSX."
    });
  }

  // export default manquant (en plus de AST)
  if (/function\s+[A-Z]/.test(content) && !/export\s+default/.test(content)) {
    warnings.push({
      file,
      warning: "Composant sans export default.",
      solution: "Ajoutez 'export default MonComposant;' à la fin du fichier."
    });
  }

  // Import inutilisé (simple détecteur)
  const importMatches = content.match(/import\s+\{?(.+?)\}?\s+from/g);
  if (importMatches) {
    importMatches.forEach((imp) => {
      const importedVars = imp.match(/\{(.+)\}/);
      if (importedVars) {
        importedVars[1]
          .split(',')
          .map((v) => v.trim())
          .forEach((v) => {
            if (!new RegExp(`\\b${v}\\b`).test(content.split(imp).pop() ?? '')) {
              warnings.push({
                file,
                warning: `Import inutilisé : ${v}`,
                solution: `Supprimez ${v} de vos imports.`
              });
            }
          });
      }
    });
  }

  return warnings;
}
