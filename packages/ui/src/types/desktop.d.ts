import type { DesktopBootOutcome } from '@/lib/desktopBoot';

declare global {
  interface Window {
    __POLLARYS_HOME__?: string;
    __POLLARYS_MACOS_MAJOR__?: number;
    __POLLARYS_LOCAL_ORIGIN__?: string;
    __POLLARYS_ELECTRON__?: { runtime?: string };
    __POLLARYS_DESKTOP_BOOT_OUTCOME__?: DesktopBootOutcome;
  }

  interface WebviewElement extends HTMLElement {
    loadURL(url: string): void;
    goBack(): void;
    goForward(): void;
    reload(): void;
    getURL(): string;
    getTitle(): string;
    isLoading(): boolean;
    getWebContentsId(): number;
    executeJavaScript(code: string, userGesture?: boolean): Promise<unknown>;
  }

  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<
        React.HTMLAttributes<WebviewElement> & {
          src?: string;
          partition?: string;
          preload?: string;
          nodeintegration?: string;
          allowpopups?: string;
          ref?: React.Ref<WebviewElement>;
        },
        WebviewElement
      >;
    }
  }
}

export {};


