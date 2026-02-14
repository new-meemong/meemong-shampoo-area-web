'use client';

import type * as React from 'react';

import EditIcon from '@/assets/icons/edit.svg';
import { cn } from '@/shared/lib/utils';

interface ShampooRoomWritePostButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export default function ShampooRoomWritePostButton({
  className,
  ...props
}: ShampooRoomWritePostButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-full bg-[#222222] hover:bg-[#333333] shadow-heavy disabled:pointer-events-none w-15 h-15',
        className,
      )}
      type="button"
      {...props}
    >
      <EditIcon className="text-white" />
    </button>
  );
}
