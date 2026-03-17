import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, '../dist/index.html');

try {
  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Replace <script type="module" crossorigin src="..."> with <script defer src="...">
  html = html.replace(/<script type="module" crossorigin/g, '<script defer');
  html = html.replace(/<script type="module"/g, '<script defer');
  
  // Remove crossorigin from link tags as well, just in case
  html = html.replace(/<link rel="stylesheet" crossorigin/g, '<link rel="stylesheet"');

  fs.writeFileSync(htmlPath, html);
  console.log('Successfully removed type="module" from dist/index.html');
} catch (err) {
  console.error('Error fixing index.html:', err);
  process.exit(1);
}
