export type MobileOS = 'android' | 'ios' | 'other';

/**
 * userAgent 기반으로 모바일 OS를 감지한다.
 * SSR 환경(window 없음)에서는 'other'를 반환한다.
 */
export function getMobileOS(): MobileOS {
  if (typeof window === 'undefined') return 'other';

  const ua = window.navigator.userAgent;

  if (/android/i.test(ua)) return 'android';

  // iPadOS 13+ 는 데스크톱 Safari로 위장하므로 터치 포인트로 추가 판별
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) return 'ios';

  return 'other';
}
