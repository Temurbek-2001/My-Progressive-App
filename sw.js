// Enhanced Service Worker with better caching strategy
const CACHE_NAME = 'tictactoe-v1';
const DYNAMIC_CACHE = 'tictactoe-dynamic-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/default-profile.png',
    'https://fonts.googleapis.com/css?family=Raleway:400,700',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.4.0/animate.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min.js'
];

// Cache static assets during installation
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                    .map(name => caches.delete(name))
            );
        })
    );
});

// Enhanced fetch event handler with network-first strategy for dynamic content
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                const networkFetch = fetch(event.request).then(response => {
                    // Cache successful responses in the dynamic cache
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                }).catch(() => {
                    // Return cached response if network fails
                    return cachedResponse;
                });

                // Return cached response or wait for network
                return cachedResponse || networkFetch;
            })
    );
});