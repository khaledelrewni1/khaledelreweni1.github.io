// Import Firebase SDKs
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your web app's Firebase configuration (نفس اللي في index.html)
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
try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  console.log('Firebase Messaging initialized in SW');
} catch (error) {
  console.error('Error initializing Firebase in SW:', error);
}

// Handle background messages (عرض الإشعار في الخلفية - حتى لو الصفحة مغلقة)
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  
  // استخراج البيانات من الإشعار (يمكن تخصيصها لمحاضرة معينة)
  const notificationTitle = payload.notification?.title || 'تحديث جدول المحاضرات!';
  const notificationBody = payload.notification?.body || 'افتح التطبيق لرؤية التغييرات.';
  const clickAction = payload.data?.url || window.location.origin;  // رابط مخصص إذا أرسلت data.url في الإشعار

  const notificationOptions = {
    body: notificationBody,
    icon: '/icons/favicon.png',  // أيقونة الإشعار (تأكد إنها موجودة في root)
    badge: '/icons/favicon.png',  // استخدم نفس الـ favicon للـ badge
    vibrate: [100, 50, 100],      // اهتزاز الهاتف (للموبايل)
    data: { url: clickAction },   // رابط لفتح الصفحة عند الضغط (يمكن إضافة ?lecture=ID لمحاضرة محددة)
    actions: [                    // أزرار إضافية في الإشعار (اختياري)
      { action: 'open', title: 'افتح الجدول' },
      { action: 'dismiss', title: 'تجاهل' }
    ]
  };

  // عرض الإشعار
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click (فتح الصفحة عند الضغط على الإشعار)
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked: ', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';  // استخدم الرابط المرسل في data

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // إذا الصفحة مفتوحة بالفعل، ركز عليها
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // إلا افتح تب جديد
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification button clicks (للأزرار الإضافية مثل "افتح" أو "تجاهل")
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed: ', event);
});

self.addEventListener('notificationclick', (event) => {
  if (event.action === 'open') {
    // نفس اللي فوق، بس للزر "افتح"
    event.notification.close();
    clients.openWindow(event.notification.data.url || '/');
  } else if (event.action === 'dismiss') {
    event.notification.close();
  }
});
