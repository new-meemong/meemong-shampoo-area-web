'use client';

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';

import { createShampooRoomRead, createShampooRoomView, getShampooRooms } from '../api';
import type { ShampooRoomCategory, ShampooRoomListItem } from '@/entities/shampoo-room';

export type CategoryTab = 'FREE' | 'POPULAR' | 'EDUCATION' | 'PRODUCT' | 'MARKET';
export type FilterTab = 'NONE' | 'MINE' | 'COMMENTED' | 'LIKED' | 'REGION';

const categoryToApi = (category: CategoryTab): ShampooRoomCategory | undefined => {
  if (category === 'POPULAR') return undefined;
  return category;
};

export function useShampooRoomListPage() {
  const { push } = useRouterWithUser();

  const [categoryTab, setCategoryTab] = useState<CategoryTab>('FREE');
  const [filterTab, setFilterTab] = useState<FilterTab>('NONE');
  const [regionInput, setRegionInput] = useState('');

  const { mutateAsync: markView } = useMutation({ mutationFn: createShampooRoomView });
  const { mutateAsync: markRead } = useMutation({ mutationFn: createShampooRoomRead });

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

  const handlePostClick = useCallback(
    async (post: ShampooRoomListItem) => {
      await markView(post.id.toString());
      try {
        await markRead(post.id.toString());
      } catch {
        // 로그인하지 않은 경우 read API 실패 가능
      }

      push(`/posts/${post.id}`);
    },
    [markRead, markView, push],
  );

  const observerTargetIndex = posts.length <= 1 ? 0 : posts.length - 2;

  return {
    categoryTab,
    setCategoryTab,
    filterTab,
    setFilterTab,
    regionInput,
    setRegionInput,
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    observerRef,
    observerTargetIndex,
    handlePostClick,
    push,
  };
}
