import { createWebAPIs } from './api';
import type { RuntimeAPIs } from '@pollarys/ui/lib/api/types';
import '@pollarys/ui/index.css';
import '@pollarys/ui/styles/fonts';

declare global {
  interface Window {
    __POLLARYS_RUNTIME_APIS__?: RuntimeAPIs;
  }
}

window.__POLLARYS_RUNTIME_APIS__ = createWebAPIs();

void import('@pollarys/ui/apps/renderElectronMiniChatApp')
  .then(({ renderElectronMiniChatApp }) => {
    renderElectronMiniChatApp(window.__POLLARYS_RUNTIME_APIS__ ?? createWebAPIs());
  });
