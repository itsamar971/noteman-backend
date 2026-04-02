import fs from 'fs';
import path from 'path';

export function getBuildPath(): string {
  // Check possible build paths in order of preference
  const possiblePaths = [
    path.resolve(process.cwd(), 'dist/client'),
    path.resolve(process.cwd(), 'dist/public'), 
    path.resolve(process.cwd(), 'dist')
  ];
  
  for (const buildPath of possiblePaths) {
    if (fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, 'index.html'))) {
      console.log(`Found build path: ${buildPath}`);
      return buildPath;
    }
  }
  
  // Default fallback
  console.warn('Could not find build path, using default');
  return path.resolve(process.cwd(), 'dist/public');
}