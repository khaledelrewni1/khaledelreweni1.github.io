// ده ملف الخدمة اللي بيستقبل الإشعارات حتى لو الموقع مقفول
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// بيانات مشروعك من Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCNxv8rljPPLks03giwrjrIv018MdZkSoM",
  authDomain: "jadwal-app-12d0c.firebaseapp.com",
  projectId: "jadwal-app-12d0c",
  storageBucket: "jadwal-app-12d0c.firebasestorage.app",
  messagingSenderId: "599880482581",
  appId: "1:599880482581:web:21d65c1aacfa68b83d331c",
  measurementId: "G-LM8SPG04XK"
});

// استقبال الإشعار لما الصفحة تكون مقفولة
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📩 إشعار في الخلفية:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/favicon.png' // لو عندك أيقونة للموقع
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

