// 🔔 每次你更新網頁內容或版本號時，請同步修改這個快取名稱（例如改為 v2.5.1）
const CACHE_NAME = 'travel-accounting-v2.5.0'; 

// 需要快取的靜態核心檔案
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'manifest.json',
    'icon.png'
];

// 1. 安裝事件 (Install)：將核心檔案存入手機快取
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] 正在預先快取核心檔案...');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            // 強制讓新的 Service Worker 跳過等待，立即進入啟用狀態
            return self.skipWaiting();
        })
    );
});

// 2. 啟用事件 (Activate)：刪除舊版本的快取，釋放手機空間
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] 偵測到新版本，正在刪除舊快取:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            // 讓新 Service Worker 立即取得網頁控制權
            return self.clients.claim();
        })
    );
});

// 3. 攔截請求 (Fetch)：採用「網路優先」策略
// 有網路時絕對拿最新網頁，沒網路時（如飛機上）自動開啟快取確保能離線記帳
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request).catch(() => {
            // 當網路斷線或失敗時，改從快取拿檔案
            return caches.match(event.request);
        })
    );
});