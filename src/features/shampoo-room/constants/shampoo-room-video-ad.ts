export const SHAMPOO_ROOM_VIDEO_AD = {
  id: 'shampoo-room-youtube-video-ad',
  thumbnailUrl: '/shampoo-room-video-ad-thumbnail.jpg',
  ctaUrl: 'https://www.visualacademy.co.kr/hair/?idx=193',
  videoEmbedUrl:
    'https://www.youtube.com/embed/pyGu_4kWni8?autoplay=1&playsinline=1&rel=0',
} as const;

export const SHAMPOO_ROOM_VIDEO_AD_BASE_EVENT_PROPERTIES = {
  video_ad_id: SHAMPOO_ROOM_VIDEO_AD.id,
} as const;
