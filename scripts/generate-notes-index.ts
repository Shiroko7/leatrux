import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { writeFileSync } from 'fs';

const NOTES_DIR = join(process.cwd(), 'static/Public');

function getNotes(): Array<{ path: string; content: string }> {
  const traverse = (dir: string): Array<{ path: string; content: string }> => {
    return readdirSync(dir).flatMap(file => {
      const path = join(dir, file);
      if (statSync(path).isDirectory()) {
        return traverse(path);
      } else if (path.endsWith('.md')) {
        return [{
          path: path.replace(NOTES_DIR, '').replace(/\\/g, '/'),
          content: readFileSync(path, 'utf-8')
        }];
      }
      return [];
    });
  };

  return traverse(NOTES_DIR);
}

function main() {
  const notes = getNotes();
  writeFileSync('static/notes-index.json', JSON.stringify(notes));
  console.log(`Indexed ${notes.length} notes`);
}

main();
