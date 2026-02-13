import ShampooRoomFormPage from '@/features/shampoo-room/ui/shampoo-room-form-page';

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  return <ShampooRoomFormPage postId={id} />;
}
