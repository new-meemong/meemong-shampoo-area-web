import CommentIcon from '@/assets/icons/comment.svg';
import EyeIcon from '@/assets/icons/eye.svg';
import HeartIcon from '@/assets/icons/mdi_heart.svg';
import type { ShampooRoomListItem } from '../model/types';

type ShampooRoomCardProps = {
  post: ShampooRoomListItem;
  formattedDate: string;
  formattedAddress: string;
  showCategoryLabel?: boolean;
  onClick?: () => void;
};

const CATEGORY_LABEL_MAP: Record<ShampooRoomListItem['category'], string> = {
  FREE: '자유글',
  EDUCATION: '교육',
  PRODUCT: '제품',
  MARKET: '사고팔고',
};

export default function ShampooRoomCard({
  post,
  formattedDate,
  formattedAddress,
  showCategoryLabel = false,
  onClick,
}: ShampooRoomCardProps) {
  const firstImageUrl = post.images[0]?.imageUrl;
  const hasImage = !!firstImageUrl;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-5 py-4 border-b border-border-default"
    >
      <div className={`w-full ${hasImage ? 'flex items-start gap-2' : ''}`}>
        <div className="min-w-0 flex-1">
          <div className="typo-body-2-regular text-label-info">
            {formattedDate} · {formattedAddress || '-'}
          </div>
          <p className="mt-1 typo-body-1-medium text-label-strong truncate">{post.title}</p>
          <p className="mt-1 typo-body-2-long-regular text-label-info truncate">{post.content}</p>
        </div>
        {hasImage && (
          <div className="size-20 shrink-0 overflow-hidden rounded-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={firstImageUrl} alt="게시글 이미지" className="size-full object-cover" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <HeartIcon className="size-4 fill-label-info" />
            <span className="typo-body-2-regular text-label-info">{post.likeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <CommentIcon className="size-4 fill-label-info" />
            <span className="typo-body-2-regular text-label-info">{post.commentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon className="size-4 fill-label-info" />
            <span className="typo-body-2-regular text-label-info">{post.viewCount}</span>
          </div>
        </div>
        {showCategoryLabel && (
          <span className="typo-body-3-medium text-primary-deep">{CATEGORY_LABEL_MAP[post.category]}</span>
        )}
      </div>
    </button>
  );
}
