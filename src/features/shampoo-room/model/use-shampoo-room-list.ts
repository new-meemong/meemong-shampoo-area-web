'use client';

import type { ShampooRoomCategory, ShampooRoomListItem } from '@/entities/shampoo-room';
import { createShampooRoomRead, createShampooRoomView, getShampooRooms } from '../api';
import { normalizeSource, openInAppWebView } from '@/shared/lib/app-bridge';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import useSelectedRegion, {
  convertSelectedRegionToAddresses,
  getSelectedRegionLabel,
} from './use-selected-region';

import { ROUTES } from '@/shared';
import { SEARCH_PARAMS } from '@/shared/constants/search-params';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';
import { useSearchParams } from 'next/navigation';

export type CategoryTab = 'FREE' | 'POPULAR' | 'EDUCATION' | 'PRODUCT' | 'MARKET';
export type FilterTab = 'NONE' | 'MINE' | 'COMMENTED' | 'LIKED' | 'REGION';

const categoryToApi = (category: CategoryTab): ShampooRoomCategory | undefined => {
  if (category === 'POPULAR') return undefined;
  return category;
};

export function useShampooRoomList() {
  const { push } = useRouterWithUser();
  const searchParams = useSearchParams();
  const source = normalizeSource(searchParams.get(SEARCH_PARAMS.SOURCE));
  const { userSelectedRegionData, setSelectedRegionData } = useSelectedRegion();

  const [categoryTab, setCategoryTab] = useState<CategoryTab>('FREE');
  const [filterTab, setFilterTab] = useState<FilterTab>('NONE');

  const { mutateAsync: markView } = useMutation({ mutationFn: createShampooRoomView });
  const { mutateAsync: markRead } = useMutation({ mutationFn: createShampooRoomRead });

  useEffect(() => {
    if (!userSelectedRegionData) {
      setFilterTab((prev) => (prev === 'REGION' ? 'NONE' : prev));
      return;
    }

    setFilterTab((prev) => (prev === 'NONE' ? 'REGION' : prev));
  }, [userSelectedRegionData]);

  const addresses = useMemo(() => {
    if (filterTab !== 'REGION') return undefined;
    return convertSelectedRegionToAddresses(userSelectedRegionData);
  }, [filterTab, userSelectedRegionData]);

  const selectedRegionLabel = useMemo(
    () => getSelectedRegionLabel(userSelectedRegionData),
    [userSelectedRegionData],
  );

  const hasSelectedRegion = !!userSelectedRegionData;

  const handleFilterTabClick = useCallback(
    (tab: FilterTab) => {
      if (tab === 'REGION') {
        push(ROUTES.POSTS_SELECT_REGION);
        return;
      }

      if (userSelectedRegionData) {
        setSelectedRegionData(null);
      }

      setFilterTab((prev) => (prev === tab ? 'NONE' : tab));
    },
    [push, setSelectedRegionData, userSelectedRegionData],
  );

  const handleClearSelectedRegion = useCallback(() => {
    setSelectedRegionData(null);
    setFilterTab((prev) => (prev === 'REGION' ? 'NONE' : prev));
  }, [setSelectedRegionData]);

  const handleWritePostClick = useCallback(() => {
    if (source === 'app') {
      const opened = openInAppWebView('/shampoo-area/posts/create');
      if (opened) {
        return;
      }
    }

    push('/posts/create');
  }, [push, source]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['shampoo-rooms', categoryTab, filterTab, addresses?.join(',')],
    queryFn: ({ pageParam }) =>
      getShampooRooms({
        __nextCursor: pageParam,
        __limit: 20,
        category: categoryToApi(categoryTab),
        isPopular: categoryTab === 'POPULAR' ? true : undefined,
        isMine: filterTab === 'MINE' ? true : undefined,
        isMineComment: filterTab === 'COMMENTED' ? true : undefined,
        isLiked: filterTab === 'LIKED' ? true : undefined,
        addresses,
      }),
    getNextPageParam: (lastPage) => lastPage.__nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const posts = useMemo(() => data?.pages.flatMap((page) => page.dataList) ?? [], [data?.pages]);

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
    (post: ShampooRoomListItem) => {
      // 조회수/읽음 처리는 fire-and-forget으로 실행 (실패해도 페이지 이동에 영향 없음)
      markView(post.id.toString()).catch(() => {});
      markRead(post.id.toString()).catch(() => {});

      if (source === 'app') {
        const opened = openInAppWebView(`/shampoo-area/posts/${post.id}`);
        if (opened) {
          return;
        }
      }

      push(`/posts/${post.id}`);
    },
    [markRead, markView, push, source],
  );

  const observerTargetIndex = posts.length <= 1 ? 0 : posts.length - 2;

  return {
    categoryTab,
    setCategoryTab,
    filterTab,
    hasSelectedRegion,
    selectedRegionLabel,
    handleFilterTabClick,
    handleClearSelectedRegion,
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    observerRef,
    observerTargetIndex,
    handlePostClick,
    handleWritePostClick,
    push,
  };
}
