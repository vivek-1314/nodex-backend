const admin = require("firebase-admin");
const serviceAccount = require("../backend/config/firebasebackendconfig.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "nodex-de76d.appspot.com",
});

module.exports = admin;
