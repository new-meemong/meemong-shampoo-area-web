import CloseIcon from '@/assets/icons/close.svg';

type SelectedRegionItemProps = {
  regionKey: string;
  value: string;
  onDelete: (value: string) => void;
};

export default function SelectedRegionItem({ regionKey, value, onDelete }: SelectedRegionItemProps) {
  return (
    <div className="flex items-center justify-between rounded-4 border border-border-strong bg-white px-4 py-2">
      <p className="typo-body-1-regular text-label-info">{`${regionKey} > ${value}`}</p>
      <button
        type="button"
        className="inline-flex items-center justify-center"
        onClick={() => onDelete(value)}
        aria-label={`${regionKey} ${value} 삭제`}
      >
        <CloseIcon className="size-4 fill-label-info" />
      </button>
    </div>
  );
}
