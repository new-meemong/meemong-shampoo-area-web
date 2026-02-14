'use client';

import ShampooRoomFormPage from '@/features/shampoo-room/ui/shampoo-room-form-page';

type ShampooRoomFormWidgetProps = {
  postId?: string;
};

export default function ShampooRoomFormWidget({ postId }: ShampooRoomFormWidgetProps) {
  return <ShampooRoomFormPage postId={postId} />;
}
