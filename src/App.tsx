import { useEffect, useState } from 'react';
import { JOURNEY_STOPS } from './data/journeyData';
import { OmanJourneyMap } from './components/OmanJourneyMap';
import { LessonStageContent } from './components/LessonStageContent';
import { GuideTab, TeacherNotesModal } from './components/TeacherNotesModal';

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [guideTab, setGuideTab] = useState<GuideTab>('notes');
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const activeStop = JOURNEY_STOPS[activeIndex];

  const handleMarkComplete = (stopId: string) => {
    setCompletedStops((prev) => ({ ...prev, [stopId]: true }));
  };

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(JOURNEY_STOPS.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setActiveIndex(0);
  };

  const openGuide = (tab: GuideTab) => {
    setGuideTab(tab);
    setGuideOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C2430]" dir="rtl">
      {quotaExceeded && (
        <div
          dir="ltr"
          className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm"
        >
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* الشريط العلوي: ٣ مناطق منضبطة */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          {/* المنطقة ١: اسم الرحلة */}
          <a
            href="#journey-stage"
            onClick={(e) => {
              e.preventDefault();
              setActiveIndex(0);
            }}
            className="font-display text-lg sm:text-xl font-extrabold text-[#1C2430] whitespace-nowrap shrink-0"
          >
            رحلة الكسور عبر محافظات عُمان
          </a>

          {/* المنطقة ٢: روابط نصية مختصرة */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#526071]">
            <button
              type="button"
              onClick={() => openGuide('criteria')}
              className="hover:text-[#0F766E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              معايير النجاح
            </button>
            <button
              type="button"
              onClick={() => openGuide('notes')}
              className="hover:text-[#0F766E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              ملاحظات المعلم
            </button>
            <button
              type="button"
              onClick={() => openGuide('resources')}
              className="hover:text-[#0F766E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              الوسائل والمصادر
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="hover:text-[#0F766E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              نقطة الانطلاق
            </button>
          </nav>

          {/* المنطقة ٣: زر الإجراء الرئيسي */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={activeIndex < JOURNEY_STOPS.length - 1 ? handleNext : handleRestart}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F766E] rounded-lg hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {activeIndex < JOURNEY_STOPS.length - 1 ? 'المحطة التالية' : 'إعادة الرحلة'}
            </button>
          </div>
        </div>
      </header>

      {/* المساحة التفاعلية الرئيسية ذات المنطقتين */}
      <main id="journey-stage" className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* المنطقة الأولى (يمين في RTL): الخريطة التفاعلية ومسار السيارة */}
          <div className="lg:col-span-5 flex flex-col">
            <OmanJourneyMap
              stops={JOURNEY_STOPS}
              activeIndex={activeIndex}
              completedStops={completedStops}
              onSelectStop={setActiveIndex}
            />
          </div>

          {/* المنطقة الثانية (يسار في RTL): عنصر الحصة التفاعلي */}
          <div className="lg:col-span-7 flex flex-col">
            <LessonStageContent
              stop={activeStop}
              stopIndex={activeIndex}
              totalStops={JOURNEY_STOPS.length}
              isCompleted={Boolean(completedStops[activeStop.id])}
              onMarkComplete={handleMarkComplete}
              onNext={handleNext}
              onPrev={handlePrev}
              onRestart={handleRestart}
            />
          </div>
        </div>
      </main>

      {/* روابط مساعدة للشاشات الصغيرة في التذييل الهادئ */}
      <footer className="border-t border-stone-200 bg-white py-3 px-4 sm:px-6">
        <div className="max-w-[1380px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-[#526071]">
          <span>الانطلاقة من محافظة جنوب الشرقية · جمع الكسور وطرحها</span>
          <div className="flex md:hidden items-center gap-4">
            <button
              type="button"
              onClick={() => openGuide('criteria')}
              className="font-semibold text-[#0F766E] cursor-pointer"
            >
              معايير النجاح
            </button>
            <button
              type="button"
              onClick={() => openGuide('notes')}
              className="font-semibold text-[#0F766E] cursor-pointer"
            >
              ملاحظات المعلم
            </button>
            <button
              type="button"
              onClick={() => openGuide('resources')}
              className="font-semibold text-[#0F766E] cursor-pointer"
            >
              الوسائل
            </button>
          </div>
        </div>
      </footer>

      <TeacherNotesModal
        open={guideOpen}
        activeTab={guideTab}
        onChangeTab={setGuideTab}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
