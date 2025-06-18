// ✅ Le bon fichier : lib/analyzeCodeFiles.ts
interface CodeAnalysisResult {
  file: string;
  content: string;
  hasDefaultExport: boolean;
  errors: string[];
}

export async function analyzeCodeFiles(
  paths: string[],
  getContent: (path: string) => Promise<string>
): Promise<CodeAnalysisResult[]> {
  const results: CodeAnalysisResult[] = [];

  for (const file of paths) {
    const content = await getContent(file);
    const errors: string[] = [];
    const hasDefaultExport = /export default/.test(content);

    // Simple check for JSX return
    const hasJSX = /return\s*\(.*<.*>/.test(content);
    if (!hasJSX) {
      errors.push('Le composant semble ne pas retourner de JSX.');
    }

    // Check if useState is used but not imported
    if (/useState/.test(content) && !/import\s+\{[^}]*useState[^}]*\}\s+from\s+'react'/.test(content)) {
      errors.push('useState est utilisé mais non importé depuis React.');
    }

    // Check if useEffect is used but not imported
    if (/useEffect/.test(content) && !/import\s+\{[^}]*useEffect[^}]*\}\s+from\s+'react'/.test(content)) {
      errors.push('useEffect est utilisé mais non importé depuis React.');
    }

    results.push({
      file,
      content,
      hasDefaultExport,
      errors
    });
  }

  return results;
}
