// skriv — the writing desk for ferreirademelo.com
//
// A dependency-free local server: write a note, watch the REAL site render
// it (live iframe of `astro dev`), press Publicera and it is committed,
// pushed to main and followed all the way to "live" via the GitHub Actions
// run. The draft is just a file with `draft: true`; git is the publish
// boundary. Binds to 127.0.0.1 only.
//
//   npm run skriv   →   http://127.0.0.1:4499

import http from 'node:http';
import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const NOTES_DIR = path.join(ROOT, 'src', 'content', 'notes');
const BLOG_DIR = path.join(ROOT, 'public', 'blog');
const PORT = 4499;
const DEV_PORT = 4321;
const DEV_URL = `http://127.0.0.1:${DEV_PORT}`;

// ---------------------------------------------------------------- helpers

function git(args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: ROOT, timeout: 60_000 }, (err, stdout, stderr) => {
      if (err) reject(new Error((stderr || stdout || err.message).trim()));
      else resolve(stdout.trim());
    });
  });
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function noteFile(slug) {
  if (!SLUG_RE.test(slug)) throw new Error(`Bad slug: ${slug}`);
  return path.join(NOTES_DIR, `${slug}.md`);
}

function parseNote(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    if (val.startsWith('[')) {
      try { val = JSON.parse(val.replace(/'/g, '"')); } catch { /* keep raw */ }
    } else if (val === 'true' || val === 'false') {
      val = val === 'true';
    } else if (/^\d+$/.test(val)) {
      val = Number(val);
    } else {
      val = val.replace(/^["']|["']$/g, '');
    }
    fm[key] = val;
  }
  return { fm, body: m[2].replace(/^\r?\n/, '') };
}

function serializeNote(fm, body) {
  const q = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  const lines = ['---'];
  lines.push(`title: ${q(fm.title)}`);
  lines.push(`description: ${q(fm.description)}`);
  lines.push(`pubDate: ${fm.pubDate}`);
  lines.push(`slug: ${q(fm.slug)}`);
  lines.push(`lang: ${q(fm.lang || 'en')}`);
  if (fm.image) lines.push(`image: ${q(fm.image)}`);
  lines.push(`ai: ${q(fm.ai || 'none')}`);
  if (fm.tools?.length) lines.push(`tools: ${JSON.stringify(fm.tools)}`);
  if (fm.revisions) lines.push(`revisions: ${fm.revisions}`);
  if (fm.draft) lines.push('draft: true');
  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}

function blogDirFor(fm) {
  const ymd = String(fm.pubDate).replaceAll('-', '').slice(2); // YYMMDD
  return `${ymd}_${String(fm.slug).replaceAll('-', '_')}`;
}

async function fileGitState(relPath) {
  const out = await git(['status', '--porcelain', '--', relPath]).catch(() => '');
  if (!out) return 'clean';
  const code = out.slice(0, 2);
  return code.includes('?') ? 'new' : 'modified';
}

// ------------------------------------------------------------- dev server

let devChild = null;

function probe(url) {
  return new Promise((resolve) => {
    http.get(url, { timeout: 2000 }, (res) => { res.resume(); resolve(true); })
      .on('error', () => resolve(false))
      .on('timeout', function () { this.destroy(); resolve(false); });
  });
}

async function ensureDevServer() {
  if (await probe(DEV_URL)) return { url: DEV_URL, spawned: false };
  if (!devChild) {
    devChild = spawn('npx', ['astro', 'dev', '--port', String(DEV_PORT)], {
      cwd: ROOT, stdio: 'ignore', detached: false,
    });
    devChild.on('exit', () => { devChild = null; });
  }
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await probe(DEV_URL)) return { url: DEV_URL, spawned: true };
  }
  throw new Error('astro dev did not come up on :4321 within 60 s');
}

process.on('exit', () => { if (devChild) devChild.kill(); });
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// ---------------------------------------------------------------- publish

// The button's contract is "it's live", not "it's pushed": after the push
// we follow the GitHub Actions run for that exact commit to its conclusion.
const publishState = { running: false, steps: [], error: null, liveUrl: null, runUrl: null };

function step(id, label) {
  const s = { id, label, status: 'pending' };
  publishState.steps.push(s);
  return s;
}

async function repoSlug() {
  const url = await git(['remote', 'get-url', 'origin']);
  const m = url.match(/[/:]([^/]+\/[^/]+?)(\.git)?$/);
  if (!m) throw new Error(`Cannot parse origin remote: ${url}`);
  return m[1];
}

async function runPublish(slug) {
  publishState.running = true;
  publishState.steps = [];
  publishState.error = null;
  publishState.liveUrl = null;
  publishState.runUrl = null;

  const file = noteFile(slug);
  const relFile = path.relative(ROOT, file);
  let flipped = false;
  let raw, parsed;

  const fail = (s, msg) => { s.status = 'failed'; publishState.error = msg; publishState.running = false; };

  // 1 · validate ------------------------------------------------------
  let s = step('validate', 'granska · validate');
  try {
    raw = fs.readFileSync(file, 'utf8');
    parsed = parseNote(raw);
    for (const k of ['title', 'description', 'pubDate', 'slug']) {
      if (!parsed.fm[k]) throw new Error(`Missing frontmatter: ${k}`);
    }
    if (parsed.fm.slug !== slug) throw new Error(`Slug mismatch: file ${slug} vs frontmatter ${parsed.fm.slug}`);
    if (!parsed.body.trim()) throw new Error('The note has no body.');
    s.status = 'done';
  } catch (e) { return fail(s, e.message); }

  // 2 · branch --------------------------------------------------------
  s = step('branch', 'gren · branch check');
  try {
    const branch = await git(['rev-parse', '--abbrev-ref', 'HEAD']);
    if (branch !== 'main') {
      throw new Error(`You're on branch "${branch}". Publishing happens from main. Run: git checkout main`);
    }
    s.status = 'done';
  } catch (e) { return fail(s, e.message); }

  // 3 · fetch (proves network + auth before anything is touched) ------
  s = step('fetch', 'hämta · fetch origin');
  try {
    await git(['fetch', 'origin']);
    s.status = 'done';
  } catch (e) {
    return fail(s, `GitHub didn't accept the connection. Check your network, or run: gh auth login — then publish again. (${e.message})`);
  }

  // 4 · flip draft off + bump revisions on republish -------------------
  s = step('flip', 'utkast av · finalize');
  try {
    const wasPublished = !parsed.fm.draft;
    if (wasPublished) parsed.fm.revisions = (parsed.fm.revisions || 0) + 1;
    parsed.fm.draft = false;
    fs.writeFileSync(file, serializeNote({ ...parsed.fm, draft: false }, parsed.body));
    flipped = true;
    s.status = 'done';
  } catch (e) { return fail(s, e.message); }

  const restoreDraft = () => {
    if (flipped) fs.writeFileSync(file, raw); // the exact pre-publish bytes
  };

  // 5 · rebase ---------------------------------------------------------
  s = step('rebase', 'synka · pull --rebase');
  try {
    await git(['pull', '--rebase', 'origin', 'main']);
    s.status = 'done';
  } catch (e) {
    await git(['rebase', '--abort']).catch(() => {});
    restoreDraft();
    return fail(s, 'The site was changed on GitHub in a way that clashes with your local copy. Your note is safe on disk; nothing was published.');
  }

  // 6 · add (scoped paths only, never -A) ------------------------------
  s = step('add', 'lägg till · stage');
  try {
    const paths = [relFile];
    const imgDir = path.join('public', 'blog', blogDirFor(parsed.fm));
    if (fs.existsSync(path.join(ROOT, imgDir))) paths.push(imgDir);
    await git(['add', '--', ...paths]);
    s.status = 'done';
  } catch (e) { restoreDraft(); return fail(s, e.message); }

  // 7 · commit ---------------------------------------------------------
  s = step('commit', 'commit');
  try {
    await git(['commit', '-m', `note: ${parsed.fm.title}`]);
    s.status = 'done';
  } catch (e) {
    restoreDraft();
    return fail(s, /nothing to commit/i.test(e.message)
      ? 'Nothing changed since the last publish.'
      : e.message);
  }

  // 8 · push -----------------------------------------------------------
  s = step('push', 'push origin main');
  try {
    await git(['push', 'origin', 'main']);
    s.status = 'done';
  } catch (e) {
    return fail(s, `Committed locally but GitHub rejected the push. Publish again to retry, or run: git push (${e.message})`);
  }

  // 9 · follow the Actions run to "live" -------------------------------
  s = step('ci', 'bygger · site is building');
  try {
    const sha = await git(['rev-parse', 'HEAD']);
    const repo = await repoSlug();
    const deadline = Date.now() + 6 * 60_000;
    let conclusion = null;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await fetch(
        `https://api.github.com/repos/${repo}/actions/runs?head_sha=${sha}`,
        { headers: { accept: 'application/vnd.github+json', 'user-agent': 'skriv' } },
      ).catch(() => null);
      if (!res || !res.ok) continue;
      const data = await res.json();
      const run = (data.workflow_runs || [])[0];
      if (!run) continue;
      publishState.runUrl = run.html_url;
      if (run.status === 'completed') { conclusion = run.conclusion; break; }
    }
    if (conclusion === 'success') {
      s.status = 'done';
      publishState.liveUrl = `https://www.ferreirademelo.com/notes/${slug}/`;
    } else if (conclusion) {
      throw new Error(`The build failed — the previous version of the site is still live, nothing is broken. Open the log: ${publishState.runUrl}`);
    } else {
      throw new Error(`Timed out waiting for the build. Check: ${publishState.runUrl || 'the repository Actions tab'}`);
    }
  } catch (e) { return fail(s, e.message); }

  publishState.running = false;
}

// ------------------------------------------------------------------ http

function json(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 30 * 1024 * 1024) { reject(new Error('too large')); req.destroy(); }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const route = `${req.method} ${url.pathname}`;
  try {
    if (route === 'GET /') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(ROOT, 'tools', 'skriv', 'app.html')));

    } else if (route === 'GET /api/state') {
      const branch = await git(['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => '?');
      const files = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith('.md'));
      const notes = [];
      for (const f of files) {
        const { fm } = parseNote(fs.readFileSync(path.join(NOTES_DIR, f), 'utf8'));
        notes.push({
          slug: f.replace(/\.md$/, ''),
          title: fm.title || f,
          pubDate: String(fm.pubDate || ''),
          lang: fm.lang || 'en',
          draft: !!fm.draft,
          git: await fileGitState(path.join('src', 'content', 'notes', f)),
        });
      }
      notes.sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));
      json(res, 200, { branch, notes, devUrl: DEV_URL });

    } else if (route.startsWith('GET /api/note/')) {
      const slug = url.pathname.split('/').pop();
      const { fm, body } = parseNote(fs.readFileSync(noteFile(slug), 'utf8'));
      json(res, 200, { fm, body });

    } else if (route.startsWith('PUT /api/note/')) {
      const slug = url.pathname.split('/').pop();
      const { fm, body, prevSlug } = JSON.parse((await readBody(req)).toString());
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: 'bad slug' });
      fm.slug = slug;
      const target = noteFile(slug);
      // Keep the publish state the file already has; new files start as drafts.
      let draft = true;
      const sourceFile = prevSlug && prevSlug !== slug ? noteFile(prevSlug) : target;
      if (fs.existsSync(sourceFile)) draft = !!parseNote(fs.readFileSync(sourceFile, 'utf8')).fm.draft;
      if (prevSlug && prevSlug !== slug) {
        if (fs.existsSync(target)) return json(res, 409, { error: `${slug}.md already exists` });
        if (fs.existsSync(noteFile(prevSlug))) fs.rmSync(noteFile(prevSlug));
      }
      fs.writeFileSync(target, serializeNote({ ...fm, draft }, body));
      json(res, 200, { ok: true, draft });

    } else if (route.startsWith('POST /api/image/')) {
      const slug = url.pathname.split('/').pop();
      const name = (url.searchParams.get('name') || 'image.png').replace(/[^\w.-]/g, '_');
      const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
      const dir = blogDirFor({ pubDate: date, slug });
      const abs = path.join(BLOG_DIR, dir);
      fs.mkdirSync(abs, { recursive: true });
      fs.writeFileSync(path.join(abs, name), await readBody(req));
      json(res, 200, { path: `/blog/${dir}/${name}` });

    } else if (route.startsWith('POST /api/publish/')) {
      if (publishState.running) return json(res, 409, { error: 'a publish is already running' });
      const slug = url.pathname.split('/').pop();
      runPublish(slug); // async; progress via /api/publish/status
      json(res, 200, { ok: true });

    } else if (route === 'GET /api/publish/status') {
      json(res, 200, publishState);

    } else if (route === 'GET /api/dev') {
      json(res, 200, await ensureDevServer());

    } else {
      json(res, 404, { error: 'not found' });
    }
  } catch (e) {
    json(res, 500, { error: e.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  skriv — the writing desk`);
  console.log(`  editor   http://127.0.0.1:${PORT}`);
  console.log(`  preview  ${DEV_URL} (started on demand)\n`);
});
