import { ShampooRoomFormWidget } from '@/widgets/shampoo-room';

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  return <ShampooRoomFormWidget postId={id} />;
}
