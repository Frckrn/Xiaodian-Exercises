/* 小点刷题 service worker
 * Bump CACHE_VERSION whenever the app shell changes so installed clients
 * receive the new HTML, CSS, JavaScript and icons.
 */
const CACHE_VERSION = "v3";
const CACHE_NAME = `xiaodian-shell-${CACHE_VERSION}`;
const APP_SCOPE = new URL("./", self.location.href).href;
const INDEX_URL = new URL("index.html", APP_SCOPE).href;

const PRECACHE_PATHS = [
  "index.html",
  "styles.css",
  "js/xlsx-reader.js",
  "js/app.js",
  "manifest.webmanifest",
  "assets/favicon.svg",
  "assets/icons/apple-touch-icon-180.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/question-bank-template.xlsx",
];

const PRECACHE_URLS = PRECACHE_PATHS.map((path) => new URL(path, APP_SCOPE).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("xiaodian-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function cacheResponse(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    await cacheResponse(request, response);
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = (await cache.match(INDEX_URL)) || (await cache.match(APP_SCOPE));
    if (cached) return cached;
    return new Response(
      "<!doctype html><html lang=\"zh-CN\"><meta charset=\"utf-8\"><title>小点刷题</title><body style=\"font-family:sans-serif;padding:40px;line-height:1.8;color:#1f2d27;background:#f4f0e7\"><h1>暂时无法打开</h1><p>请先联网访问一次本页面，之后再离线使用。</p></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 }
    );
  }
}

async function handleAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    await cacheResponse(request, response);
    return response;
  } catch (error) {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(handleAsset(request));
});
