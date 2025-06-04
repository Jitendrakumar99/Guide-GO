import 'dotenv/config';

export default {
  expo: {
    name: "Tourism App",
    slug: "FirstApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    plugins: [
      "expo-video",
      "expo-audio"
    ],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ecommerce717ae.app",
      googleServicesFile: "./GoogleService-Info.plist"
    },
    android: {
      config: {
        googleMaps: {
          apiKey: "AIzaSyDdIriSwDafxF_IudsJtC5_cGgk67xhfYo"
        }
      },
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      googleServicesFile: "./google-services.json",
      package: "com.ecommerce717ae.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    scheme: "ecommerce717ae",
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
}; 