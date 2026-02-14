export {};

declare global {
  interface Window {
    goAppRouter?: (path: string) => void;
    GoAppRouter?: (path: string) => void;
    closeWebview?: (message?: unknown) => void;
    GoBack?: {
      postMessage: (value: string) => void;
    };
    customBackAction?: (() => void) | null;
    setCustomBackAction?: (callback: (() => void) | null) => void;
    BackAction?: {
      postMessage: (value: string) => void;
    };
    openChatChannel?: (message: { channelId: string; userId: number }) => void;
    OpenChatChannel?: {
      postMessage: (value: string) => void;
    };
    showAdIfAllowed?: (payload: { adType: string }) => void;
    ShowAdIfAllowed?: {
      postMessage: (value: string) => void;
    };
    externalLink?: (url: string) => void;
    ExternalLink?: {
      postMessage: (value: string) => void;
    };
  }
}
