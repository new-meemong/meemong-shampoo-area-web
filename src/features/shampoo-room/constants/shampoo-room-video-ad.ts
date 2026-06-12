export const SHAMPOO_ROOM_VIDEO_AD = {
  id: 'shampoo-room-youtube-video-ad',
  thumbnailUrl: '/shampoo-room-video-ad-thumbnail.jpg',
  ctaUrl: 'https://www.visualacademy.co.kr/visualonly/?idx=203',
  videoEmbedUrl:
    'https://www.youtube.com/embed/w3r63eGWzXM?autoplay=1&playsinline=1&rel=0&si=Rd76_ogg5HRgDFaK',
} as const;

export const SHAMPOO_ROOM_VIDEO_AD_BASE_EVENT_PROPERTIES = {
  video_ad_id: SHAMPOO_ROOM_VIDEO_AD.id,
} as const;
