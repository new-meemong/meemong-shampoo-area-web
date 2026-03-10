export type AppSource = 'app' | 'web';

export function normalizeSource(source: string | null | undefined): AppSource {
  return source == 'app' ? 'app' : 'web';
}

function hasGoAppRouterBridge(): boolean {
  if (typeof window === 'undefined') return false;

  return !!window.GoAppRouter && typeof window.GoAppRouter.postMessage === 'function';
}

function hasCloseWebViewBridge(): boolean {
  if (typeof window === 'undefined') return false;

  return !!window.GoBack && typeof window.GoBack.postMessage === 'function';
}

export function openInAppWebView(path: string): boolean {
  if (!hasGoAppRouterBridge()) return false;

  try {
    window.GoAppRouter?.postMessage(JSON.stringify(path));
    return true;
  } catch (_) {
    return false;
  }
}

export function closeAppWebView(message: string = 'close'): boolean {
  if (!hasCloseWebViewBridge()) return false;

  try {
    window.GoBack?.postMessage(JSON.stringify(message));
    return true;
  } catch (_) {
    return false;
  }
}
