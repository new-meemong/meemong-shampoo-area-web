'use client';

import { ShampooRoomForm } from '@/features/shampoo-room';

type ShampooRoomFormWidgetProps = {
  postId?: string;
};

export default function ShampooRoomFormWidget({ postId }: ShampooRoomFormWidgetProps) {
  return <ShampooRoomForm postId={postId} />;
}
