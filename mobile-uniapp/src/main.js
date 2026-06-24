import { createSSRApp } from 'vue';
import App from './App.vue';
import '../uni.scss';
import './styles/app.scss';

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
