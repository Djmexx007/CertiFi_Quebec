import { Project } from 'ts-morph';

export function analyzeWithTSMorph(filePath: string, content: string): string[] {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(filePath, content);
  const problems: string[] = [];

  // Vérifie l'export par défaut
  if (!sourceFile.getDefaultExportSymbol()) {
    problems.push('Aucun export default détecté.');
  }

  // Détection des fonctions non utilisées
  const functions = sourceFile.getFunctions();
  functions.forEach(fn => {
    const name = fn.getName();
    if (!name) return;
    const identifier = fn.getNameNode();
    const references = identifier.findReferences();
    const totalRefs = references.flatMap(r => r.getReferences()).length;

    if (totalRefs <= 1) {
      problems.push(`Fonction non utilisée : ${name}()`);
    }
  });

  // Détection des imports inutilisés
  const imports = sourceFile.getImportDeclarations();
  imports.forEach(imp => {
    imp.getNamedImports().forEach(namedImp => {
      const nameNode = namedImp.getNameNode();
      const references = nameNode.findReferences();
      const totalRefs = references.flatMap(r => r.getReferences()).length;

      if (totalRefs <= 1) {
        problems.push(`Import inutilisé : ${namedImp.getName()}`);
      }
    });
  });

  return problems;
}
