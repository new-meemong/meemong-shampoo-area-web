'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  createShampooRoomComment,
  createShampooRoomLike,
  createShampooRoomRead,
  createShampooRoomView,
  deleteShampooRoom,
  deleteShampooRoomComment,
  deleteShampooRoomLike,
  getShampooRoomComments,
  getShampooRoomDetail,
  updateShampooRoomComment,
} from '../api';

const viewedPostIds = new Set<string>();
const readPostIds = new Set<string>();

export function useShampooRoomDetailPage(postId: string) {
  const queryClient = useQueryClient();

  const [commentInput, setCommentInput] = useState('');
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: number; content: string } | null>(null);

  const { data: detail, isLoading } = useQuery({
    queryKey: ['shampoo-room-detail', postId],
    queryFn: () => getShampooRoomDetail(postId),
  });

  const { data: commentsData, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['shampoo-room-comments', postId],
    queryFn: ({ pageParam }) =>
      getShampooRoomComments(postId, {
        __nextCursor: pageParam,
        __limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.__nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const comments = useMemo(
    () => commentsData?.pages.flatMap((page) => page.dataList) ?? [],
    [commentsData?.pages],
  );

  const { mutateAsync: markView } = useMutation({ mutationFn: createShampooRoomView });
  const { mutateAsync: markRead } = useMutation({ mutationFn: createShampooRoomRead });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!detail) return;
      if (detail.isLiked) {
        await deleteShampooRoomLike(postId);
      } else {
        await createShampooRoomLike(postId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shampoo-room-detail', postId] });
      queryClient.invalidateQueries({ queryKey: ['shampoo-rooms'] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deleteShampooRoom(postId),
  });

  const createCommentMutation = useMutation({
    mutationFn: (payload: { content: string; parentCommentId?: number }) =>
      createShampooRoomComment(postId, payload),
    onSuccess: () => {
      setCommentInput('');
      setReplyTargetCommentId(null);
      queryClient.invalidateQueries({ queryKey: ['shampoo-room-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['shampoo-room-detail', postId] });
      queryClient.invalidateQueries({ queryKey: ['shampoo-rooms'] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: (payload: { id: number; content: string }) =>
      updateShampooRoomComment(postId, payload.id, { content: payload.content }),
    onSuccess: () => {
      setEditTarget(null);
      queryClient.invalidateQueries({ queryKey: ['shampoo-room-comments', postId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteShampooRoomComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shampoo-room-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['shampoo-room-detail', postId] });
      queryClient.invalidateQueries({ queryKey: ['shampoo-rooms'] });
    },
  });

  useEffect(() => {
    if (!detail) return;

    const markPostViewAndRead = async () => {
      if (!viewedPostIds.has(postId)) {
        viewedPostIds.add(postId);
        try {
          await markView(postId);
        } catch {
          viewedPostIds.delete(postId);
        }
      }

      if (!detail.isRead && !readPostIds.has(postId)) {
        readPostIds.add(postId);
        try {
          await markRead(postId);
        } catch {
          readPostIds.delete(postId);
        }
      }
    };

    void markPostViewAndRead();
  }, [detail, markRead, markView, postId]);

  const handleCommentSubmit = async () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    if (editTarget) {
      await updateCommentMutation.mutateAsync({ id: editTarget.id, content: trimmed });
      return;
    }

    await createCommentMutation.mutateAsync({
      content: trimmed,
      ...(replyTargetCommentId ? { parentCommentId: replyTargetCommentId } : {}),
    });
  };

  return {
    detail,
    isLoading,
    comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    likeMutation,
    deletePostMutation,
    createCommentMutation,
    updateCommentMutation,
    deleteCommentMutation,
    commentInput,
    setCommentInput,
    replyTargetCommentId,
    setReplyTargetCommentId,
    editTarget,
    setEditTarget,
    handleCommentSubmit,
  };
}
