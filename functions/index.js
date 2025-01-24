const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

const { defineSecret } = require("firebase-functions/params");
const { Timestamp } = require("firebase-admin/firestore");
const intasendApiKey = defineSecret("INTASEND_SECRET_API_KEY");

admin.initializeApp();
const db = admin.firestore();

exports.createUserDocument = functions
  .runWith({ secrets: [intasendApiKey] })
  .auth.user()
  .onCreate(async (user) => {
    try {
      const response = await fetch(
        "https://payment.intasend.com/api/v1/wallets/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${intasendApiKey.value()}`,
          },
          body: JSON.stringify({
            currency: "KES",
            wallet_type: "WORKING",
            can_disburse: true,
            label: `v2${user.uid}`,
          }),
        }
      );

      const responseData = await response.json();

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.metadata.creationTime,
        walletId: responseData.wallet_id,
        tokenBalance: 0,
      };

      await db.collection("users").doc(user.uid).set(userData);

      const notification = {
        title: `Welcome to the platform, ${user.displayName}`,
        message: `We are excited to have you on board. You can now start earning by selling digital content online. Click the link below to get started.`,
        read: false,
        timestamp: Timestamp.now(),
        userId: user.uid,
        link: "/upload",
      };
      await db.collection("notifications").doc().set(notification);
    } catch (err) {
      console.error(err);
    }
  });
