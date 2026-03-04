'use client';

import { useEffect, useState } from 'react';

import { getUserSelectedRegionData, type SelectedRegion, updateUserSelectedRegionData } from '@/shared/lib/auth';

import { ALL_OPTION } from '../constants/region';

const toAddress = (selectedRegion: SelectedRegion, value: string) => {
  return value === ALL_OPTION ? selectedRegion.key : `${selectedRegion.key} ${value}`;
};

export const convertSelectedRegionToAddresses = (
  selectedRegion: SelectedRegion | null,
): string[] | undefined => {
  if (!selectedRegion || selectedRegion.values.length === 0) {
    return undefined;
  }

  return selectedRegion.values.map((value) => toAddress(selectedRegion, value));
};

export const getSelectedRegionLabel = (selectedRegion: SelectedRegion | null): string => {
  if (!selectedRegion || selectedRegion.values.length === 0) {
    return '지역';
  }

  const { key, values } = selectedRegion;
  const [first] = values;

  if (values.length === 1) {
    return first === ALL_OPTION ? `${key} ${ALL_OPTION}` : first;
  }

  return `${first} 외 ${values.length - 1}개`;
};

export default function useSelectedRegion() {
  const [userSelectedRegionData, setUserSelectedRegionData] = useState<SelectedRegion | null>(null);

  useEffect(() => {
    setUserSelectedRegionData(getUserSelectedRegionData());
  }, []);

  const setSelectedRegionData = (selectedRegion: SelectedRegion | null) => {
    updateUserSelectedRegionData(selectedRegion);
    setUserSelectedRegionData(selectedRegion);
  };

  return { userSelectedRegionData, setSelectedRegionData };
}
