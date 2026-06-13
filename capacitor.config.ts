import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.remix2.cardmemory',
  appName: 'Remix2: Карта Памяти',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
