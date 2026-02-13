'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { SiteHeader } from '@/widgets/header';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';

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
import type { ShampooRoomComment, ShampooRoomCommentReply } from '../types';

type ShampooRoomDetailPageProps = {
  postId: string;
};

export default function ShampooRoomDetailPage({ postId }: ShampooRoomDetailPageProps) {
  const queryClient = useQueryClient();
  const { back, push, replace } = useRouterWithUser();

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

  const { mutate: markView } = useMutation({ mutationFn: createShampooRoomView });
  const { mutate: markRead } = useMutation({ mutationFn: createShampooRoomRead });

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
    onSuccess: () => {
      replace('/posts');
    },
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
    markView(postId);

    if (!detail.isRead) {
      markRead(postId);
    }
  }, [detail, markRead, markView, postId]);

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({ url: shareUrl, title: detail?.title ?? '샴푸실 게시글' });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    alert('링크가 복사되었습니다.');
  };

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

  const startEditComment = (comment: ShampooRoomComment | ShampooRoomCommentReply) => {
    setEditTarget({ id: comment.id, content: comment.content });
    setCommentInput(comment.content);
    setReplyTargetCommentId(null);
  };

  const renderReply = (reply: ShampooRoomCommentReply) => (
    <div key={reply.id} className="ml-6 mt-2 rounded-8 bg-alternative p-3">
      <div className="flex items-center justify-between">
        <p className="typo-body-3-medium text-label-info">
          {reply.user.name} · {new Date(reply.createdAt).toLocaleString('ko-KR')}
        </p>
        {reply.isMine && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => startEditComment(reply)}
              className="typo-body-3-medium text-label-default"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => deleteCommentMutation.mutate(reply.id)}
              className="typo-body-3-medium text-negative"
            >
              삭제
            </button>
          </div>
        )}
      </div>
      <p className="mt-1 typo-body-2-regular text-label-default">{reply.content}</p>
    </div>
  );

  if (isLoading || !detail) {
    return <div className="p-5 typo-body-2-regular text-label-info">불러오는 중...</div>;
  }

  return (
    <div className="min-w-[375px] w-full h-screen mx-auto bg-white flex flex-col">
      <SiteHeader
        title="샴푸실"
        showBackButton
        onBackClick={back}
        rightComponent={
          detail.isMine ? (
            <div className="flex gap-3 pr-4">
              <button
                type="button"
                className="typo-body-3-medium text-label-default"
                onClick={() => push(`/posts/edit/${detail.id}`)}
              >
                수정
              </button>
              <button
                type="button"
                className="typo-body-3-medium text-negative"
                onClick={() => {
                  if (confirm('게시글을 삭제할까요?')) {
                    deletePostMutation.mutate();
                  }
                }}
              >
                삭제
              </button>
            </div>
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 border-b border-border-default">
          <p className="typo-body-3-medium text-label-info">
            {detail.user.name} · {new Date(detail.createdAt).toLocaleString('ko-KR')}
          </p>
          <h1 className="mt-2 typo-title-3-semibold text-label-default">{detail.title}</h1>
          <p className="mt-3 whitespace-pre-wrap typo-body-1-long-regular text-label-default">
            {detail.content}
          </p>

          {detail.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {detail.images.slice(0, 3).map((image, index) => (
                <div key={`${image.imageUrl}-${index}`} className="rounded-6 overflow-hidden border border-border-default">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.imageUrl} alt="게시글 이미지" className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-b border-border-default flex items-center gap-4">
          <button
            type="button"
            onClick={() => likeMutation.mutate()}
            className={`typo-body-2-medium ${detail.isLiked ? 'text-negative' : 'text-label-default'}`}
          >
            좋아요 {detail.likeCount}
          </button>
          <button type="button" className="typo-body-2-medium text-label-default">
            댓글 {detail.commentCount}
          </button>
          <button type="button" onClick={handleShare} className="typo-body-2-medium text-label-default">
            공유
          </button>
          <p className="ml-auto typo-body-3-regular text-label-info">조회 {detail.viewCount}</p>
        </div>

        <div>
          {comments.length === 0 ? (
            <p className="p-5 typo-body-2-regular text-label-info">댓글이 없습니다.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4 border-b border-border-default">
                <div className="flex items-center justify-between">
                  <p className="typo-body-3-medium text-label-info">
                    {comment.user.name} · {new Date(comment.createdAt).toLocaleString('ko-KR')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTargetCommentId(comment.id);
                        setEditTarget(null);
                        setCommentInput('');
                      }}
                      className="typo-body-3-medium text-label-default"
                    >
                      답글
                    </button>
                    {comment.isMine && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditComment(comment)}
                          className="typo-body-3-medium text-label-default"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          className="typo-body-3-medium text-negative"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="mt-1 typo-body-2-regular text-label-default">{comment.content}</p>
                {comment.replies.map(renderReply)}
              </div>
            ))
          )}

          {hasNextPage && (
            <div className="p-4">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full rounded-8 border border-border-default py-2 typo-body-2-medium text-label-default"
              >
                {isFetchingNextPage ? '불러오는 중...' : '댓글 더보기'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border-default p-3">
        {(replyTargetCommentId || editTarget) && (
          <div className="mb-2 flex items-center justify-between rounded-8 bg-alternative px-3 py-2">
            <p className="typo-body-3-regular text-label-info">
              {editTarget ? '댓글 수정 중' : `답글 작성 중 (#${replyTargetCommentId})`}
            </p>
            <button
              type="button"
              className="typo-body-3-medium text-label-default"
              onClick={() => {
                setReplyTargetCommentId(null);
                setEditTarget(null);
                setCommentInput('');
              }}
            >
              취소
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="flex-1 rounded-8 border border-border-default px-3 py-2 typo-body-2-regular"
          />
          <button
            type="button"
            onClick={handleCommentSubmit}
            disabled={createCommentMutation.isPending || updateCommentMutation.isPending}
            className="rounded-8 bg-label-default text-static-white px-4 typo-body-2-medium disabled:opacity-40"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
