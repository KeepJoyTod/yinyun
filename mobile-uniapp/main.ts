import { createSSRApp, createApp as createVueApp } from 'vue';
import App from './App.vue';
import './uni.scss';
import './src/styles/app.scss';

void createVueApp;

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
