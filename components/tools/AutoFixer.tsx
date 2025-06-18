// components/tools/AutoFixer.tsx
import React, { useState, useEffect } from 'react';
import { files } from '../../tests/__filesMap';
import { Project, SyntaxKind } from 'ts-morph';

const AutoFixer: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const logs: string[] = [];
    const project = new Project({ useInMemoryFileSystem: true });

    Object.entries(files).forEach(([path, content]) => {
      const sourceFile = project.createSourceFile(path, content, { overwrite: true });

      // 1. S'assurer qu'on a importé React, useState, useEffect
      let hasReactImport = false;
      let hasUseState = false;
      let hasUseEffect = false;

      sourceFile.getImportDeclarations().forEach((imp) => {
        const module = imp.getModuleSpecifierValue();
        if (module === 'react') {
          hasReactImport = true;
          if (!imp.getNamedImports().some(n => n.getName() === 'useState')) {
            imp.addNamedImport('useState');
            logs.push(`🧠 Ajout de useState dans ${path}`);
          }
          if (!imp.getNamedImports().some(n => n.getName() === 'useEffect')) {
            imp.addNamedImport('useEffect');
            logs.push(`🧠 Ajout de useEffect dans ${path}`);
          }
        }
      });

      if (!hasReactImport) {
        sourceFile.addImportDeclaration({
          moduleSpecifier: 'react',
          namedImports: ['useState', 'useEffect'],
        });
        logs.push(`📦 Ajout import de React dans ${path}`);
      }

      // 2. Vérifier présence export default
      const exports = sourceFile.getExportAssignments();
      if (exports.length === 0) {
        const defaultExport = sourceFile.getFunctions().find(f => f.isDefaultExport()) ||
                              sourceFile.getVariableDeclarations().find(v => v.isDefaultExport());
        if (!defaultExport) {
          const components = sourceFile.getFunctions().concat(sourceFile.getVariableDeclarations());
          const comp = components.find(c => c.getName()?.[0] === c.getName()?.[0]?.toUpperCase());
          if (comp) {
            sourceFile.addExportDefault(comp.getName()!);
            logs.push(`✅ Ajout export default dans ${path}`);
          }
        }
      }

      // 3. Supprimer imports non utilisés
      sourceFile.getImportDeclarations().forEach(imp => {
        imp.getNamedImports().forEach(named => {
          const refCount = named.findReferencesAsNodes().length;
          if (refCount <= 1) {
            logs.push(`🧹 Import inutilisé supprimé (${named.getName()}) dans ${path}`);
            named.remove();
          }
        });
      });

      files[path] = sourceFile.getFullText();
    });

    setLog(logs);
  }, []);

  return (
    <div className="p-4 bg-black text-green-400 rounded">
      <h2 className="text-lg font-bold mb-2">✅ AutoFix terminé</h2>
      <ul className="text-sm list-disc ml-4 space-y-1">
        {log.map((entry, idx) => (
          <li key={idx}>{entry}</li>
        ))}
      </ul>
    </div>
  );
};

export default AutoFixer;
