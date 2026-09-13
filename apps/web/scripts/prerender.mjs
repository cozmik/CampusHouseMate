import { createServer } from "node:http";
import { readFile, stat, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = resolve(__dirname, "../dist");
const PUBLIC = resolve(__dirname, "../public");
const HOST = "127.0.0.1";
const PORT = Number(process.env.PRERENDER_PORT || 4174);
const SITE_URL = (process.env.SITE_URL || "https://housemates.ng").replace(/\/$/, "");
const ORIGIN = `http://${HOST}:${PORT}`;

const ROUTES = ["/", "/browse", "/post", "/login", "/signup", "/terms", "/privacy"];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function contentType(path) {
  return MIME[extname(path).toLowerCase()] || "application/octet-stream";
}

async function startServer() {
  const server = createServer(async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, ORIGIN).pathname);
    } catch {
      urlPath = "/";
    }
    if (urlPath.endsWith("/") && urlPath !== "/") urlPath = urlPath.slice(0, -1);

    let filePath = join(DIST, urlPath === "/" ? "index.html" : urlPath);
    if (!filePath.startsWith(DIST)) filePath = join(DIST, "index.html");
    try {
      const st = await stat(filePath);
      if (st.isDirectory()) filePath = join(filePath, "index.html");
      const body = await readFile(filePath);
      res.writeHead(200, {
        "Content-Type": contentType(filePath),
        "Cache-Control": "no-store",
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      try {
        const body = await readFile(join(DIST, "index.html"));
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end(req.method === "HEAD" ? undefined : body);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    }
  });
  await new Promise((resolveReady) => server.listen(PORT, HOST, resolveReady));
  return server;
}

async function waitForSeo(page) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const ok = await page.evaluate(() => {
      const c = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
      const r = document.querySelector('meta[name="robots"]')?.getAttribute("content");
      return Boolean(c && r);
    });
    if (ok) return true;
    await page.waitForTimeout(250);
  }
  return false;
}

async function prerenderPage(page, route) {
  const url = `${ORIGIN}${route}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  const ready = await waitForSeo(page);
  if (!ready) throw new Error(`SEO meta did not settle for ${route}`);
  await page.waitForLoadState("load", { timeout: 20000 }).catch(() => {});
  const extraWait = route === "/browse" ? 2500 : 900;
  await page.waitForTimeout(extraWait);

  let html = await page.content();
  html = html.replaceAll(ORIGIN, SITE_URL);

  const outDir = route === "/" ? DIST : join(DIST, route.slice(1));
  await mkdir(outDir, { recursive: true });
  const outFile = join(outDir, "index.html");
  await writeFile(outFile, html, "utf-8");
  const sizeKb = Math.round(html.length / 1024);
  console.log(`✓ ${route} -> ${outFile} (${sizeKb} kB, ready=${ready})`);
}

async function regenerateSitemap() {
  const legal = JSON.parse(await readFile(resolve(__dirname, "../src/lib/legal.json"), "utf-8"));
  const templatePath = join(PUBLIC, "sitemap.xml");
  const template = await readFile(templatePath, "utf-8");
  const sitemap = template.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${legal.lastUpdatedISO}</lastmod>`);
  await writeFile(join(DIST, "sitemap.xml"), sitemap, "utf-8");
  console.log(`✓ sitemap -> dist/sitemap.xml (lastmod ${legal.lastUpdatedISO})`);
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("dist/index.html not found. Run the web build first (pnpm build:web).");
    process.exit(1);
  }

  const server = await startServer();
  console.log(`Prerendering ${ROUTES.length} routes from ${DIST} at ${ORIGIN}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    for (const route of ROUTES) {
      await prerenderPage(page, route);
    }
    await regenerateSitemap();
  } finally {
    await browser.close();
    await new Promise((resolveClose) => server.close(resolveClose));
  }

  console.log("Prerender complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
