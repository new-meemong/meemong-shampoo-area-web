'use client';

import type { ComponentType, MouseEvent, SVGProps } from 'react';

import CommentIcon from '@/assets/icons/comment.svg';
import CloseIcon from '@/assets/icons/close.svg';
import LocationIcon from '@/assets/icons/location.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import HeartIcon from '@/assets/icons/mdi_heart.svg';

import formatAddress from '@/shared/lib/format-address';
import formatDateTime from '@/shared/lib/formatDateTime';
import { ShampooRoomCard, type ShampooRoomListItem } from '@/entities/shampoo-room';
import ShampooRoomWritePostButton from './components/shampoo-room-write-post-button';

import {
  useShampooRoomList,
  type CategoryTab,
  type FilterTab,
} from '../model/use-shampoo-room-list';

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

const getPostAddress = (post: ShampooRoomListItem) => post.user.address ?? '';

export default function ShampooRoomList() {
  const {
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
  } = useShampooRoomList();

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
            const isRegionTab = tab.value === 'REGION';
            const showRegionClear = isRegionTab && hasSelectedRegion;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleFilterTabClick(tab.value)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 typo-body-3-medium transition-colors ${
                  selected
                    ? 'bg-label-default border-label-default text-white'
                    : 'bg-white border-border-default text-label-info'
                }`}
              >
                {!showRegionClear && (
                  <tab.icon className={`size-4 ${tab.iconClassName ?? 'fill-label-info'}`} />
                )}
                {tab.value === 'REGION' ? selectedRegionLabel : tab.label}
                {showRegionClear && (
                  <CloseIcon
                    className="size-4 pl-1 fill-label-placeholder"
                    onClick={(e: MouseEvent<SVGSVGElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClearSelectedRegion();
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-5 typo-body-2-regular text-label-info">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="p-5 typo-body-2-regular text-label-info">게시글이 없습니다.</div>
        ) : (
          <div>
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={hasNextPage && index === observerTargetIndex ? observerRef : undefined}
              >
                <ShampooRoomCard
                  post={post}
                  formattedDate={formatDateTime(post.createdAt)}
                  formattedAddress={getPostAddress(post) ? formatAddress(getPostAddress(post)) : ''}
                  onClick={() => handlePostClick(post)}
                />
              </div>
            ))}
            {isFetchingNextPage && (
              <div className="p-4 text-center typo-body-2-regular text-label-info">
                불러오는 중...
              </div>
            )}
          </div>
        )}
      </div>

      <ShampooRoomWritePostButton
        className="fixed right-5 bottom-5"
        onClick={handleWritePostClick}
      />
    </div>
  );
}
