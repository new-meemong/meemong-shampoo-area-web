'use client';

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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getToken } from '@/shared/lib/auth';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';

const viewedPostIds = new Set<string>();
const readPostIds = new Set<string>();

export function useShampooRoomDetail(postId: string, options?: { isSharedView?: boolean }) {
  const isSharedView = options?.isSharedView ?? false;
  const hasAuthToken = !!getToken();
  const queryClient = useQueryClient();

  const [commentInput, setCommentInput] = useState('');
  const [isCommentComposing, setIsCommentComposing] = useState(false);
  const [isCommentInputLocked, setIsCommentInputLocked] = useState(false);
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: number; content: string } | null>(null);
  const [isSecretComment, setIsSecretComment] = useState(false);

  const { data: detail, isLoading } = useQuery({
    queryKey: ['shampoo-room-detail', postId],
    queryFn: () => getShampooRoomDetail(postId),
  });

  const {
    data: commentsData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['shampoo-room-comments', postId],
    queryFn: ({ pageParam }) =>
      getShampooRoomComments(postId, {
        __nextCursor: pageParam,
        __limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.__nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !isSharedView || hasAuthToken,
  });

  const comments = useMemo(
    () => commentsData?.pages.flatMap((page) => page.dataList) ?? [],
    [commentsData?.pages],
  );

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const observerRef = useIntersectionObserver({
    onIntersect: handleFetchNextPage,
    enabled: !!hasNextPage,
  });

  const observerTargetIndex = comments.length <= 1 ? 0 : comments.length - 2;

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
    mutationFn: (payload: { content: string; parentCommentId?: number; isSecret?: boolean }) =>
      createShampooRoomComment(postId, payload),
    onSuccess: () => {
      setCommentInput('');
      setReplyTargetCommentId(null);
      setIsSecretComment(false);
      queryClient.invalidateQueries({ queryKey: ['shampoo-room-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['shampoo-room-detail', postId] });
      queryClient.invalidateQueries({ queryKey: ['shampoo-rooms'] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: (payload: { id: number; content: string; isSecret?: boolean }) =>
      updateShampooRoomComment(postId, payload.id, {
        content: payload.content,
        isSecret: payload.isSecret,
      }),
    onSuccess: () => {
      setEditTarget(null);
      setIsSecretComment(false);
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
    if (isSharedView) return;
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
  }, [detail, isSharedView, markRead, markView, postId]);

  const unlockCommentInput = useCallback(() => {
    setTimeout(() => setIsCommentInputLocked(false), 120);
  }, []);

  const handleCommentInputChange = useCallback(
    (value: string) => {
      if (isCommentInputLocked) return;
      setCommentInput(value);
    },
    [isCommentInputLocked],
  );

  const handleCommentCompositionStart = useCallback(() => {
    setIsCommentComposing(true);
  }, []);

  const handleCommentCompositionEnd = useCallback(() => {
    setIsCommentComposing(false);
  }, []);

  const handleCommentSubmit = async () => {
    if (isCommentInputLocked || isCommentComposing) return;

    const trimmed = commentInput.trim();
    if (!trimmed) return;

    const previousInput = commentInput;
    setIsCommentInputLocked(true);
    setCommentInput('');

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    try {
      if (editTarget) {
        await updateCommentMutation.mutateAsync({
          id: editTarget.id,
          content: trimmed,
          isSecret: isSecretComment,
        });
        return;
      }

      await createCommentMutation.mutateAsync({
        content: trimmed,
        ...(replyTargetCommentId ? { parentCommentId: replyTargetCommentId } : {}),
        isSecret: isSecretComment,
      });
    } catch {
      setCommentInput(previousInput);
    } finally {
      unlockCommentInput();
    }
  };

  return {
    detail,
    isLoading,
    comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    observerRef,
    observerTargetIndex,
    likeMutation,
    deletePostMutation,
    createCommentMutation,
    updateCommentMutation,
    deleteCommentMutation,
    commentInput,
    isCommentComposing,
    isCommentInputLocked,
    isSecretComment,
    setIsSecretComment,
    handleCommentInputChange,
    handleCommentCompositionStart,
    handleCommentCompositionEnd,
    setCommentInput,
    replyTargetCommentId,
    setReplyTargetCommentId,
    editTarget,
    setEditTarget,
    handleCommentSubmit,
  };
}
