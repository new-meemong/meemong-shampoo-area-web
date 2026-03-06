'use client';

import {
  getAnonymousDisplayName,
  type ShampooRoomComment,
  type ShampooRoomCommentReply,
} from '@/entities/shampoo-room';
import { closeAppWebView, normalizeSource } from '@/shared/lib/app-bridge';

import CommentIcon from '@/assets/icons/comment.svg';
import HeartIcon from '@/assets/icons/mdi_heart.svg';
import MoreHorizontalIcon from '@/assets/icons/more-horizontal.svg';
import Checkbox from '@/shared/ui/checkbox';
import LockIcon from '@/assets/icons/lock.svg';
import { MoreOptionsMenu } from '@/shared/ui/more-options-menu';
import ProfileIcon from '@/assets/icons/profile.svg';
import ReplyIcon from '@/assets/icons/reply.svg';
import { SEARCH_PARAMS } from '@/shared/constants/search-params';
import ShareIcon from '@/assets/icons/share.svg';
import { SiteHeader } from '@/shared/ui/site-header';
import formatDateTime from '@/shared/lib/formatDateTime';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useShampooRoomDetail } from '../model/use-shampoo-room-detail';

type ShampooRoomDetailProps = {
  postId: string;
};

export default function ShampooRoomDetail({ postId }: ShampooRoomDetailProps) {
  const { back, push, replace } = useRouterWithUser();
  const searchParams = useSearchParams();
  const source = normalizeSource(searchParams.get(SEARCH_PARAMS.SOURCE));
  const isSharedView = searchParams.get(SEARCH_PARAMS.VIEW) === 'shared';
  const {
    detail,
    isLoading,
    comments,
    hasNextPage,
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
  } = useShampooRoomDetail(postId, { isSharedView });

  const handleShare = async () => {
    const shareUrl = new URL(window.location.origin + window.location.pathname);
    shareUrl.searchParams.set(SEARCH_PARAMS.VIEW, 'shared');
    const shareUrlString = shareUrl.toString();

    if (navigator.share) {
      await navigator.share({ url: shareUrlString, title: detail?.title ?? '샴푸실 게시글' });
      return;
    }

    await navigator.clipboard.writeText(shareUrlString);
    alert('링크가 복사되었습니다.');
  };

  const getDisplayName = (name: string) => {
    if (!isSharedView) {
      return name;
    }

    return name === '글쓴이' ? '익명' : name;
  };

  const startEditComment = (comment: ShampooRoomComment | ShampooRoomCommentReply) => {
    setEditTarget({ id: comment.id, content: comment.content });
    setCommentInput(comment.content);
    setIsSecretComment(comment.isSecret);
    setReplyTargetCommentId(null);
  };

  const canViewCommentContent = (comment: ShampooRoomComment) =>
    !comment.isSecret || !!detail?.isMine || comment.isMine;

  const canViewReplyContent = (reply: ShampooRoomCommentReply, parentComment: ShampooRoomComment) =>
    !reply.isSecret || !!detail?.isMine || parentComment.isMine || reply.isMine;

  const canReplyToComment = (comment: ShampooRoomComment) => {
    if (!comment.isSecret) return true;
    return !!detail?.isMine || comment.isMine;
  };

  useEffect(() => {
    if (!replyTargetCommentId) return;

    const targetComment = comments.find((comment) => comment.id === replyTargetCommentId);
    if (!targetComment) return;

    const canReply = !targetComment.isSecret || !!detail?.isMine || targetComment.isMine;

    if (!canReply) {
      setReplyTargetCommentId(null);
    }
  }, [comments, detail?.isMine, replyTargetCommentId, setReplyTargetCommentId]);

  const renderReply = (reply: ShampooRoomCommentReply, parentComment: ShampooRoomComment) => (
    <div key={reply.id} className="flex gap-3 p-5 bg-alternative rounded-6">
      <ReplyIcon className="size-4.5 fill-label-strong shrink-0 mt-1" />
      {!canViewReplyContent(reply, parentComment) ? (
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <p className="typo-body-2-regular text-label-info">비밀댓글입니다</p>
            <LockIcon className="size-3.5 fill-label-placeholder" />
          </div>
          <p className="typo-body-3-regular text-label-info">{formatDateTime(reply.createdAt)}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ProfileIcon className="size-8 rounded-6 bg-label-default" />
              <p
                className={`typo-body-1-semibold ${reply.isMine ? 'text-negative-light' : 'text-label-default'}`}
              >
                {getDisplayName(getAnonymousDisplayName(reply.user))}
              </p>
              {reply.isSecret && <LockIcon className="size-3.5 fill-label-placeholder" />}
            </div>
            {!isSharedView && reply.isMine && (
              <MoreOptionsMenu
                trigger={<MoreHorizontalIcon className="size-6" />}
                options={[
                  { label: '수정하기', onClick: () => startEditComment(reply) },
                  {
                    label: '삭제하기',
                    onClick: () => deleteCommentMutation.mutate(reply.id),
                    className: 'text-negative',
                  },
                ]}
                contentClassName="-right-[14px]"
              />
            )}
          </div>
          <p className="typo-body-1-long-regular text-label-default">{reply.content}</p>
          <p className="typo-body-3-regular text-label-info">
            {formatDateTime(reply.createdAt)}
            {reply.isEdited ? ' · 수정됨' : ''}
          </p>
        </div>
      )}
    </div>
  );

  if (isLoading || !detail) {
    return <div className="p-5 typo-body-2-regular text-label-info">불러오는 중...</div>;
  }

  const handleBackClick = () => {
    if (source === 'app') {
      const closed = closeAppWebView('close');
      if (closed) return;
    }
    back();
  };

  const handleEditPostClick = () => {
    push(`/posts/edit/${detail.id}`);
  };

  const moreOptions = [
    { label: '수정하기', onClick: handleEditPostClick },
    {
      label: '삭제하기',
      onClick: () => {
        if (confirm('게시글을 삭제할까요?')) {
          deletePostMutation.mutate(undefined, {
            onSuccess: () => replace('/posts'),
          });
        }
      },
      className: 'text-negative',
    },
  ];

  return (
    <div className="min-w-[375px] w-full h-screen mx-auto bg-white flex flex-col">
      <SiteHeader
        title="샴푸실"
        showBackButton
        onBackClick={handleBackClick}
        rightComponent={
          !isSharedView && detail.isMine ? (
            <MoreOptionsMenu
              trigger={<MoreHorizontalIcon className="size-6" />}
              options={moreOptions}
              triggerClassName="size-10 rounded-4 flex items-center justify-center"
              contentClassName="-right-[14px]"
            />
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <ProfileIcon className="size-10 rounded-6 bg-label-default" />
              <div className="flex flex-col">
                <p
                  className={`typo-body-1-semibold ${detail.isMine ? 'text-negative-light' : 'text-label-default'}`}
                >
                  {getDisplayName(getAnonymousDisplayName(detail.user))}
                </p>
                <p className="typo-body-3-regular text-label-info">
                  {formatDateTime(detail.createdAt)}
                  {detail.isEdited ? ' · 수정됨' : ''}
                </p>
              </div>
            </div>
          </div>
          <h1 className="mt-2 typo-title-3-semibold text-label-default">{detail.title}</h1>
          <p className="mt-3 whitespace-pre-wrap typo-body-1-long-regular text-label-default">
            {detail.content}
          </p>

          {detail.images.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
              {detail.images.map((image, index) => (
                <div
                  key={`${image.imageUrl}-${index}`}
                  className="size-[140px] shrink-0 rounded-6 overflow-hidden border border-border-default"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt="게시글 이미지"
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {!isSharedView && (
          <div className="px-5 py-3 flex items-center justify-around">
            <button
              type="button"
              onClick={() => likeMutation.mutate()}
              className={`inline-flex items-center gap-1 typo-body-2-medium ${
                detail.isLiked ? 'text-negative' : 'text-label-info'
              }`}
            >
              <HeartIcon
                className={`size-5 ${detail.isLiked ? 'fill-negative-light' : 'fill-label-info'}`}
              />
              {detail.likeCount}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 typo-body-2-medium text-label-info"
            >
              <CommentIcon className="size-5 fill-label-info" />
              {detail.commentCount}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 typo-body-2-medium text-label-info"
            >
              <ShareIcon className="size-5 fill-label-info" />
              공유
            </button>
          </div>
        )}
        <div className="w-full h-1.5 bg-alternative" />

        <div>
          {comments.length === 0 ? (
            <p className="p-5 typo-body-2-regular text-label-info">댓글이 없습니다.</p>
          ) : (
            comments.map((comment, index) => (
              <div
                key={comment.id}
                ref={hasNextPage && index === observerTargetIndex ? observerRef : undefined}
                className="p-5 border-b border-border-default"
              >
                {canViewCommentContent(comment) ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ProfileIcon className="size-8 rounded-6 bg-label-default" />
                        <p
                          className={`typo-body-1-semibold ${comment.isMine ? 'text-negative-light' : 'text-label-default'}`}
                        >
                          {getDisplayName(getAnonymousDisplayName(comment.user))}
                        </p>
                        {comment.isSecret && (
                          <LockIcon className="size-3.5 fill-label-placeholder" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!isSharedView && canReplyToComment(comment) && (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTargetCommentId(comment.id);
                              setEditTarget(null);
                              setIsSecretComment(false);
                              setCommentInput('');
                            }}
                            className="typo-body-2-medium text-label-info"
                          >
                            답글
                          </button>
                        )}
                        {!isSharedView && comment.isMine && (
                          <MoreOptionsMenu
                            trigger={<MoreHorizontalIcon className="size-6" />}
                            options={[
                              { label: '수정하기', onClick: () => startEditComment(comment) },
                              {
                                label: '삭제하기',
                                onClick: () => deleteCommentMutation.mutate(comment.id),
                                className: 'text-negative',
                              },
                            ]}
                            contentClassName="-right-[14px]"
                          />
                        )}
                      </div>
                    </div>
                    <p className="mt-3 typo-body-1-long-regular text-label-default">
                      {comment.content}
                    </p>
                    <p className="mt-2 typo-body-3-regular text-label-info">
                      {formatDateTime(comment.createdAt)}
                      {comment.isEdited ? ' · 수정됨' : ''}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                      <p className="typo-body-2-regular text-label-info">비밀댓글입니다</p>
                      <LockIcon className="size-3.5 fill-label-placeholder" />
                    </div>
                    <p className="typo-body-3-regular text-label-info">
                      {formatDateTime(comment.createdAt)}
                    </p>
                  </div>
                )}
                {comment.replies.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {comment.replies.map((reply) => renderReply(reply, comment))}
                  </div>
                )}
              </div>
            ))
          )}
          {isFetchingNextPage && (
            <div className="p-4 text-center typo-body-2-regular text-label-info">
              불러오는 중...
            </div>
          )}
        </div>
      </div>

      {!isSharedView && (
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
                  setIsSecretComment(false);
                  setCommentInput('');
                }}
              >
                취소
              </button>
            </div>
          )}
          <div className="mb-2 flex justify-end">
            <div className="inline-flex items-center gap-2">
              <Checkbox
                id="comment-secret-checkbox"
                shape="square"
                checked={isSecretComment}
                onChange={(e) => setIsSecretComment(e.target.checked)}
              />
              <label
                htmlFor="comment-secret-checkbox"
                className="cursor-pointer typo-body-3-regular text-label-default"
              >
                비밀댓글
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={commentInput}
              onChange={(e) => handleCommentInputChange(e.target.value)}
              onCompositionStart={handleCommentCompositionStart}
              onCompositionEnd={handleCommentCompositionEnd}
              placeholder="댓글을 입력하세요"
              className="flex-1 rounded-6 border border-border-default px-3 py-2 typo-body-2-regular focus:outline-none focus:border-border-default"
            />
            <button
              type="button"
              onClick={handleCommentSubmit}
              disabled={
                createCommentMutation.isPending ||
                updateCommentMutation.isPending ||
                isCommentComposing ||
                isCommentInputLocked
              }
              className="rounded-6 bg-label-default text-white px-4 typo-body-2-medium disabled:opacity-40"
            >
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
