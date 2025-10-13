// Import Firebase SDKs
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNxv8rljPPLks03giwrjrIv018MdZkSoM",
  authDomain: "jadwal-app-12d0c.firebaseapp.com",
  projectId: "jadwal-app-12d0c",
  storageBucket: "jadwal-app-12d0c.firebasestorage.app",
  messagingSenderId: "599880482581",
  appId: "1:599880482581:web:21d65c1aacfa68b83d331c",
  measurementId: "G-LM8SPG04XK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages (عرض الإشعار في الخلفية)
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/favicon.png',  // أيقونة الإشعار (أضفها في root)
    badge: '/icons/badge.png',   // badge اختياري
    vibrate: [100, 50, 100],     // اهتزاز الهاتف
    data: { url: window.location.origin }  // رابط لفتح الصفحة عند الضغط
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click (فتح الصفحة عند الضغط على الإشعار)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
