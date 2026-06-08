import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paleoglossa.app',
  appName: 'Paleoglossa',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'localhost',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFF8E7',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      iOSSpinnerStyle: 'small',
      spinnerColor: '#2563EB',
    },
    FirebaseAuthentication: {
      // We bridge native credentials into the Firebase JS SDK ourselves
      // (signInWithCredential), so the plugin must not sign in to the
      // native Firebase SDK separately.
      skipNativeAuth: true,
      providers: ['google.com', 'apple.com'],
    },
  },
};

export default config;
