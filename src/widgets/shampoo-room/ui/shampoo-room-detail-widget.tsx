'use client';

import { ShampooRoomDetail } from '@/features/shampoo-room';

type ShampooRoomDetailWidgetProps = {
  postId: string;
};

export default function ShampooRoomDetailWidget({ postId }: ShampooRoomDetailWidgetProps) {
  return <ShampooRoomDetail postId={postId} />;
}
