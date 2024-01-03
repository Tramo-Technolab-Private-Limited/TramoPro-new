importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);


//the Firebase config object
const firebaseConfig = {
  apiKey:'AIzaSyBI6pmdUHM2FsLY8_NAj5k6lt0LOMu7Zm0',
  authDomain:'tramo-pro.firebaseapp.com',
  projectId: 'tramo-pro',
  storageBucket:'tramo-pro.appspot.com',
  messagingSenderId:'668179923805',
  appId:'1:668179923805:web:cfbda8da96c2f4412edeb4',
  measurementId:'G-HCEQD6WCSJ',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
