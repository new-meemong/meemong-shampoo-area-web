import ProfileIcon from '@/assets/icons/profile.svg';

import type { ShampooRoomComment, ShampooRoomCommentReply } from '../model/types';

type ShampooRoomCommentCardProps = {
  comment: ShampooRoomComment | ShampooRoomCommentReply;
  formattedDate: string;
};

export default function ShampooRoomCommentCard({ comment, formattedDate }: ShampooRoomCommentCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <ProfileIcon className="size-8 rounded-6 bg-label-default" />
        <p className="typo-body-1-semibold text-label-default">익명</p>
      </div>
      <p className="typo-body-1-long-regular text-label-default">{comment.content}</p>
      <p className="typo-body-3-regular text-label-info">{formattedDate}</p>
    </div>
  );
}
