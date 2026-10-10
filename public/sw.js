self.addEventListener('push', function (event) {
  if (event.data) {
    let data = {}
    try {
      data = event.data.json()
    } catch (e) {
      data = {
        title: 'New Notification',
        message: event.data.text()
      }
    }

    const title = data.title || 'New Notification'
    const options = {
      body: data.message || data.body || 'You have a new message.',
      icon: '/logo.png',
      badge: '/favicon.png',
      data: {
        url: data.url || data.actionPath || '/admin/notifications'
      }
    }

    event.waitUntil(self.registration.showNotification(title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const urlToOpen = event.notification.data.url

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        // If so, just focus it.
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Caching is disabled — service worker is kept active for push notifications only
self.addEventListener('install', function (event) {
  // No caching — skip waiting immediately so this SW activates right away
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function (event) {
  // Clear ALL previously stored caches from earlier versions
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(cacheNames.map(function (cacheName) {
        return caches.delete(cacheName)
      }))
    }).then(function () {
      return self.clients.claim()
    })
  )
})

// Network-only fetch handler — no caching, all requests go directly to the network
// The fetch event listener is intentionally omitted so the browser handles requests natively

