import ShampooRoomDetailPage from '@/features/shampoo-room/ui/shampoo-room-detail-page';

type PostDetailPageProps = {
  params: Promise<{ postId: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;

  return <ShampooRoomDetailPage postId={postId} />;
}
