import { Play } from 'lucide-react';

import { SHAMPOO_ROOM_VIDEO_AD } from '../../constants/shampoo-room-video-ad';

type ShampooRoomVideoAdBannerProps = {
  onPlayClick: () => void;
};

export default function ShampooRoomVideoAdBanner({ onPlayClick }: ShampooRoomVideoAdBannerProps) {
  return (
    <div className="w-full px-5">
      <div className="relative h-[189px] w-full overflow-hidden rounded-8 bg-label-disable">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SHAMPOO_ROOM_VIDEO_AD.thumbnailUrl}
          alt="샴푸실 영상 광고 썸네일"
          className="size-full object-cover"
        />
        <button
          type="button"
          aria-label="영상 광고 재생"
          onClick={onPlayClick}
          className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-label-default/80"
        >
          <Play className="ml-1 size-8 fill-white text-white" />
        </button>
      </div>
    </div>
  );
}
