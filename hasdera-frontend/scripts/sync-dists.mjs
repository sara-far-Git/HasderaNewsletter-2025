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

// העתקת _redirects מ-public ל-dist (לצורך Cloudflare Pages)
const REDIRECTS_SOURCE = path.join(ROOT, 'public', '_redirects');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dst) {
  try {
    await fs.mkdir(dst, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    // העתקה מקבילה אבל עם הגבלה כדי לא להעמיס
    const copyPromises = entries.map(async (entry) => {
      const from = path.join(src, entry.name);
      const to = path.join(dst, entry.name);
      try {
        if (entry.isDirectory()) {
          await copyDir(from, to);
        } else {
          // רק העתקת קבצים רגילים - לא symlinks (יכול לגרום לבעיות)
          await fs.copyFile(from, to);
        }
      } catch (err) {
        console.warn(`sync-dists: warning - failed to copy ${entry.name}:`, err.message);
      }
    });
    
    await Promise.all(copyPromises);
  } catch (err) {
    console.error(`sync-dists: error copying ${src} to ${dst}:`, err.message);
    throw err;
  }
}

async function main() {
  if (!(await exists(SOURCE))) {
    console.error('sync-dists: missing dist/. Run build first.');
    process.exit(1);
  }

  // העתקת functions ל-dist (לצורך Cloudflare Pages)
  // קודם נעתיק מ-hasdera-frontend/functions (אם קיים) - זה העדיפות הגבוהה ביותר
  if (await exists(FUNCTIONS_SOURCE_LOCAL)) {
    await fs.rm(FUNCTIONS_TARGET, { recursive: true, force: true });
    await copyDir(FUNCTIONS_SOURCE_LOCAL, FUNCTIONS_TARGET);
    console.log('sync-dists: copied functions from hasdera-frontend/functions to dist/functions');
  } else if (await exists(FUNCTIONS_SOURCE_ROOT)) {
    // רק אם אין functions מקומיים, נעתיק מ-../functions
    await fs.rm(FUNCTIONS_TARGET, { recursive: true, force: true });
    await copyDir(FUNCTIONS_SOURCE_ROOT, FUNCTIONS_TARGET);
    console.log('sync-dists: copied functions from ../functions to dist/functions');
  } else {
    console.warn('sync-dists: no functions directory found - Cloudflare Functions may not work');
  }

  // העתקת dist לתיקיות יעד (רק אם צריך)
  for (const target of TARGETS) {
    if (await exists(target)) {
      await fs.rm(target, { recursive: true, force: true });
    }
    await copyDir(SOURCE, target);
  }

  // העתקת _redirects ל-dist ול-targets (לצורך Cloudflare Pages)
  // חשוב: זה צריך להיות אחרי העתקת dist כדי שה-_redirects לא יימחק
  if (await exists(REDIRECTS_SOURCE)) {
    // העתק ל-dist הראשי
    const redirectsTargetDist = path.join(SOURCE, '_redirects');
    await fs.copyFile(REDIRECTS_SOURCE, redirectsTargetDist);
    console.log('sync-dists: copied _redirects to dist/_redirects');
    
    // העתק לכל תיקיות היעד (אחרי שהעתקנו את dist)
    for (const target of TARGETS) {
      const redirectsTarget = path.join(target, '_redirects');
      await fs.copyFile(REDIRECTS_SOURCE, redirectsTarget);
      console.log(`sync-dists: copied _redirects to ${path.basename(target)}/_redirects`);
    }
  } else {
    console.warn('sync-dists: _redirects file not found in public/ - redirects may not work');
  }

  console.log(`sync-dists: copied dist -> ${TARGETS.map(t => path.basename(t)).join(', ')}`);
  console.log('sync-dists: done');
}

await main();
