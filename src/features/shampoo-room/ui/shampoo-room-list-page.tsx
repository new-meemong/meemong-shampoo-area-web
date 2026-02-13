'use client';

import type { ComponentType, SVGProps } from 'react';
import type { ShampooRoomCategory, ShampooRoomListItem } from '../types';
import { createShampooRoomRead, createShampooRoomView, getShampooRooms } from '../api';
import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

import CommentIcon from '@/assets/icons/comment.svg';
import EyeIcon from '@/assets/icons/eye.svg';
import HeartIcon from '@/assets/icons/mdi_heart.svg';
import LocationIcon from '@/assets/icons/location.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import { WritePostButton } from '@/features/posts/ui/write-post-button';
import formatAddress from '@/features/auth/lib/format-address';
import formatDateTime from '@/shared/lib/formatDateTime';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';

type CategoryTab = 'FREE' | 'POPULAR' | 'EDUCATION' | 'PRODUCT' | 'MARKET';
type FilterTab = 'NONE' | 'MINE' | 'COMMENTED' | 'LIKED' | 'REGION';

const CATEGORY_TABS: Array<{ label: string; value: CategoryTab }> = [
  { label: '자유글', value: 'FREE' },
  { label: '인기글', value: 'POPULAR' },
  { label: '교육', value: 'EDUCATION' },
  { label: '제품', value: 'PRODUCT' },
  { label: '사고팔고', value: 'MARKET' },
];

const FILTER_TABS: Array<{
  label: string;
  value: FilterTab;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName?: string;
}> = [
  { label: '내 글', value: 'MINE', icon: ProfileIcon, iconClassName: 'fill-label-info' },
  { label: '댓글 단', value: 'COMMENTED', icon: CommentIcon, iconClassName: 'fill-positive' },
  { label: '추천', value: 'LIKED', icon: HeartIcon, iconClassName: 'fill-negative-light' },
  { label: '지역', value: 'REGION', icon: LocationIcon },
];

const categoryToApi = (category: CategoryTab): ShampooRoomCategory | undefined => {
  if (category === 'POPULAR') return undefined;
  return category;
};

const getPostAddress = (post: ShampooRoomListItem) => {
  const candidate = post as ShampooRoomListItem & {
    address?: string;
    userAddress?: string;
    user: ShampooRoomListItem['user'] & { address?: string };
  };

  return candidate.user.address ?? candidate.userAddress ?? candidate.address ?? '';
};

export default function ShampooRoomListPage() {
  const { push } = useRouterWithUser();

  const [categoryTab, setCategoryTab] = useState<CategoryTab>('FREE');
  const [filterTab, setFilterTab] = useState<FilterTab>('NONE');
  const [regionInput, setRegionInput] = useState('');

  const { mutateAsync: markView } = useMutation({
    mutationFn: createShampooRoomView,
  });
  const { mutateAsync: markRead } = useMutation({
    mutationFn: createShampooRoomRead,
  });

  const addresses = useMemo(() => {
    if (filterTab !== 'REGION') return undefined;
    return regionInput
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }, [filterTab, regionInput]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['shampoo-rooms', categoryTab, filterTab, addresses?.join(',')],
    queryFn: ({ pageParam }) =>
      getShampooRooms({
        __nextCursor: pageParam,
        __limit: 20,
        category: categoryToApi(categoryTab),
        isMine: filterTab === 'MINE' ? true : undefined,
        isLiked: filterTab === 'LIKED' ? true : undefined,
        isRead: filterTab === 'COMMENTED' ? true : undefined,
        addresses,
      }),
    getNextPageParam: (lastPage) => lastPage.__nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const posts = useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.dataList) ?? [];

    if (categoryTab === 'POPULAR') {
      return [...allPosts].sort((a, b) => b.likeCount - a.likeCount);
    }

    return allPosts;
  }, [categoryTab, data?.pages]);

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const observerRef = useIntersectionObserver({
    onIntersect: handleFetchNextPage,
    enabled: !!hasNextPage,
  });

  const handlePostClick = async (post: ShampooRoomListItem) => {
    await markView(post.id.toString());
    try {
      await markRead(post.id.toString());
    } catch {
      // 로그인하지 않은 경우 read API 실패 가능
    }

    push(`/posts/${post.id}`);
  };

  const observerTargetIndex = posts.length <= 1 ? 0 : posts.length - 2;

  return (
    <div className="min-w-[375px] w-full h-screen mx-auto flex flex-col bg-white">
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategoryTab(tab.value)}
              className={`shrink-0 rounded-6 border border-border-default px-3 py-2 typo-body-2-medium ${
                categoryTab === tab.value
                  ? 'bg-label-default text-white'
                  : 'bg-white text-label-sub'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => {
            const selected = filterTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilterTab(selected ? 'NONE' : tab.value)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border-default bg-white px-3 py-1.5 typo-body-3-medium ${
                  selected ? 'text-label-default' : 'text-label-info'
                }`}
              >
                <tab.icon
                  className={`size-4 ${
                    tab.iconClassName ?? (selected ? 'fill-label-default' : 'fill-label-info')
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {filterTab === 'REGION' && (
          <input
            value={regionInput}
            onChange={(e) => setRegionInput(e.target.value)}
            className="mt-2 w-full rounded-8 border border-border-default px-3 py-2 typo-body-2-regular"
            placeholder="지역 입력 (예: 서울, 경기도 성남시)"
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-5 typo-body-2-regular text-label-info">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="p-5 typo-body-2-regular text-label-info">게시글이 없습니다.</div>
        ) : (
          <div>
            {posts.map((post, index) => (
              <button
                key={post.id}
                ref={hasNextPage && index === observerTargetIndex ? observerRef : undefined}
                type="button"
                onClick={() => handlePostClick(post)}
                className="w-full text-left px-5 py-4 border-b border-border-default"
              >
                <div className="typo-body-2-regular text-label-info">
                  {formatDateTime(post.createdAt)} ·{' '}
                  {getPostAddress(post) ? formatAddress(getPostAddress(post)) : '-'}
                </div>
                <p className="mt-1 typo-body-1-medium text-label-strong truncate">{post.title}</p>
                <p className="mt-1 typo-body-2-long-regular text-label-info truncate">
                  {post.content}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="size-4 fill-label-info" />
                    <span className="typo-body-2-regular text-label-info">{post.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CommentIcon className="size-4 fill-label-info" />
                    <span className="typo-body-2-regular text-label-info">{post.commentCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="size-4 fill-label-info" />
                    <span className="typo-body-2-regular text-label-info">{post.viewCount}</span>
                  </div>
                </div>
              </button>
            ))}
            {isFetchingNextPage && (
              <div className="p-4 text-center typo-body-2-regular text-label-info">
                불러오는 중...
              </div>
            )}
          </div>
        )}
      </div>

      <WritePostButton className="fixed right-5 bottom-5" onClick={() => push('/posts/create')} />
    </div>
  );
}
