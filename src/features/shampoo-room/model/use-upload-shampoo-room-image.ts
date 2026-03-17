import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/shared/api/client';
import { resizeImageFile } from '@/shared/lib/resize-image-file';

const STORAGE_HOST = 'https://job-storage.meemong.com';
const UPLOAD_IMAGE_MAX_SIZE = 1024;

type UploadedImage = {
  id: number;
  imageURL: string;
};

type ImageUploadResponse = {
  dataList: UploadedImage[];
  dataCount: number;
};

type PresignedUploadData = {
  url: string;
  fields: Record<string, string>;
};

type PresignedUploadResponse = {
  data: {
    uploadData: PresignedUploadData;
    uploadUrlList: string[];
    requestMethod: string;
  };
};

const uploadSingleImage = async (file: File): Promise<UploadedImage> => {
  const resizedFile = await resizeImageFile(file, UPLOAD_IMAGE_MAX_SIZE);
  const presignedResponse = await apiClient.get<PresignedUploadResponse['data']>(
    'uploads/images/presigned-url',
    {
      searchParams: { filename: resizedFile.name },
    },
  );

  const { uploadData, requestMethod } = presignedResponse.data;
  const formData = new FormData();

  Object.entries(uploadData.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', resizedFile);

  const uploadResponse = await fetch(uploadData.url, {
    method: requestMethod,
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload image: ${uploadResponse.status}`);
  }

  const key = uploadData.fields.key;
  return {
    id: 0,
    imageURL: `${STORAGE_HOST}/${key}`,
  };
};

export function useUploadShampooRoomImage() {
  return useMutation({
    mutationFn: async (files: File[]): Promise<ImageUploadResponse> => {
      const dataList = await Promise.all(files.map((file) => uploadSingleImage(file)));

      return {
        dataList,
        dataCount: dataList.length,
      };
    },
  });
}
