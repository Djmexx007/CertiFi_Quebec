import { Project } from 'ts-morph';

export async function findUnusedFiles(fileMap: Record<string, string>): Promise<string[]> {
  const project = new Project({ useInMemoryFileSystem: true });
  const fileList = Object.entries(fileMap);
  const unusedFiles: string[] = [];

  // Inject all files in memory
  for (const [path, content] of fileList) {
    project.createSourceFile(path, content);
  }

  // Get the root file usage
  const allFiles = project.getSourceFiles();
  const root = project.getSourceFile('App.tsx');
  if (!root) return [];

  const reachable = new Set<string>();
  const explore = (file: any) => {
    if (!file || reachable.has(file.getFilePath())) return;
    reachable.add(file.getFilePath());
    file.getImportDeclarations().forEach((imp: any) => {
      const resolved = imp.getModuleSpecifierSourceFile();
      if (resolved) explore(resolved);
    });
  };

  explore(root);

  for (const file of allFiles) {
    if (!reachable.has(file.getFilePath())) {
      const normalizedPath = file.getBaseName();
      unusedFiles.push(normalizedPath);
    }
  }

  return unusedFiles;
}
