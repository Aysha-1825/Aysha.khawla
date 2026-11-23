import React, { useState } from 'react';
import { toEasternArabic } from '../utils/arabicNumbers';
import { Fraction } from './FractionMath';

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSector(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

// ١) مخطط الفطيرتين في النشاط الافتتاحي (شمال الشرقية)
export const OpeningPiesVisual: React.FC = () => {
  const [highlightMode, setHighlightMode] = useState<'remaining' | 'eaten'>('eaten');

  const renderPie = (totalSlices: number, remainingCount: number, title: string) => {
    const step = 360 / totalSlices;
    const eatenCount = totalSlices - remainingCount;
    return (
      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
        <span className="text-sm font-bold text-[#1C2430]">{title}</span>
        <svg viewBox="0 0 140 140" className="w-32 h-32">
          <circle cx="70" cy="70" r="62" fill="#FFFFFF" stroke="#D6D3CD" strokeWidth="2" />
          {Array.from({ length: totalSlices }).map((_, idx) => {
            const isRemaining = idx < remainingCount;
            const start = idx * step;
            const end = (idx + 1) * step;
            let fill = '#F5F4F0';
            if (isRemaining) {
              fill = highlightMode === 'remaining' ? '#D97706' : '#FCD34D';
            } else {
              fill = highlightMode === 'eaten' ? '#0F766E' : '#F3F4F6';
            }
            return (
              <path
                key={idx}
                d={describeSector(70, 70, 58, start, end)}
                fill={fill}
                fillOpacity={isRemaining ? (highlightMode === 'remaining' ? 0.9 : 0.45) : highlightMode === 'eaten' ? 0.22 : 0.5}
                stroke="#475569"
                strokeWidth="1.2"
              />
            );
          })}
          {/* حافة القشرة للقطع المتبقية */}
          {Array.from({ length: remainingCount }).map((_, idx) => {
            const start = idx * step;
            const end = (idx + 1) * step;
            const p1 = polarToCartesian(70, 70, 56, start);
            const p2 = polarToCartesian(70, 70, 56, end);
            return (
              <path
                key={`crust-${idx}`}
                d={`M ${p1.x} ${p1.y} A 56 56 0 0 1 ${p2.x} ${p2.y}`}
                fill="none"
                stroke="#B45309"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="text-xs text-[#526071] flex items-center gap-2">
          <span>
            {highlightMode === 'eaten' ? 'الأجزاء المأكولة:' : 'الأجزاء المتبقية:'}
          </span>
          <Fraction
            num={highlightMode === 'eaten' ? eatenCount : remainingCount}
            den={totalSlices}
            size="sm"
            className="text-[#0F766E]"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#526071]">
          بدّل العرض للمقارنة بين الأجزاء المتبقية في الصورة والأجزاء التي تم أكلها:
        </span>
        <div className="inline-flex items-center p-1 rounded-lg bg-stone-100 border border-stone-200">
          <button
            type="button"
            onClick={() => setHighlightMode('eaten')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              highlightMode === 'eaten'
                ? 'bg-white text-[#0F766E] shadow-xs'
                : 'text-[#526071] hover:text-[#1C2430]'
            }`}
          >
            تظليل الأجزاء المأكولة
          </button>
          <button
            type="button"
            onClick={() => setHighlightMode('remaining')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              highlightMode === 'remaining'
                ? 'bg-white text-[#B45309] shadow-xs'
                : 'text-[#526071] hover:text-[#1C2430]'
            }`}
          >
            الأجزاء المتبقية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderPie(8, 3, 'فطيرة ١ (مقسمة إلى ٨ أجزاء)')}
        {renderPie(6, 1, 'فطيرة ٢ (مقسمة إلى ٦ أجزاء)')}
      </div>
    </div>
  );
};

// ٢) مخطط توضيح الخطأ الشائع من ملاحظات المعلم: ١/٢ + ١/٣ = ٥/٦ وليس ٢/٥
export const CommonErrorBarDiagram: React.FC = () => {
  const [unified, setUnified] = useState(true);

  return (
    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-[#1C2430]">
            تنبيه الخطأ الشائع (مخطط توضيحي): لماذا{' '}
            <span className="text-[#0F766E]">
              <Fraction num={1} den={2} size="sm" /> + <Fraction num={1} den={3} size="sm" /> ={' '}
              <Fraction num={5} den={6} size="sm" />
            </span>{' '}
            وليس <span className="text-[#BE123C]"><Fraction num={2} den={5} size="sm" /></span>؟
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setUnified((v) => !v)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#0F766E]/30 bg-white text-[#0F766E] hover:bg-[#0F766E]/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {unified ? 'عرض الأجزاء قبل التوحيد' : 'توحيد المقام إلى أجزاء متساوية (٦)'}
        </button>
      </div>

      <div className="space-y-2.5" dir="rtl">
        {/* ١/٢ */}
        <div className="flex items-center gap-3">
          <div className="w-12 text-center">
            <Fraction num={unified ? 3 : 1} den={unified ? 6 : 2} size="sm" className="text-[#0F766E]" />
          </div>
          <div className="flex-1 grid gap-1 h-8" style={{ gridTemplateColumns: `repeat(${unified ? 6 : 2}, minmax(0, 1fr))` }}>
            {Array.from({ length: unified ? 6 : 2 }).map((_, i) => {
              const filled = unified ? i < 3 : i < 1;
              return (
                <div
                  key={i}
                  className={`rounded border flex items-center justify-center text-xs font-semibold tabular-nums transition-colors ${
                    filled
                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                      : 'bg-white text-stone-400 border-stone-200'
                  }`}
                >
                  {toEasternArabic(i + 1)}
                </div>
              );
            })}
          </div>
        </div>

        {/* ١/٣ */}
        <div className="flex items-center gap-3">
          <div className="w-12 text-center">
            <Fraction num={unified ? 2 : 1} den={unified ? 6 : 3} size="sm" className="text-[#B45309]" />
          </div>
          <div className="flex-1 grid gap-1 h-8" style={{ gridTemplateColumns: `repeat(${unified ? 6 : 3}, minmax(0, 1fr))` }}>
            {Array.from({ length: unified ? 6 : 3 }).map((_, i) => {
              const filled = unified ? i < 2 : i < 1;
              return (
                <div
                  key={i}
                  className={`rounded border flex items-center justify-center text-xs font-semibold tabular-nums transition-colors ${
                    filled
                      ? 'bg-[#D97706] text-white border-[#D97706]'
                      : 'bg-white text-stone-400 border-stone-200'
                  }`}
                >
                  {toEasternArabic(i + 1)}
                </div>
              );
            })}
          </div>
        </div>

        {/* المجموع ٥/٦ */}
        {unified && (
          <div className="flex items-center gap-3 pt-1 border-t border-stone-200">
            <div className="w-12 text-center">
              <Fraction num={5} den={6} size="sm" className="text-[#1C2430]" />
            </div>
            <div className="flex-1 grid grid-cols-6 gap-1 h-8">
              {Array.from({ length: 6 }).map((_, i) => {
                const bg = i < 3 ? 'bg-[#0F766E] text-white border-[#0F766E]' : i < 5 ? 'bg-[#D97706] text-white border-[#D97706]' : 'bg-white text-stone-400 border-stone-200';
                return (
                  <div
                    key={i}
                    className={`rounded border flex items-center justify-center text-xs font-semibold tabular-nums ${bg}`}
                  >
                    {toEasternArabic(i + 1)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-[#526071] leading-relaxed">
        لا يمكن جمع البسط والمقام مباشرة لأن حجم الجزء في النصف يختلف عن حجم الجزء في الثلث؛ وعند توحيد المقام إلى{' '}
        <span className="font-bold text-[#1C2430]">٦</span> تصبح{' '}
        <span className="font-semibold">٣/٦ + ٢/٦ = ٥/٦</span>.
      </p>
    </div>
  );
};

// ٣) فطائر التفاح الأربع (تمرين ٢ - محافظة الظاهرة)
export const ApplePiesVisual: React.FC = () => {
  const pies = [
    { id: 1, eaten: 8 },
    { id: 2, eaten: 8 },
    { id: 3, eaten: 8 },
    { id: 4, eaten: 5 }, // ٣ قطع لم تؤكل من ٨
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {pies.map((pie) => (
        <div
          key={pie.id}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#FAF9F6] border border-stone-200"
        >
          <svg viewBox="0 0 120 120" className="w-24 h-24">
            <circle cx="60" cy="60" r="52" fill="#FFFFFF" stroke="#D6D3CD" strokeWidth="1.5" />
            {Array.from({ length: 8 }).map((_, idx) => {
              const isEaten = idx < pie.eaten;
              const start = idx * 45;
              const end = (idx + 1) * 45;
              return (
                <path
                  key={idx}
                  d={describeSector(60, 60, 49, start, end)}
                  fill={isEaten ? '#0F766E' : '#FDE68A'}
                  fillOpacity={isEaten ? 0.16 : 0.9}
                  stroke="#78716C"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
          <span className="text-xs font-semibold text-[#1C2430] tabular-nums">
            فطيرة {toEasternArabic(pie.id)}
          </span>
          <span className="text-[11px] text-[#526071] tabular-nums">
            {pie.eaten === 8 ? 'أُكلت بالكامل (٨/٨)' : 'تبقّت ٣ قطع (أُكل ٥/٨)'}
          </span>
        </div>
      ))}
    </div>
  );
};
