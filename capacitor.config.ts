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
  },
};

export default config;
