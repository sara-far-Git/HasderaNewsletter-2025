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
// יש functions ב-hasdera-frontend/functions וגם ב-../functions
// נעתיק את שניהם - קודם מ-hasdera-frontend/functions (עדיפות), ואז נשלים מ-../functions
const FUNCTIONS_SOURCE_LOCAL = path.join(ROOT, 'functions'); // hasdera-frontend/functions
const FUNCTIONS_SOURCE_ROOT = path.resolve(ROOT, '..', 'functions'); // HasderaNewsletter-2025/functions
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
  // קודם נעתיק מ-hasdera-frontend/functions (אם קיים)
  if (await exists(FUNCTIONS_SOURCE_LOCAL)) {
    await fs.rm(FUNCTIONS_TARGET, { recursive: true, force: true });
    await copyDir(FUNCTIONS_SOURCE_LOCAL, FUNCTIONS_TARGET);
    console.log('sync-dists: copied functions from hasdera-frontend/functions to dist/functions');
  }
  // ואז נשלים מ-../functions (אם קיים) - רק קבצים שלא קיימים
  if (await exists(FUNCTIONS_SOURCE_ROOT)) {
    if (!(await exists(FUNCTIONS_TARGET))) {
      await fs.mkdir(FUNCTIONS_TARGET, { recursive: true });
    }
    // העתק רק קבצים/תיקיות שלא קיימים כבר
    const rootEntries = await fs.readdir(FUNCTIONS_SOURCE_ROOT, { withFileTypes: true });
    for (const entry of rootEntries) {
      const srcPath = path.join(FUNCTIONS_SOURCE_ROOT, entry.name);
      const dstPath = path.join(FUNCTIONS_TARGET, entry.name);
      if (!(await exists(dstPath))) {
        if (entry.isDirectory()) {
          await copyDir(srcPath, dstPath);
        } else {
          await fs.copyFile(srcPath, dstPath);
        }
        console.log(`sync-dists: copied ${entry.name} from ../functions to dist/functions`);
      }
    }
  }

  for (const target of TARGETS) {
    await fs.rm(target, { recursive: true, force: true });
    await copyDir(SOURCE, target);
  }

  console.log(`sync-dists: copied dist -> ${TARGETS.map(t => path.basename(t)).join(', ')}`);
}

await main();
