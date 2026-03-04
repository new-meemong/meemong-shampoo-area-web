'use client';

import { useEffect, useState } from 'react';

import { Button, Separator } from '@/shared';
import type { SelectedRegion } from '@/shared/lib/auth';
import { useRouterWithUser } from '@/shared/hooks/use-router-with-user';
import { SiteHeader } from '@/shared/ui/site-header';

import { ALL_OPTION, REGIONS } from '../constants/region';
import useSelectedRegion from '../model/use-selected-region';
import RegionTabs from './components/region-tabs';
import SelectedRegionItem from './components/selected-region-item';

const MAX_SELECTED_VALUES = 3;

export default function ShampooRoomSelectRegion() {
  const { userSelectedRegionData, setSelectedRegionData } = useSelectedRegion();
  const { back } = useRouterWithUser();

  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(userSelectedRegionData);

  useEffect(() => {
    setSelectedRegion(userSelectedRegionData);
  }, [userSelectedRegionData]);

  const handleSelectKey = (key: string) => {
    setSelectedRegion({ key, values: [ALL_OPTION] });
  };

  const options = selectedRegion ? [ALL_OPTION, ...REGIONS[selectedRegion.key as keyof typeof REGIONS]] : [];

  const handleSelectValue = (value: string) => {
    setSelectedRegion((prev) => {
      if (!prev) return prev;

      const selectedAllOption = prev.values.includes(ALL_OPTION);

      if (value === ALL_OPTION) {
        return { ...prev, values: selectedAllOption ? [] : [ALL_OPTION] };
      }

      if (prev.values.includes(value)) {
        return { ...prev, values: prev.values.filter((v) => v !== value && v !== ALL_OPTION) };
      }

      if (prev.values.length >= MAX_SELECTED_VALUES) return prev;

      return { ...prev, values: [...prev.values.filter((v) => v !== ALL_OPTION), value] };
    });
  };

  const handleDeleteValue = (value: string) => {
    setSelectedRegion((prev) => {
      if (!prev) return prev;

      return { ...prev, values: prev.values.filter((v) => v !== value) };
    });
  };

  const handleSubmit = () => {
    const nextRegion = selectedRegion && selectedRegion.values.length > 0 ? selectedRegion : null;

    setSelectedRegionData(nextRegion);
    back();
  };

  return (
    <div className="min-w-[375px] w-full mx-auto flex flex-col h-screen bg-white">
      <SiteHeader title="게시글 지역" showBackButton />
      <div className="flex flex-col px-5 py-10 gap-2">
        <p className="typo-title-3-semibold text-label-default">검색할 지역을 선택해주세요</p>
        <p className="typo-body-1-regular text-label-sub">도 단위 1개 혹은 구 단위 3개까지 선택할 수 있습니다.</p>
      </div>

      <Separator />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <RegionTabs
          regionKey={selectedRegion?.key ?? ''}
          regionOptions={options}
          selectedRegion={selectedRegion}
          onSelectKey={handleSelectKey}
          onSelectValue={handleSelectValue}
        />
      </div>

      {selectedRegion && selectedRegion.values.length > 0 && (
        <div className="px-5 py-3 flex flex-col gap-2 bg-alternative">
          {selectedRegion.values.map((value) => (
            <SelectedRegionItem
              key={value}
              value={value}
              regionKey={selectedRegion.key}
              onDelete={handleDeleteValue}
            />
          ))}
        </div>
      )}

      <div className="px-5 pt-3 pb-6">
        <Button size="lg" className="rounded-4 w-full" onClick={handleSubmit}>
          확인
        </Button>
      </div>
    </div>
  );
}
