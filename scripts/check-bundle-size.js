import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const DIST_ASSETS_DIR = 'dist/assets';
const SIZE_LIMIT_BYTES = 500 * 1024; // 500 KB

let totalBytes = 0;

try {
  const files = readdirSync(DIST_ASSETS_DIR);

  for (const file of files) {
    if (extname(file) === '.js') {
      const filePath = join(DIST_ASSETS_DIR, file);
      const { size } = statSync(filePath);
      totalBytes += size;
    }
  }
} catch (err) {
  console.error(`Error reading ${DIST_ASSETS_DIR}:`, err.message);
  process.exit(1);
}

const totalKB = (totalBytes / 1024).toFixed(2);
const limitKB = (SIZE_LIMIT_BYTES / 1024).toFixed(2);

if (totalBytes > SIZE_LIMIT_BYTES) {
  console.error(
    `Bundle size check FAILED: total JS size is ${totalKB} KB, which exceeds the limit of ${limitKB} KB.`
  );
  process.exit(1);
}

console.log(
  `Bundle size check passed: total JS size is ${totalKB} KB (limit: ${limitKB} KB).`
);
