import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SOURCE = path.join(ROOT, 'dist');
const TARGETS = [
  path.join(ROOT, 'dist-admin'),
  path.join(ROOT, 'dist-advertiser'),
  path.join(ROOT, 'dist-reader'),
];

// העתקת functions מ-root ל-dist (לצורך Cloudflare Pages)
// ROOT הוא hasdera-frontend, אז functions נמצא ב-../functions
const FUNCTIONS_SOURCE = path.resolve(ROOT, '..', 'functions');
const FUNCTIONS_TARGET = path.join(SOURCE, 'functions');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const from = path.join(src, entry.name);
      const to = path.join(dst, entry.name);
      if (entry.isDirectory()) {
        await copyDir(from, to);
      } else if (entry.isSymbolicLink()) {
        const link = await fs.readlink(from);
        await fs.symlink(link, to);
      } else {
        await fs.copyFile(from, to);
      }
    })
  );
}

async function main() {
  if (!(await exists(SOURCE))) {
    console.error('sync-dists: missing dist/. Run build first.');
    process.exit(1);
  }

  // העתקת functions ל-dist (לצורך Cloudflare Pages)
  if (await exists(FUNCTIONS_SOURCE)) {
    await fs.rm(FUNCTIONS_TARGET, { recursive: true, force: true });
    await copyDir(FUNCTIONS_SOURCE, FUNCTIONS_TARGET);
    console.log('sync-dists: copied functions to dist/functions');
  }

  for (const target of TARGETS) {
    await fs.rm(target, { recursive: true, force: true });
    await copyDir(SOURCE, target);
  }

  console.log(`sync-dists: copied dist -> ${TARGETS.map(t => path.basename(t)).join(', ')}`);
}

await main();
