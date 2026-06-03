'use client';

import { getMobileOS, type MobileOS } from '@/shared/lib/get-mobile-os';
import { useEffect, useState } from 'react';

const STORE_URL = {
  android:
    'https://play.google.com/store/apps/details?id=com.meemong.second&pcampaignid=web_share',
  ios: 'https://apps.apple.com/kr/app/%EB%AF%B8%EB%AA%BD-%EB%8B%B9%EC%8B%A0%EB%8F%84-%ED%97%A4%EC%96%B4%EB%AA%A8%EB%8D%B8/id1572588554?l=en-GB',
} as const;

type StoreTarget = keyof typeof STORE_URL;

type StoreFloatingButtonProps = {
  title?: string;
};

export function StoreFloatingButton({ title = '미몽 앱에서 전체 보기' }: StoreFloatingButtonProps) {
  // 하이드레이션 불일치를 피하기 위해 마운트 후 클라이언트에서 OS를 감지한다.
  const [os, setOs] = useState<MobileOS | null>(null);

  useEffect(() => {
    setOs(getMobileOS());
  }, []);

  // 감지된 OS에 맞는 배지만 노출. 데스크톱 등 미감지 시에는 양쪽 모두 노출한다.
  const showAndroid = os === 'android' || os === 'other';
  const showIOS = os === 'ios' || os === 'other';
  const primaryStoreTarget: StoreTarget = os === 'android' ? 'android' : 'ios';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full min-w-[375px] flex-col items-center gap-2 border-t border-border-default bg-white px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <a
        href={STORE_URL[primaryStoreTarget]}
        className="flex h-12 w-full max-w-[343px] items-center justify-center rounded-4 bg-primary-deep typo-body-1-semibold text-white"
      >
        {title}
      </a>
      <div className="flex h-[41px] items-center justify-center gap-2">
        {showAndroid && (
          <a href={STORE_URL.android} className="h-[41px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/playstore_download.svg"
              alt="Google Play에서 다운로드"
              className="h-full w-auto"
            />
          </a>
        )}
        {showIOS && (
          <a href={STORE_URL.ios} className="h-[41px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/appstore_download.svg"
              alt="App Store에서 다운로드"
              className="h-full w-auto"
            />
          </a>
        )}
      </div>
    </div>
  );
}
