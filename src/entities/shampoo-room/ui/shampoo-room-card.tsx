import CommentIcon from '@/assets/icons/comment.svg';
import EyeIcon from '@/assets/icons/eye.svg';
import HeartIcon from '@/assets/icons/mdi_heart.svg';

import type { ShampooRoomListItem } from '../model/types';

type ShampooRoomCardProps = {
  post: ShampooRoomListItem;
  formattedDate: string;
  formattedAddress: string;
  onClick?: () => void;
};

export default function ShampooRoomCard({ post, formattedDate, formattedAddress, onClick }: ShampooRoomCardProps) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left px-5 py-4 border-b border-border-default">
      <div className="typo-body-2-regular text-label-info">
        {formattedDate} · {formattedAddress || '-'}
      </div>
      <p className="mt-1 typo-body-1-medium text-label-strong truncate">{post.title}</p>
      <p className="mt-1 typo-body-2-long-regular text-label-info truncate">{post.content}</p>
      <div className="mt-2 flex items-center gap-3">
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
    </button>
  );
}
