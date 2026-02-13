'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { SiteHeader } from '@/widgets/header';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';
import useUploadPostImageMutation from '@/features/posts/api/use-upload-post-image';

import {
  createShampooRoom,
  getShampooRoomDetail,
  updateShampooRoom,
} from '../api';
import type { ShampooRoomCategory } from '../types';

const CATEGORY_OPTIONS: Array<{ label: string; value: ShampooRoomCategory }> = [
  { label: '자유글', value: 'FREE' },
  { label: '교육', value: 'EDUCATION' },
  { label: '제품', value: 'PRODUCT' },
  { label: '사고팔고', value: 'MARKET' },
];

type ShampooRoomFormPageProps = {
  postId?: string;
};

export default function ShampooRoomFormPage({ postId }: ShampooRoomFormPageProps) {
  const isEdit = !!postId;
  const { back, replace } = useRouterWithUser();

  const { data: detailData } = useQuery({
    queryKey: ['shampoo-room-detail', postId],
    queryFn: () => getShampooRoomDetail(postId!),
    enabled: isEdit,
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ShampooRoomCategory>('FREE');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!detailData) return;

    setTitle(detailData.title);
    setContent(detailData.content);
    setCategory(detailData.category);
    setExistingImageUrls(detailData.images.map((image) => image.imageUrl));
  }, [detailData]);

  const previewImages = useMemo(
    () => [
      ...existingImageUrls.map((url) => ({ key: `url-${url}`, src: url, source: 'url' as const })),
      ...newImageFiles.map((file) => ({
        key: `file-${file.name}-${file.lastModified}`,
        src: URL.createObjectURL(file),
        source: 'file' as const,
        file,
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

  const isSubmitting = uploadMutation.isPending || createMutation.isPending || updateMutation.isPending;
  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const remain = 10 - (existingImageUrls.length + newImageFiles.length);
    const nextFiles = files.slice(0, Math.max(remain, 0));
    setNewImageFiles((prev) => [...prev, ...nextFiles]);
    event.target.value = '';
  };

  const handleImageRemove = (key: string) => {
    if (key.startsWith('url-')) {
      const url = key.replace('url-', '');
      setExistingImageUrls((prev) => prev.filter((item) => item !== url));
      return;
    }

    const fileKey = key.replace('file-', '');
    setNewImageFiles((prev) =>
      prev.filter((file) => `${file.name}-${file.lastModified}` !== fileKey),
    );
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    let uploadedImageUrls: string[] = [];

    if (newImageFiles.length > 0) {
      const uploadResult = await uploadMutation.mutateAsync(newImageFiles);
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
      replace(`/posts/${postId}`);
      return;
    }

    const created = await createMutation.mutateAsync(payload);
    replace(`/posts/${created.id}`);
  };

  return (
    <div className="min-w-[375px] w-full h-screen mx-auto bg-white flex flex-col">
      <SiteHeader title={isEdit ? '게시글 수정' : '게시글 작성'} showBackButton onBackClick={back} />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={`shrink-0 rounded-8 border px-3 py-2 typo-body-2-medium ${
                category === option.value
                  ? 'bg-label-default text-static-white border-label-default'
                  : 'bg-white text-label-default border-border-default'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-1 typo-body-2-medium text-label-default">제목</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full rounded-8 border border-border-default px-3 py-2 typo-body-2-regular"
            maxLength={100}
          />
        </div>

        <div>
          <p className="mb-1 typo-body-2-medium text-label-default">내용</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            className="w-full min-h-[180px] rounded-8 border border-border-default px-3 py-2 typo-body-2-regular"
            maxLength={5000}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="typo-body-2-medium text-label-default">이미지 (최대 10장)</p>
            <label className="cursor-pointer rounded-8 border border-border-default px-3 py-1.5 typo-body-3-medium text-label-default">
              업로드
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {previewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previewImages.map((image) => (
                <div key={image.key} className="relative rounded-6 overflow-hidden border border-border-default">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt="업로드 이미지" className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(image.key)}
                    className="absolute top-1 right-1 bg-label-default/80 text-static-white rounded px-1 typo-body-3-regular"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-border-default">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full rounded-8 bg-label-default text-static-white py-3 typo-body-2-semibold disabled:opacity-40"
        >
          {isSubmitting ? '저장 중...' : isEdit ? '수정하기' : '작성하기'}
        </button>
      </div>
    </div>
  );
}
