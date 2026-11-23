import React from 'react';
import { toEasternArabic, normalizeToWestern } from '../utils/arabicNumbers';

interface FractionProps {
  num: number | string;
  den: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Fraction: React.FC<FractionProps> = ({ num, den, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-sm min-w-[1.5rem]',
    md: 'text-lg min-w-[2rem]',
    lg: 'text-xl min-w-[2.4rem]',
  }[size];

  return (
    <span
      className={`inline-flex flex-col items-center justify-center align-middle leading-none tabular-nums select-none ${sizeClasses} ${className}`}
    >
      <span className="px-1 pb-0.5 font-semibold">{toEasternArabic(num)}</span>
      <span className="w-full h-[1.5px] bg-current opacity-80" />
      <span className="px-1 pt-0.5 font-semibold">{toEasternArabic(den)}</span>
    </span>
  );
};

interface MixedNumberProps {
  whole: number | string;
  num: number | string;
  den: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MixedNumber: React.FC<MixedNumberProps> = ({
  whole,
  num,
  den,
  size = 'md',
  className = '',
}) => {
  const wholeSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 align-middle tabular-nums ${className}`} dir="rtl">
      <span className={`font-bold ${wholeSize}`}>{toEasternArabic(whole)}</span>
      <Fraction num={num} den={den} size={size} />
    </span>
  );
};

interface ArabicNumberInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}

export const ArabicNumberInput: React.FC<ArabicNumberInputProps> = ({
  value,
  onChange,
  placeholder = '؟',
  ariaLabel,
  className = '',
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = normalizeToWestern(e.target.value).replace(/[^\d]/g, '');
    if (raw.length <= 3) {
      onChange(raw === '' ? '' : toEasternArabic(raw));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-12 h-9 text-center font-semibold text-base rounded-lg border border-stone-300 bg-white text-[#1C2430] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] tabular-nums transition-colors ${className}`}
    />
  );
};

interface FractionInputProps {
  numValue: string;
  denValue: string;
  onNumChange: (val: string) => void;
  onDenChange: (val: string) => void;
  wholeValue?: string;
  onWholeChange?: (val: string) => void;
  showWhole?: boolean;
  labelPrefix?: string;
  disabled?: boolean;
}

export const FractionInput: React.FC<FractionInputProps> = ({
  numValue,
  denValue,
  onNumChange,
  onDenChange,
  wholeValue = '',
  onWholeChange,
  showWhole = false,
  labelPrefix = 'الإجابة',
  disabled = false,
}) => {
  return (
    <div className="inline-flex items-center gap-2 align-middle" dir="rtl">
      {showWhole && onWholeChange && (
        <ArabicNumberInput
          value={wholeValue}
          onChange={onWholeChange}
          ariaLabel={`${labelPrefix} - العدد الصحيح`}
          className="w-11 h-11 text-lg font-bold"
          disabled={disabled}
        />
      )}
      <div className="inline-flex flex-col items-center gap-1">
        <ArabicNumberInput
          value={numValue}
          onChange={onNumChange}
          ariaLabel={`${labelPrefix} - البسط`}
          disabled={disabled}
        />
        <span className="w-14 h-[2px] bg-[#1C2430] rounded-full" />
        <ArabicNumberInput
          value={denValue}
          onChange={onDenChange}
          ariaLabel={`${labelPrefix} - المقام`}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
