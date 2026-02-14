'use client';

import ShampooRoomDetailPage from '@/features/shampoo-room/ui/shampoo-room-detail-page';

type ShampooRoomDetailWidgetProps = {
  postId: string;
};

export default function ShampooRoomDetailWidget({ postId }: ShampooRoomDetailWidgetProps) {
  return <ShampooRoomDetailPage postId={postId} />;
}
