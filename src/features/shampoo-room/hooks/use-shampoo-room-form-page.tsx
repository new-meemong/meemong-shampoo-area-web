'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/shared';
import { useOverlayContext } from '@/shared/context/overlay-context';
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';
import useUploadShampooRoomImageMutation from './use-upload-shampoo-room-image';

import { createShampooRoom, getShampooRoomDetail, updateShampooRoom } from '../api';
import type { ShampooRoomCategory } from '@/entities/shampoo-room';

export type NewImageItem = {
  id: string;
  file: File;
};

const createImageId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export function useShampooRoomFormPage(postId?: string) {
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

  const uploadMutation = useUploadShampooRoomImageMutation();
  const createMutation = useMutation({ mutationFn: createShampooRoom });
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
      ...nextFiles.map((file) => ({ id: createImageId(), file })),
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
      await updateMutation.mutateAsync({ id: postId, data: payload });
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

  return {
    isEdit,
    back,
    title,
    setTitle,
    content,
    setContent,
    category,
    setCategory,
    existingImageUrls,
    newImageFiles,
    previewImages,
    isSubmitting,
    isValid,
    handleFileChange,
    handleSubmit,
    handleImageRemove,
  };
}
