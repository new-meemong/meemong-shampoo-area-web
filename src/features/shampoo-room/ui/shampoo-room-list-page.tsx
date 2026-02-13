'use client';

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { SiteHeader } from '@/widgets/header';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';

import {
  createShampooRoomRead,
  createShampooRoomView,
  getShampooRooms,
} from '../api';
import type { ShampooRoomCategory, ShampooRoomListItem } from '../types';

type CategoryTab = 'FREE' | 'POPULAR' | 'EDUCATION' | 'PRODUCT' | 'MARKET';
type FilterTab = 'NONE' | 'MINE' | 'COMMENTED' | 'LIKED' | 'REGION';

const CATEGORY_TABS: Array<{ label: string; value: CategoryTab }> = [
  { label: '자유글', value: 'FREE' },
  { label: '인기글', value: 'POPULAR' },
  { label: '교육', value: 'EDUCATION' },
  { label: '제품', value: 'PRODUCT' },
  { label: '사고팔고', value: 'MARKET' },
];

const FILTER_TABS: Array<{ label: string; value: FilterTab }> = [
  { label: '내 글', value: 'MINE' },
  { label: '댓글 단', value: 'COMMENTED' },
  { label: '추천', value: 'LIKED' },
  { label: '지역', value: 'REGION' },
];

const categoryToApi = (category: CategoryTab): ShampooRoomCategory | undefined => {
  if (category === 'POPULAR') return undefined;
  return category;
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

  const handlePostClick = async (post: ShampooRoomListItem) => {
    await markView(post.id.toString());
    try {
      await markRead(post.id.toString());
    } catch {
      // 로그인하지 않은 경우 read API 실패 가능
    }

    push(`/posts/${post.id}`);
  };

  return (
    <div className="min-w-[375px] w-full h-screen mx-auto flex flex-col bg-white">
      <SiteHeader title="샴푸실" />

      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategoryTab(tab.value)}
              className={`shrink-0 rounded-8 border px-3 py-2 typo-body-2-medium ${
                categoryTab === tab.value
                  ? 'bg-label-default text-static-white border-label-default'
                  : 'bg-white text-label-default border-border-default'
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
                className={`shrink-0 rounded-8 border px-3 py-1.5 typo-body-3-medium ${
                  selected
                    ? 'bg-focused text-label-default border-focused'
                    : 'bg-white text-label-info border-border-default'
                }`}
              >
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

      <div className="flex-1 overflow-y-auto border-t border-border-default">
        {isLoading ? (
          <div className="p-5 typo-body-2-regular text-label-info">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="p-5 typo-body-2-regular text-label-info">게시글이 없습니다.</div>
        ) : (
          <div>
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => handlePostClick(post)}
                className="w-full text-left px-5 py-4 border-b border-border-default"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="typo-body-3-medium text-label-info">
                    {post.user.name} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="typo-body-3-medium text-label-info">{post.category}</p>
                </div>
                <p className="mt-1 typo-body-1-medium text-label-default line-clamp-1">{post.title}</p>
                <p className="mt-1 typo-body-2-regular text-label-info line-clamp-2">{post.content}</p>
                <p className="mt-2 typo-body-3-regular text-label-info">
                  좋아요 {post.likeCount} · 댓글 {post.commentCount} · 조회 {post.viewCount}
                </p>
              </button>
            ))}
            {hasNextPage && (
              <div className="p-4">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full rounded-8 border border-border-default py-2 typo-body-2-medium text-label-default"
                >
                  {isFetchingNextPage ? '불러오는 중...' : '더보기'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="fixed right-5 bottom-5 rounded-full px-4 py-3 bg-label-default text-static-white typo-body-2-semibold"
        onClick={() => push('/posts/create')}
      >
        글쓰기
      </button>
    </div>
  );
}
