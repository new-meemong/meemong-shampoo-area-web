import { apiClient, type ApiListResponse } from '@/shared/api/client';

import type {
  CreateShampooRoomCommentRequest,
  CreateShampooRoomRequest,
  ShampooRoomComment,
  ShampooRoomCommentListQuery,
  ShampooRoomDetail,
  ShampooRoomListItem,
  ShampooRoomListQuery,
  UpdateShampooRoomCommentRequest,
  UpdateShampooRoomRequest,
} from './types';

const API_PREFIX = 'shampoo-rooms';

const appendSearchParams = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(`${key}[]`, String(v));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams;
};

export const getShampooRooms = (query: ShampooRoomListQuery) => {
  return apiClient.getList<ShampooRoomListItem>(API_PREFIX, {
    searchParams: appendSearchParams(query),
  });
};

export const getShampooRoomDetail = async (id: string) => {
  const response = await apiClient.get<ShampooRoomDetail>(`${API_PREFIX}/${id}`);
  return response.data;
};

export const createShampooRoom = async (payload: CreateShampooRoomRequest) => {
  const response = await apiClient.post<{ id: number }>(API_PREFIX, payload);
  return response.data;
};

export const updateShampooRoom = async (id: string, payload: UpdateShampooRoomRequest) => {
  const response = await apiClient.patch<{ id: number }>(`${API_PREFIX}/${id}`, payload);
  return response.data;
};

export const deleteShampooRoom = async (id: string) => {
  await apiClient.delete<null>(`${API_PREFIX}/${id}`);
};

export const createShampooRoomView = async (id: string) => {
  await apiClient.post<null>(`${API_PREFIX}/${id}/view`);
};

export const createShampooRoomRead = async (id: string) => {
  await apiClient.post<null>(`${API_PREFIX}/${id}/read`);
};

export const createShampooRoomLike = async (id: string) => {
  await apiClient.post<{ id: number }>(`${API_PREFIX}/${id}/like`);
};

export const deleteShampooRoomLike = async (id: string) => {
  await apiClient.delete<null>(`${API_PREFIX}/${id}/like`);
};

export const getShampooRoomComments = (
  shampooRoomId: string,
  query: ShampooRoomCommentListQuery,
): Promise<ApiListResponse<ShampooRoomComment>> => {
  return apiClient.getList<ShampooRoomComment>(`${API_PREFIX}/${shampooRoomId}/comments`, {
    searchParams: appendSearchParams(query),
  });
};

export const createShampooRoomComment = async (
  shampooRoomId: string,
  payload: CreateShampooRoomCommentRequest,
) => {
  await apiClient.post<{ id: number }>(`${API_PREFIX}/${shampooRoomId}/comments`, payload);
};

export const updateShampooRoomComment = async (
  shampooRoomId: string,
  shampooRoomCommentId: number,
  payload: UpdateShampooRoomCommentRequest,
) => {
  await apiClient.patch<null>(
    `${API_PREFIX}/${shampooRoomId}/comments/${shampooRoomCommentId}`,
    payload,
  );
};

export const deleteShampooRoomComment = async (shampooRoomId: string, shampooRoomCommentId: number) => {
  await apiClient.delete<null>(`${API_PREFIX}/${shampooRoomId}/comments/${shampooRoomCommentId}`);
};
