'use client';

import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer';
import { createShampooRoom, getShampooRoomDetail, updateShampooRoom } from '../api';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/shared';
import GalleryIcon from '@/assets/icons/gallery.svg';
import type { ShampooRoomCategory } from '../types';
import { SiteHeader } from '@/widgets/header';
import { XIcon } from 'lucide-react';
import { useOverlayContext } from '@/shared/context/overlay-context';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';
import useUploadPostImageMutation from '@/features/posts/api/use-upload-post-image';

const CATEGORY_OPTIONS: Array<{ label: string; value: ShampooRoomCategory }> = [
  { label: '자유글', value: 'FREE' },
  { label: '교육', value: 'EDUCATION' },
  { label: '제품', value: 'PRODUCT' },
  { label: '사고팔고', value: 'MARKET' },
];

type ShampooRoomFormPageProps = {
  postId?: string;
};

type NewImageItem = {
  id: string;
  file: File;
};

const createImageId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export default function ShampooRoomFormPage({ postId }: ShampooRoomFormPageProps) {
  const isEdit = !!postId;
  const { back, replace } = useRouterWithUser();
  const { showBottomSheet } = useOverlayContext();
  const queryClient = useQueryClient();

  const { data: detailData } = useQuery({
    queryKey: ['shampoo-room-detail', postId],
    queryFn: () => getShampooRoomDetail(postId!),
    enabled: isEdit,
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ShampooRoomCategory>('FREE');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<NewImageItem[]>([]);

  useEffect(() => {
    if (!detailData) return;

    setTitle(detailData.title);
    setContent(detailData.content);
    setCategory(detailData.category);
    setExistingImageUrls(detailData.images.map((image) => image.imageUrl));
  }, [detailData]);

  const previewImages = useMemo(
    () => [
      ...existingImageUrls.map((url, index) => ({ key: `url-${index}`, src: url })),
      ...newImageFiles.map((item) => ({
        key: `file-${item.id}`,
        src: URL.createObjectURL(item.file),
      })),
    ],
    [existingImageUrls, newImageFiles],
  );

  const uploadMutation = useUploadPostImageMutation();
  const createMutation = useMutation({
    mutationFn: createShampooRoom,
  });
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Parameters<typeof updateShampooRoom>[1] }) =>
      updateShampooRoom(payload.id, payload.data),
  });

  const isSubmitting =
    uploadMutation.isPending || createMutation.isPending || updateMutation.isPending;
  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const showImageUploadLimitSheet = () => {
    showBottomSheet({
      id: 'shampoo-room-image-upload-limit-sheet',
      children: (
        <>
          <DrawerHeader>
            <DrawerTitle>이미지는 최대 10장 업로드 가능합니다</DrawerTitle>
            <DrawerDescription>
              이미지는 최대 10개 업로드 가능합니다.
              <br />
              기존 이미지를 삭제해주세요
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter
            buttons={[
              <DrawerClose asChild key="close">
                <Button size="lg">확인</Button>
              </DrawerClose>,
            ]}
          />
        </>
      ),
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const remain = 10 - (existingImageUrls.length + newImageFiles.length);
    if (remain <= 0 || files.length > remain) {
      showImageUploadLimitSheet();
    }
    if (remain <= 0) {
      event.target.value = '';
      return;
    }

    const nextFiles = files.slice(0, Math.max(remain, 0));
    setNewImageFiles((prev) => [
      ...prev,
      ...nextFiles.map((file) => ({
        id: createImageId(),
        file,
      })),
    ]);
    event.target.value = '';
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    let uploadedImageUrls: string[] = [];

    if (newImageFiles.length > 0) {
      const uploadResult = await uploadMutation.mutateAsync(newImageFiles.map((item) => item.file));
      uploadedImageUrls = uploadResult.dataList.map((image) => image.imageURL);
    }

    const images = [...existingImageUrls, ...uploadedImageUrls].map((imageUrl) => ({ imageUrl }));
    const payload = {
      title: title.trim(),
      content: content.trim(),
      category,
      ...(images.length > 0 ? { images } : {}),
    };

    if (isEdit && postId) {
      await updateMutation.mutateAsync({
        id: postId,
        data: payload,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['shampoo-room-detail', postId] }),
        queryClient.invalidateQueries({ queryKey: ['shampoo-rooms'] }),
      ]);
      replace(`/posts/${postId}`);
      return;
    }

    const created = await createMutation.mutateAsync(payload);
    replace(`/posts/${created.id}`);
  };

  const handleImageRemove = (key: string) => {
    if (key.startsWith('url-')) {
      const index = Number(key.replace('url-', ''));
      if (Number.isNaN(index)) return;
      setExistingImageUrls((prev) => prev.filter((_, idx) => idx !== index));
      return;
    }

    const fileId = key.replace('file-', '');
    setNewImageFiles((prev) => prev.filter((item) => item.id !== fileId));
  };

  return (
    <div className="min-w-[375px] w-full h-screen mx-auto bg-white flex flex-col">
      <SiteHeader title={isEdit ? '게시글 수정' : '글쓰기'} showBackButton onBackClick={back} />

      <div className="flex-1 min-h-0 px-5 pt-5 pb-4 flex flex-col gap-5 overflow-hidden">
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="글 제목을 입력하세요"
            className="w-full border-b border-border-default px-0 py-3 typo-title-3-semibold text-label-default placeholder:typo-title-3-semibold placeholder:text-label-placeholder focus:outline-none"
            maxLength={100}
          />
        </div>

        <div className="flex justify-center">
          <div className="w-[336px] rounded-6 bg-alternative p-1 flex items-center justify-center gap-1.5">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={`w-[74px] shrink-0 rounded-6 px-2 py-2 flex items-center justify-center ${
                  category === option.value
                    ? 'bg-white shadow-[2px_2px_20px_0_rgba(0,0,0,0.06),2px_2px_10px_0_rgba(0,0,0,0.04)] typo-body-2-medium text-label-default'
                    : 'bg-alternative typo-body-2-regular text-label-sub'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 자유롭게 작성해주세요."
            className="w-full flex-1 min-h-0 resize-none rounded-6 border border-border-default bg-white px-3 py-2 typo-body-2-long-regular text-label-default placeholder:typo-body-2-long-regular placeholder:text-label-placeholder focus:outline-none focus:border-border-default focus:bg-white"
            maxLength={5000}
          />
        </div>
      </div>

      {previewImages.length > 0 && (
        <div className="mt-4 mb-4 px-5">
          <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide">
            {previewImages.map((image) => (
              <div
                key={image.key}
                className="relative size-[100px] shrink-0 rounded-6 overflow-hidden border border-border-default"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt="업로드 이미지" className="size-full object-cover" />
                <Button
                  type="button"
                  variant="icon"
                  size="icon"
                  className="absolute top-1 right-1 size-5"
                  onClick={() => handleImageRemove(image.key)}
                >
                  <XIcon />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 py-3 border-t border-border-default flex items-center gap-2">
        <label
          className="cursor-pointer inline-flex size-[42px] items-center justify-center rounded-[6.3px] bg-label-default"
          aria-label={`이미지 업로드 (${existingImageUrls.length + newImageFiles.length}/10)`}
        >
          <GalleryIcon className="size-6 fill-white" />
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="ml-auto w-[75px] rounded-4 bg-label-default text-white py-3 typo-body-2-semibold disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSubmitting ? '저장 중...' : '완료'}
        </button>
      </div>
    </div>
  );
}
