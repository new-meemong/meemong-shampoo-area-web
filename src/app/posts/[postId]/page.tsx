import { ShampooRoomDetailWidget } from '@/widgets/shampoo-room';

type PostDetailPageProps = {
  params: Promise<{ postId: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;

  return <ShampooRoomDetailWidget postId={postId} />;
}
