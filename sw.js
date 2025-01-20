const CACHE_NAME = 'tictactoe-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css?family=Raleway:400,700',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.4.0/animate.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});