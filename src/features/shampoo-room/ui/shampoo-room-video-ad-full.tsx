'use client';

import { ArrowRight, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { SEARCH_PARAMS } from '@/shared/constants/search-params';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';
import { analyticsService } from '@/shared/lib/analytics/service';
import { closeAppWebView, normalizeSource, openExternalLinkInApp } from '@/shared/lib/app-bridge';

import {
  SHAMPOO_ROOM_VIDEO_AD,
  SHAMPOO_ROOM_VIDEO_AD_BASE_EVENT_PROPERTIES,
} from '../constants/shampoo-room-video-ad';

export default function ShampooRoomVideoAdFull() {
  const { back } = useRouterWithUser();
  const searchParams = useSearchParams();
  const source = normalizeSource(searchParams.get(SEARCH_PARAMS.SOURCE));

  const handleCloseClick = () => {
    if (source === 'app') {
      const closed = closeAppWebView('close');
      if (closed) return;
    }

    back();
  };

  const handleMoreClick = async () => {
    await analyticsService.track('shampoo_area_video_ad_more_click', {
      ...SHAMPOO_ROOM_VIDEO_AD_BASE_EVENT_PROPERTIES,
      placement: 'shampoo_room_video_ad_detail',
      destination_type: 'external_link',
    });

    if (source === 'app' && openExternalLinkInApp(SHAMPOO_ROOM_VIDEO_AD.ctaUrl)) {
      return;
    }

    window.location.href = SHAMPOO_ROOM_VIDEO_AD.ctaUrl;
  };

  return (
    <div className="min-w-[375px] w-full h-screen mx-auto bg-label-default text-white">
      <div className="absolute left-0 top-0 z-10 flex h-[60px] w-full items-center justify-end px-5">
        <button
          type="button"
          aria-label="닫기"
          onClick={handleCloseClick}
          className="flex size-10 items-center justify-center rounded-4"
        >
          <X className="size-7 text-white" />
        </button>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="h-[211px] w-full bg-label-disable">
          <iframe
            title="샴푸실 영상 광고"
            src={SHAMPOO_ROOM_VIDEO_AD.videoEmbedUrl}
            className="size-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="w-full px-5">
          <button
            type="button"
            onClick={handleMoreClick}
            className="flex h-[43px] w-full items-center justify-center gap-1 rounded-4 border border-border-default typo-body-2-medium text-white"
          >
            더 보러가기
            <ArrowRight className="size-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
