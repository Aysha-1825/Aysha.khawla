import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Users,
} from 'lucide-react';
import {
  FORMATIVE_EX1_ITEMS,
  GovernorateStop,
  LESSON_STEPS_RULES,
  TEXTBOOK_113_EXAMPLES,
  WARMUP_EQUIVALENT,
  WARMUP_SIMPLIFY,
} from '../data/journeyData';
import {
  fractionsEqual,
  gcd,
  parseNumericInput,
  simplifyFraction,
  toEasternArabic,
} from '../utils/arabicNumbers';
import { ArabicNumberInput, Fraction, FractionInput, MixedNumber } from './FractionMath';
import { ApplePiesVisual, CommonErrorBarDiagram, OpeningPiesVisual } from './InteractiveVisuals';

interface LessonStageContentProps {
  stop: GovernorateStop;
  stopIndex: number;
  totalStops: number;
  isCompleted: boolean;
  onMarkComplete: (stopId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
}

interface FeedbackBannerProps {
  type: 'success' | 'error' | 'info';
  text: string;
}

const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ type, text }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-amber-50 border-amber-200 text-amber-900',
  }[type];

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : HelpCircle;

  return (
    <div className={`mt-3 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2 leading-relaxed ${styles}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
};

export const LessonStageContent: React.FC<LessonStageContentProps> = ({
  stop,
  stopIndex,
  totalStops,
  isCompleted,
  onMarkComplete,
  onNext,
  onPrev,
  onRestart,
}) => {
  // ١) حالة التمهيد (جنوب الشرقية)
  const [simpInputs, setSimpInputs] = useState<Record<string, { num: string; den: string }>>({
    a: { num: '', den: '' },
    b: { num: '', den: '' },
    c: { num: '', den: '' },
  });
  const [simpFeedback, setSimpFeedback] = useState<Record<string, FeedbackBannerProps>>({});
  const [eqInputs, setEqInputs] = useState<Record<string, string>>({ 'eq-a': '', 'eq-b': '' });
  const [eqFeedback, setEqFeedback] = useState<Record<string, FeedbackBannerProps>>({});
  const [showRules, setShowRules] = useState(true);

  // ٢) حالة النشاط الافتتاحي (شمال الشرقية)
  const [pie1Ans, setPie1Ans] = useState({ num: '', den: '' });
  const [pie2Ans, setPie2Ans] = useState({ num: '', den: '' });
  const [pieTotalAns, setPieTotalAns] = useState({ whole: '', num: '', den: '' });
  const [pieFeedback, setPieFeedback] = useState<FeedbackBannerProps | null>(null);

  // ٣) حالة أمثلة كتاب الطالب ص ١١٣ (مسقط)
  const [ex113Inputs, setEx113Inputs] = useState<Record<string, { whole: string; num: string; den: string }>>({
    'ex-a': { whole: '', num: '', den: '' },
    'ex-b': { whole: '', num: '', den: '' },
    'ex-c': { whole: '', num: '', den: '' },
    'ex-d': { whole: '', num: '', den: '' },
  });
  const [ex113Feedback, setEx113Feedback] = useState<Record<string, FeedbackBannerProps>>({});

  // ٤) حالة سبورة عائشة الثنائية (الباطنة)
  const [aishaF1, setAishaF1] = useState({ num: '١', den: '٢' });
  const [aishaF2, setAishaF2] = useState({ num: '٥', den: '٨' });
  const [aishaFeedback, setAishaFeedback] = useState<FeedbackBannerProps | null>(null);

  // ٥) حالة التقويم التكويني تمرين (١) (مسندم)
  const [ex1Inputs, setEx1Inputs] = useState<Record<string, { num: string; den: string }>>({
    'f-1': { num: '', den: '' },
    'f-2': { num: '', den: '' },
    'f-3': { num: '', den: '' },
  });
  const [ex1Feedback, setEx1Feedback] = useState<Record<string, FeedbackBannerProps>>({});
  const [revealedMistake, setRevealedMistake] = useState<Record<string, boolean>>({});

  // ٦) حالة تمرين (٢) فطائر فريدة وبطاقة الخروج (الظاهرة)
  const [fareedaMixed, setFareedaMixed] = useState({ whole: '', num: '', den: '' });
  const [fareedaImproper, setFareedaImproper] = useState({ num: '', den: '' });
  const [fareedaFeedback, setFareedaFeedback] = useState<FeedbackBannerProps | null>(null);
  const [exitMood, setExitMood] = useState<string | null>(null);
  const [exitAnswer, setExitAnswer] = useState({ num: '', den: '' });
  const [exitFeedback, setExitFeedback] = useState<FeedbackBannerProps | null>(null);

  // ٧) حالة تفريد التعليم (الداخلية)
  const [diffTab, setDiffTab] = useState<'remedial' | 'enrichment'>('remedial');
  const [selectedStrip, setSelectedStrip] = useState<number | null>(null);
  const [remedialFeedback, setRemedialFeedback] = useState<FeedbackBannerProps | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<'sultan' | 'mazen' | null>(null);
  const [enrichmentReason, setEnrichmentReason] = useState<string | null>(null);
  const [enrichmentFeedback, setEnrichmentFeedback] = useState<FeedbackBannerProps | null>(null);

  // ٨) حالة التقويم الختامي (ظفار)
  const [closingChecks, setClosingChecks] = useState<Record<string, boolean>>({
    q3a: false,
    q3b: false,
    q4c: false,
    q4d: false,
    hw3: false,
    hw4: false,
  });

  // دوال التحقق
  const checkSimplify = (id: string, ansNum: number, ansDen: number) => {
    const n = parseNumericInput(simpInputs[id].num);
    const d = parseNumericInput(simpInputs[id].den);
    if (n === null || d === null || d === 0) {
      setSimpFeedback((p) => ({
        ...p,
        [id]: { type: 'info', text: 'يرجى إدخال البسط والمقام أولاً.' },
      }));
      return;
    }
    if (n === ansNum && d === ansDen) {
      setSimpFeedback((p) => ({
        ...p,
        [id]: { type: 'success', text: `إجابة صحيحة: ${toEasternArabic(ansNum)}/${toEasternArabic(ansDen)} في أبسط صورة.` },
      }));
      onMarkComplete(stop.id);
    } else if (fractionsEqual(n, d, ansNum, ansDen)) {
      setSimpFeedback((p) => ({
        ...p,
        [id]: {
          type: 'info',
          text: 'الكسر مكافئ، لكنه ليس في أبسط صورة بعد. اقسم البسط والمقام على أكبر قاسم مشترك.',
        },
      }));
    } else {
      setSimpFeedback((p) => ({
        ...p,
        [id]: { type: 'error', text: 'تحقق من القسمة على نفس العدد في البسط والمقام.' },
      }));
    }
  };

  const checkEquivalent = (id: string, ansNum: number) => {
    const n = parseNumericInput(eqInputs[id]);
    if (n === null) {
      setEqFeedback((p) => ({ ...p, [id]: { type: 'info', text: 'اكتب العدد المناسب في المربع.' } }));
      return;
    }
    if (n === ansNum) {
      setEqFeedback((p) => ({
        ...p,
        [id]: { type: 'success', text: `إجابة صحيحة! العدد المفقود هو ${toEasternArabic(ansNum)}.` },
      }));
      onMarkComplete(stop.id);
    } else {
      setEqFeedback((p) => ({
        ...p,
        [id]: { type: 'error', text: 'إجابة غير دقيقة؛ لاحظ العملية الموضحة على السهم.' },
      }));
    }
  };

  const checkOpeningPies = () => {
    const n1 = parseNumericInput(pie1Ans.num);
    const d1 = parseNumericInput(pie1Ans.den);
    const n2 = parseNumericInput(pie2Ans.num);
    const d2 = parseNumericInput(pie2Ans.den);
    const w = pieTotalAns.whole.trim() === '' ? 0 : parseNumericInput(pieTotalAns.whole);
    const nt = parseNumericInput(pieTotalAns.num);
    const dt = parseNumericInput(pieTotalAns.den);

    if (n1 === null || d1 === null || n2 === null || d2 === null || w === null || nt === null || dt === null || d1 === 0 || d2 === 0 || dt === 0) {
      setPieFeedback({ type: 'info', text: 'أكمل كسر الفطيرة ١، وكسر الفطيرة ٢، والمجموع الكلي أولاً.' });
      return;
    }

    const p1Ok = fractionsEqual(n1, d1, 5, 8);
    const p2Ok = fractionsEqual(n2, d2, 5, 6);
    const totalOk = fractionsEqual(w * dt + nt, dt, 35, 24);

    if (p1Ok && p2Ok && totalOk) {
      setPieFeedback({
        type: 'success',
        text: 'أحسنت! الأجزاء المأكولة من فطيرة ١ هي ٥/٨، ومن فطيرة ٢ هي ٥/٦، ومجموعها ٥/٨ + ٥/٦ = ١٥/٢٤ + ٢٠/٢٤ = ٣٥/٢٤ = ١ ١١/٢٤.',
      });
      onMarkComplete(stop.id);
    } else if (!p1Ok || !p2Ok) {
      setPieFeedback({
        type: 'error',
        text: 'تنبّه! السؤال يطلب الأجزاء التي تم أكلها (الأجزاء البيضاء المفرغة) وليس الأجزاء المتبقية.',
      });
    } else {
      setPieFeedback({
        type: 'error',
        text: 'تحقق من توحيد المقامين بين ٨ و ٦ (المقام المشترك هو ٢٤: ١٥/٢٤ + ٢٠/٢٤).',
      });
    }
  };

  const checkEx113 = (item: (typeof TEXTBOOK_113_EXAMPLES)[number]) => {
    const input = ex113Inputs[item.id];
    const w = input.whole.trim() === '' ? 0 : parseNumericInput(input.whole);
    const n = parseNumericInput(input.num);
    const d = parseNumericInput(input.den);

    if (w === null || n === null || d === null || d === 0) {
      setEx113Feedback((p) => ({ ...p, [item.id]: { type: 'info', text: 'أدخل البسط والمقام للتحقق.' } }));
      return;
    }

    const expectedTotalNum = item.ansWhole * item.ansDen + item.ansNum;
    if (!fractionsEqual(w * d + n, d, expectedTotalNum, item.ansDen)) {
      setEx113Feedback((p) => ({
        ...p,
        [item.id]: { type: 'error', text: 'الناتج غير صحيح. راجع توحيد المقام ثم جمع أو طرح البسطين فقط.' },
      }));
      return;
    }

    // تحقق من التبسيط والصورة الكسرية
    if (item.ansWhole > 0 && w === 0) {
      setEx113Feedback((p) => ({
        ...p,
        [item.id]: {
          type: 'info',
          text: `القيمة صحيحة (${toEasternArabic(n)}/${toEasternArabic(d)})، والخطوة ٤ تطلب كتابتها في صورة عدد كسري: ${toEasternArabic(item.ansWhole)} ${toEasternArabic(item.ansNum)}/${toEasternArabic(item.ansDen)}.`,
        },
      }));
      onMarkComplete(stop.id);
      return;
    }

    const simp = simplifyFraction(n, d);
    if (simp.num !== n || simp.den !== d) {
      setEx113Feedback((p) => ({
        ...p,
        [item.id]: {
          type: 'info',
          text: `الناتج صحيح، وتذكّر الخطوة ٣: ضع الناتج في أبسط صورة (${toEasternArabic(item.ansNum)}/${toEasternArabic(item.ansDen)}).`,
        },
      }));
      onMarkComplete(stop.id);
      return;
    }

    setEx113Feedback((p) => ({
      ...p,
      [item.id]: { type: 'success', text: `إجابة دقيقة وممتازة! ${item.explanation}` },
    }));
    onMarkComplete(stop.id);
  };

  const checkAishaPair = () => {
    const n1 = parseNumericInput(aishaF1.num);
    const d1 = parseNumericInput(aishaF1.den);
    const n2 = parseNumericInput(aishaF2.num);
    const d2 = parseNumericInput(aishaF2.den);

    if (n1 === null || d1 === null || n2 === null || d2 === null || d1 === 0 || d2 === 0) {
      setAishaFeedback({ type: 'info', text: 'أدخل بسط ومقام كل من الكسرين.' });
      return;
    }
    if (n1 >= d1 || n2 >= d2 || n1 === 0 || n2 === 0) {
      setAishaFeedback({
        type: 'error',
        text: 'تذكّر شرط المسألة: يجب أن يكون كل منهما كسراً اعتيادياً (البسط أصغر من المقام).',
      });
      return;
    }
    if (d1 === d2) {
      setAishaFeedback({
        type: 'error',
        text: 'تذكّر شرط المسألة: احتوى الكسران على مقامين مختلفين!',
      });
      return;
    }

    if (fractionsEqual(n1 * d2 + n2 * d1, d1 * d2, 9, 8)) {
      setAishaFeedback({
        type: 'success',
        text: `استقصاء رائع! ${toEasternArabic(n1)}/${toEasternArabic(d1)} + ${toEasternArabic(n2)}/${toEasternArabic(d2)} = ٩/٨ = ١ ١/٨، والمقامان مختلفان وكلاهما كسر اعتيادي.`,
      });
      onMarkComplete(stop.id);
    } else {
      const commonDen = (d1 * d2) / gcd(d1, d2);
      const sumNum = (n1 * (commonDen / d1)) + (n2 * (commonDen / d2));
      const simp = simplifyFraction(sumNum, commonDen);
      setAishaFeedback({
        type: 'error',
        text: `مجموع هذين الكسرين يساوي ${toEasternArabic(simp.num)}/${toEasternArabic(simp.den)} ولا يساوي ١ ١/٨ (أي ٩/٨). جرّب كسرين آخرين مثل ١/٢ و ٥/٨ أو ٣/٤ و ٣/٨.`,
      });
    }
  };

  const checkFormativeEx1 = (item: (typeof FORMATIVE_EX1_ITEMS)[number]) => {
    const n = parseNumericInput(ex1Inputs[item.id].num);
    const d = parseNumericInput(ex1Inputs[item.id].den);
    if (n === null || d === null || d === 0) {
      setEx1Feedback((p) => ({ ...p, [item.id]: { type: 'info', text: 'أدخل البسط والمقام أولاً.' } }));
      return;
    }
    if (n === item.ansNum && d === item.ansDen) {
      setEx1Feedback((p) => ({
        ...p,
        [item.id]: { type: 'success', text: `صحيح! ${item.explanation}` },
      }));
      onMarkComplete(stop.id);
    } else if (fractionsEqual(n, d, item.ansNum, item.ansDen)) {
      setEx1Feedback((p) => ({
        ...p,
        [item.id]: {
          type: 'info',
          text: `القيمة مكافئة، لكن اكتب الناتج في أبسط صورة (${toEasternArabic(item.ansNum)}/${toEasternArabic(item.ansDen)}).`,
        },
      }));
    } else {
      setEx1Feedback((p) => ({
        ...p,
        [item.id]: {
          type: 'error',
          text: `احذر الخطأ الشائع (${item.commonMistake}). وحّد المقامين أو بسّط الناتج.`,
        },
      }));
    }
  };

  const checkFareeda = () => {
    const w = parseNumericInput(fareedaMixed.whole);
    const mn = parseNumericInput(fareedaMixed.num);
    const md = parseNumericInput(fareedaMixed.den);
    const impN = parseNumericInput(fareedaImproper.num);
    const impD = parseNumericInput(fareedaImproper.den);

    if (w === null || mn === null || md === null || impN === null || impD === null || md === 0 || impD === 0) {
      setFareedaFeedback({ type: 'info', text: 'أكمل العدد الكسري (أ) والكسر غير الاعتيادي (ب).' });
      return;
    }
    const mixedOk = w === 3 && fractionsEqual(mn, md, 5, 8);
    const impOk = fractionsEqual(impN, impD, 29, 8) && impD === 8;

    if (mixedOk && impOk) {
      setFareedaFeedback({
        type: 'success',
        text: 'إجابة ممتازة! أُكلت ٣ فطائر كاملة و ٥/٨ من الفطيرة الرابعة (٣ ٥/٨)، وفي صورة كسر غير اعتيادي ٢٩/٨.',
      });
      onMarkComplete(stop.id);
    } else {
      setFareedaFeedback({
        type: 'error',
        text: 'تذكّر: ٤ فطائر × ٨ قطع = ٣٢ قطعة، تبقّت ٣ قطع لم تؤكل، إذن أُكل ٢٩ قطعة من أصل ٨ قطع في الفطيرة الواحدة.',
      });
    }
  };

  const checkExitTicket = () => {
    const n = parseNumericInput(exitAnswer.num);
    const d = parseNumericInput(exitAnswer.den);
    if (!exitMood) {
      setExitFeedback({ type: 'info', text: 'اختر أولاً الوجه التعبيري المناسب لمستوى فهمك.' });
      return;
    }
    if (n === null || d === null || d === 0) {
      setExitFeedback({ type: 'info', text: 'أجب عن سؤال بطاقة الخروج: ٣/٤ + ١/٨.' });
      return;
    }
    if (fractionsEqual(n, d, 7, 8)) {
      setExitFeedback({
        type: 'success',
        text: 'أحسنت! ٣/٤ = ٦/٨، و ٦/٨ + ١/٨ = ٧/٨. تم تسجيل بطاقة خروجك بنجاح.',
      });
      onMarkComplete(stop.id);
    } else {
      setExitFeedback({
        type: 'error',
        text: 'حاول توحيد المقام: ٣/٤ يساوي ٦/٨ ثم أضف ١/٨.',
      });
    }
  };

  const renderBody = () => {
    switch (stop.id) {
      case 'south-sharqiyah':
        return (
          <div className="space-y-6">
            {/* مراجعة تبسيط الكسور */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-[#1C2430]">١) مراجعة تبسيط الكسور</h3>
                <span className="text-xs text-[#526071]">اكتب كلاً من الكسور التالية في أبسط صورة</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {WARMUP_SIMPLIFY.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-[#0F766E]">({item.label})</span>
                        <Fraction num={item.num} den={item.den} />
                        <span className="text-lg font-bold text-[#526071]">=</span>
                        <FractionInput
                          numValue={simpInputs[item.id].num}
                          denValue={simpInputs[item.id].den}
                          onNumChange={(val) =>
                            setSimpInputs((p) => ({ ...p, [item.id]: { ...p[item.id], num: val } }))
                          }
                          onDenChange={(val) =>
                            setSimpInputs((p) => ({ ...p, [item.id]: { ...p[item.id], den: val } }))
                          }
                          labelPrefix={`تبسيط ${item.label}`}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => checkSimplify(item.id, item.ansNum, item.ansDen)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        تحقق
                      </button>
                    </div>
                    {simpFeedback[item.id] && <FeedbackBanner {...simpFeedback[item.id]} />}
                  </div>
                ))}
              </div>
            </section>

            {/* مراجعة على الكسور المتكافئة */}
            <section className="space-y-3 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-[#1C2430]">٢) مراجعة على الكسور المتكافئة</h3>
                <span className="text-xs text-[#526071]">أكمل ما يلي لتحصل على كسور متكافئة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WARMUP_EQUIVALENT.map((eq) => (
                  <div
                    key={eq.id}
                    className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-[#0F766E]">({eq.label})</span>
                        <Fraction num={eq.givenLeft.num} den={eq.givenLeft.den} />
                        <span className="text-xs font-semibold text-[#B45309] px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">
                          {eq.opText}
                        </span>
                        <span className="text-lg font-bold text-[#526071]">=</span>
                        <div className="inline-flex flex-col items-center gap-1">
                          <ArabicNumberInput
                            value={eqInputs[eq.id]}
                            onChange={(val) => setEqInputs((p) => ({ ...p, [eq.id]: val }))}
                            ariaLabel={`البسط المفقود في ${eq.label}`}
                          />
                          <span className="w-12 h-[2px] bg-[#1C2430]" />
                          <span className="text-base font-bold tabular-nums">{toEasternArabic(eq.targetDen)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => checkEquivalent(eq.id, eq.ansNum)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        تحقق
                      </button>
                    </div>
                    {eqFeedback[eq.id] && <FeedbackBanner {...eqFeedback[eq.id]} />}
                  </div>
                ))}
              </div>
            </section>

            {/* قاعدة المفاهيم الأربع */}
            <section className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-[#1C2430]">
                  ٣) خطوات جمع الكسور وطرحها (من التحضير)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRules((v) => !v)}
                  className="text-xs font-semibold text-[#0F766E] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {showRules ? 'إخفاء الخطوات' : 'عرض الخطوات'}
                </button>
              </div>
              {showRules && (
                <ol className="space-y-2 p-4 rounded-xl bg-[#F4F8F7] border border-[#0F766E]/20 text-sm text-[#1C2430] leading-relaxed">
                  {LESSON_STEPS_RULES.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        );

      case 'north-sharqiyah':
        return (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
              <p className="text-sm sm:text-base text-[#1C2430] leading-relaxed font-medium">
                اشترت مجموعة من الأصدقاء فطيرتين كبيرتين، وأكلوا أجزاء من كل فطيرة. والصورة المقابلة تمثل الأجزاء
                المتبقية. <span className="font-bold text-[#0F766E]">ما الكسر الذي يمثل عدد الأجزاء التي تم أكلها؟</span>
              </p>
            </div>

            <OpeningPiesVisual />

            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-4">
              <h4 className="text-sm font-bold text-[#1C2430]">اكتب الكسور التي تمثل الأجزاء المأكولة ومجموعها:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#FAF9F6] border border-stone-200">
                  <span className="text-xs font-semibold text-[#526071]">المأكول من فطيرة ١</span>
                  <FractionInput
                    numValue={pie1Ans.num}
                    denValue={pie1Ans.den}
                    onNumChange={(val) => setPie1Ans((p) => ({ ...p, num: val }))}
                    onDenChange={(val) => setPie1Ans((p) => ({ ...p, den: val }))}
                    labelPrefix="فطيرة ١"
                  />
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#FAF9F6] border border-stone-200">
                  <span className="text-xs font-semibold text-[#526071]">المأكول من فطيرة ٢</span>
                  <FractionInput
                    numValue={pie2Ans.num}
                    denValue={pie2Ans.den}
                    onNumChange={(val) => setPie2Ans((p) => ({ ...p, num: val }))}
                    onDenChange={(val) => setPie2Ans((p) => ({ ...p, den: val }))}
                    labelPrefix="فطيرة ٢"
                  />
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#FAF9F6] border border-stone-200">
                  <span className="text-xs font-semibold text-[#0F766E]">مجموع الأجزاء المأكولة</span>
                  <FractionInput
                    showWhole
                    wholeValue={pieTotalAns.whole}
                    numValue={pieTotalAns.num}
                    denValue={pieTotalAns.den}
                    onWholeChange={(val) => setPieTotalAns((p) => ({ ...p, whole: val }))}
                    onNumChange={(val) => setPieTotalAns((p) => ({ ...p, num: val }))}
                    onDenChange={(val) => setPieTotalAns((p) => ({ ...p, den: val }))}
                    labelPrefix="المجموع الكلي"
                  />
                  <span className="text-[11px] text-[#526071]">(عدد كسري أو كسر غير اعتيادي)</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={checkOpeningPies}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  تحقق من الإجابة
                </button>
              </div>
              {pieFeedback && <FeedbackBanner {...pieFeedback} />}
            </div>
          </div>
        );

      case 'muscat':
        return (
          <div className="space-y-5">
            <CommonErrorBarDiagram />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-[#1C2430]">
                  كتاب الطالب صفحة ١١٣ — أوجد ناتج ما يلي:
                </h3>
                <span className="text-xs text-[#526071]">المناقشة + رفع اليدين</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {TEXTBOOK_113_EXAMPLES.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-[#0F766E]">({item.label})</span>
                        <Fraction num={item.left.num} den={item.left.den} />
                        <span className="text-lg font-bold text-[#1C2430]">{item.op}</span>
                        <Fraction num={item.right.num} den={item.right.den} />
                        <span className="text-lg font-bold text-[#526071]">=</span>
                        <FractionInput
                          showWhole={item.ansWhole > 0}
                          wholeValue={ex113Inputs[item.id].whole}
                          numValue={ex113Inputs[item.id].num}
                          denValue={ex113Inputs[item.id].den}
                          onWholeChange={(val) =>
                            setEx113Inputs((p) => ({ ...p, [item.id]: { ...p[item.id], whole: val } }))
                          }
                          onNumChange={(val) =>
                            setEx113Inputs((p) => ({ ...p, [item.id]: { ...p[item.id], num: val } }))
                          }
                          onDenChange={(val) =>
                            setEx113Inputs((p) => ({ ...p, [item.id]: { ...p[item.id], den: val } }))
                          }
                          labelPrefix={`مثال ${item.label}`}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => checkEx113(item)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        تحقق
                      </button>
                    </div>
                    {ex113Feedback[item.id] && <FeedbackBanner {...ex113Feedback[item.id]} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'batinah':
        return (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E]">
                <Users className="w-4 h-4" />
                <span>نشاط ثنائي: (السبورات البيضاء) — كتاب النشاط ص ٨٠ رقم ٦</span>
              </div>
              <p className="text-sm sm:text-base text-[#1C2430] leading-relaxed">
                ٦) جمعت عائشة كسرين اعتياديين معاً. احتوى الكسران على مقامين مختلفين وحصلت على ناتج يساوي{' '}
                <MixedNumber whole={1} num={1} den={8} size="sm" className="text-[#0F766E] mx-1" />.{' '}
                <span className="font-bold">اكتب الكسرين اللذين قد تكون جمعتهما عائشة.</span>
              </p>
            </div>

            {/* السبورة البيضاء الثنائية */}
            <div className="p-5 rounded-xl bg-white border-2 border-stone-300 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <span className="text-sm font-bold text-[#1C2430]">السبورة البيضاء التفاعلية للأقران</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#526071]">أمثلة سريعة للاستقصاء:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAishaF1({ num: '١', den: '٢' });
                      setAishaF2({ num: '٥', den: '٨' });
                      setAishaFeedback(null);
                    }}
                    className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-[#1C2430] font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Fraction num={1} den={2} size="sm" />
                    <span>+</span>
                    <Fraction num={5} den={8} size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAishaF1({ num: '٣', den: '٤' });
                      setAishaF2({ num: '٣', den: '٨' });
                      setAishaFeedback(null);
                    }}
                    className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-[#1C2430] font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Fraction num={3} den={4} size="sm" />
                    <span>+</span>
                    <Fraction num={3} den={8} size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAishaF1({ num: '١', den: '٤' });
                      setAishaF2({ num: '٧', den: '٨' });
                      setAishaFeedback(null);
                    }}
                    className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-[#1C2430] font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Fraction num={1} den={4} size="sm" />
                    <span>+</span>
                    <Fraction num={7} den={8} size="sm" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                <FractionInput
                  numValue={aishaF1.num}
                  denValue={aishaF1.den}
                  onNumChange={(val) => setAishaF1((p) => ({ ...p, num: val }))}
                  onDenChange={(val) => setAishaF1((p) => ({ ...p, den: val }))}
                  labelPrefix="الكسر الأول"
                />
                <span className="text-2xl font-bold text-[#1C2430]">+</span>
                <FractionInput
                  numValue={aishaF2.num}
                  denValue={aishaF2.den}
                  onNumChange={(val) => setAishaF2((p) => ({ ...p, num: val }))}
                  onDenChange={(val) => setAishaF2((p) => ({ ...p, den: val }))}
                  labelPrefix="الكسر الثاني"
                />
                <span className="text-2xl font-bold text-[#526071]">=</span>
                <div className="px-4 py-2 rounded-lg bg-[#F4F8F7] border border-[#0F766E]/25">
                  <MixedNumber whole={1} num={1} den={8} className="text-[#0F766E]" />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={checkAishaPair}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  افحص إجابة السبورة البيضاء
                </button>
              </div>
              {aishaFeedback && <FeedbackBanner {...aishaFeedback} />}
            </div>
          </div>
        );

      case 'musandam':
        return (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-1.5">
              <h3 className="text-sm sm:text-base font-bold text-[#1C2430]">
                التقويم التكويني — تمرين (١): (أخبر زميل) &#123;تقويم الخطأ الشائع&#125;
              </h3>
              <p className="text-xs sm:text-sm text-[#526071]">
                كتاب النشاط ص ٧٩ رقم ٢ (د ، هـ ، ز) — حلّ كل مسألة في أبسط صورة ثم تحقق من الخطأ الشائع مع زميلك.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {FORMATIVE_EX1_ITEMS.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#0F766E]">({item.label})</span>
                      <Fraction num={item.left.num} den={item.left.den} />
                      <span className="text-lg font-bold text-[#1C2430]">{item.op}</span>
                      <Fraction num={item.right.num} den={item.right.den} />
                      <span className="text-lg font-bold text-[#526071]">=</span>
                      <FractionInput
                        numValue={ex1Inputs[item.id].num}
                        denValue={ex1Inputs[item.id].den}
                        onNumChange={(val) =>
                          setEx1Inputs((p) => ({ ...p, [item.id]: { ...p[item.id], num: val } }))
                        }
                        onDenChange={(val) =>
                          setEx1Inputs((p) => ({ ...p, [item.id]: { ...p[item.id], den: val } }))
                        }
                        labelPrefix={`تمرين ${item.label}`}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedMistake((p) => ({ ...p, [item.id]: !p[item.id] }))
                        }
                        className="px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 bg-white text-[#526071] hover:text-[#1C2430] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {revealedMistake[item.id] ? 'إخفاء الخطأ الشائع' : 'أخبر زميل: الخطأ الشائع'}
                      </button>
                      <button
                        type="button"
                        onClick={() => checkFormativeEx1(item)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        تحقق
                      </button>
                    </div>
                  </div>

                  {revealedMistake[item.id] && (
                    <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold">تنبيه أخبر زميل: </span>
                      الخطأ الشائع المتوقع هنا هو: {item.commonMistake}.
                    </div>
                  )}

                  {ex1Feedback[item.id] && <FeedbackBanner {...ex1Feedback[item.id]} />}
                </div>
              ))}
            </div>
          </div>
        );

      case 'dhahirah':
        return (
          <div className="space-y-6">
            {/* تمرين (٢) فطائر التفاح */}
            <section className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#1C2430]">
                  تمرين (٢): تقويم تحقق معايير النجاح
                </h3>
                <p className="text-sm text-[#1C2430] leading-relaxed">
                  أعدّت فريدة أربعاً من فطائر التفاح للحفل، وقطّعت كلّ فطيرة إلى ثماني قطع، وعند انتهاء الحفل كانت هناك
                  ثلاثُ قطعٍ من فطيرة التفاح لم تُؤكل.{' '}
                  <span className="font-bold text-[#0F766E]">
                    اكتب المقدار الذي تمّ أكله من الفطيرة في صورة:
                  </span>
                </p>
              </div>

              <ApplePiesVisual />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#1C2430]">(أ) عدد كسري:</span>
                  <FractionInput
                    showWhole
                    wholeValue={fareedaMixed.whole}
                    numValue={fareedaMixed.num}
                    denValue={fareedaMixed.den}
                    onWholeChange={(val) => setFareedaMixed((p) => ({ ...p, whole: val }))}
                    onNumChange={(val) => setFareedaMixed((p) => ({ ...p, num: val }))}
                    onDenChange={(val) => setFareedaMixed((p) => ({ ...p, den: val }))}
                    labelPrefix="عدد كسري"
                  />
                </div>
                <div className="p-4 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#1C2430]">(ب) كسر غير اعتيادي:</span>
                  <FractionInput
                    numValue={fareedaImproper.num}
                    denValue={fareedaImproper.den}
                    onNumChange={(val) => setFareedaImproper((p) => ({ ...p, num: val }))}
                    onDenChange={(val) => setFareedaImproper((p) => ({ ...p, den: val }))}
                    labelPrefix="كسر غير اعتيادي"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={checkFareeda}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  تحقق من تمرين (٢)
                </button>
              </div>
              {fareedaFeedback && <FeedbackBanner {...fareedaFeedback} />}
            </section>

            {/* بطاقة الخروج */}
            <section className="pt-5 border-t border-stone-200 space-y-3">
              <h3 className="text-base font-bold text-[#1C2430]">بطاقة الخروج</h3>
              <p className="text-xs sm:text-sm text-[#526071]">
                اختر الوجه التعبيري المناسب وأجب عن السؤال المرفق للتحقق من فهمك:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'great', face: '😄', label: 'أفهم الدرس تماماً' },
                  { id: 'good', face: '🙂', label: 'أفهم معظم الدرس' },
                  { id: 'help', face: '🤔', label: 'أحتاج بعض المساعدة' },
                  { id: 'hard', face: '😕', label: 'أحتاج شرحاً إضافياً' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setExitMood(m.id)}
                    className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                      exitMood === m.id
                        ? 'bg-[#F4F8F7] border-[#0F766E] text-[#0F766E] font-bold'
                        : 'bg-[#FAF9F6] border-stone-200 text-[#1C2430] hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.face}</div>
                    <div className="text-xs">{m.label}</div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#1C2430]">السؤال المرفق:</span>
                  <Fraction num={3} den={4} size="sm" />
                  <span className="font-bold">+</span>
                  <Fraction num={1} den={8} size="sm" />
                  <span className="font-bold">=</span>
                  <FractionInput
                    numValue={exitAnswer.num}
                    denValue={exitAnswer.den}
                    onNumChange={(val) => setExitAnswer((p) => ({ ...p, num: val }))}
                    onDenChange={(val) => setExitAnswer((p) => ({ ...p, den: val }))}
                    labelPrefix="بطاقة الخروج"
                  />
                </div>
                <button
                  type="button"
                  onClick={checkExitTicket}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  إرسال بطاقة الخروج
                </button>
              </div>
              {exitFeedback && <FeedbackBanner {...exitFeedback} />}
            </section>
          </div>
        );

      case 'dakhiliyah':
        return (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-[#1C2430]">تفريد التعليم (اختر المسار المناسب):</span>
              <div className="inline-flex items-center p-1 rounded-lg bg-stone-100 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setDiffTab('remedial')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    diffTab === 'remedial'
                      ? 'bg-white text-[#0F766E] shadow-xs'
                      : 'text-[#526071] hover:text-[#1C2430]'
                  }`}
                >
                  النشاط العلاجي (و)
                </button>
                <button
                  type="button"
                  onClick={() => setDiffTab('enrichment')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    diffTab === 'enrichment'
                      ? 'bg-white text-[#B45309] shadow-xs'
                      : 'text-[#526071] hover:text-[#1C2430]'
                  }`}
                >
                  النشاط الإثرائي (اكتشف الخطأ)
                </button>
              </div>
            </div>

            {diffTab === 'remedial' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 text-sm sm:text-base text-[#1C2430] leading-relaxed">
                  (و) قطع أيمن مسافة <Fraction num={5} den={8} size="sm" className="mx-1 text-[#0F766E]" /> كيلومتر من
                  بيته إلى المسجد، ثم بعد ذلك قطع مسافة{' '}
                  <Fraction num={1} den={4} size="sm" className="mx-1 text-[#B45309]" /> كيلومتر لزيارة صديقه. إذا كان كل
                  شريط أدناه يمثل ١ كيلومتر،{' '}
                  <span className="font-bold">فأيّ شريط مظلل يمثل المسافة التي قطعها أيمن من بيته إلى صديقه؟</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 1, shaded: 5, label: 'الشريط الأول (٥ أجزاء من ٨)' },
                    { id: 2, shaded: 6, label: 'الشريط الثاني (٦ أجزاء من ٨)' },
                    { id: 3, shaded: 7, label: 'الشريط الثالث (٧ أجزاء من ٨)' },
                    { id: 4, shaded: 3, label: 'الشريط الرابع (٣ أجزاء من ٨)' },
                  ].map((strip) => {
                    const isSelected = selectedStrip === strip.id;
                    return (
                      <button
                        key={strip.id}
                        type="button"
                        onClick={() => {
                          setSelectedStrip(strip.id);
                          if (strip.shaded === 7) {
                            setRemedialFeedback({
                              type: 'success',
                              text: 'إجابة صحيحة! ٥/٨ + ١/٤ = ٥/٨ + ٢/٨ = ٧/٨ كيلومتر (٧ أجزاء مظللة من أصل ٨).',
                            });
                            onMarkComplete(stop.id);
                          } else {
                            setRemedialFeedback({
                              type: 'error',
                              text: 'تذكّر أن ١/٤ كم يكافئ ٢/٨ كم، لذا نضيف جزأين إلى الأجزاء الخمسة (٥/٨ + ٢/٨).',
                            });
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-right transition-colors cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-[#F4F8F7] border-[#0F766E]'
                            : 'bg-white border-stone-200 hover:bg-[#FAF9F6]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-[#1C2430]">
                          <span>{strip.label}</span>
                          <span className="tabular-nums text-[#526071]">{toEasternArabic(strip.shaded)}/٨ كم</span>
                        </div>
                        <div className="grid grid-cols-8 gap-1 h-7">
                          {Array.from({ length: 8 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`rounded-xs border ${
                                idx < strip.shaded
                                  ? idx < 5
                                    ? 'bg-[#0F766E] border-[#0F766E]'
                                    : 'bg-[#D97706] border-[#D97706]'
                                  : 'bg-stone-50 border-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {remedialFeedback && <FeedbackBanner {...remedialFeedback} />}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 text-sm sm:text-base text-[#1C2430] leading-relaxed">
                  <span className="font-bold text-[#B45309]">اكتشف الخطأ: </span>
                  أوجد كل من سلطان ومازن ناتج{' '}
                  <Fraction num={5} den={8} size="sm" className="mx-1" /> +{' '}
                  <Fraction num={1} den={4} size="sm" className="mx-1" /> كما هو مبين أدناه.{' '}
                  <span className="font-bold">فأيهما كانت إجابته صحيحة؟ وضح إجابتك.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* بطاقة سلطان */}
                  <button
                    type="button"
                    onClick={() => setSelectedStudent('sultan')}
                    className={`p-4 rounded-xl border text-right transition-colors cursor-pointer space-y-3 ${
                      selectedStudent === 'sultan'
                        ? 'bg-[#F4F8F7] border-[#0F766E]'
                        : 'bg-white border-stone-200 hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-[#1C2430]">حلّ سلطان</span>
                      <span className="text-xs text-[#526071]">اضغط للاختيار</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-stone-200 space-y-2.5 text-sm tabular-nums" dir="rtl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Fraction num={5} den={8} size="sm" />
                        <span>+</span>
                        <Fraction num={1} den={4} size="sm" />
                        <span>=</span>
                        <Fraction num={5} den={8} size="sm" />
                        <span>+</span>
                        <Fraction num={2} den={8} size="sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>=</span>
                        <Fraction num="٥ + ٢" den={8} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 font-bold text-[#0F766E]">
                        <span>=</span>
                        <Fraction num={7} den={8} size="sm" />
                      </div>
                    </div>
                  </button>

                  {/* بطاقة مازن */}
                  <button
                    type="button"
                    onClick={() => setSelectedStudent('mazen')}
                    className={`p-4 rounded-xl border text-right transition-colors cursor-pointer space-y-3 ${
                      selectedStudent === 'mazen'
                        ? 'bg-[#F4F8F7] border-[#0F766E]'
                        : 'bg-white border-stone-200 hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-[#1C2430]">حلّ مازن</span>
                      <span className="text-xs text-[#526071]">اضغط للاختيار</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-stone-200 space-y-2.5 text-sm tabular-nums" dir="rtl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Fraction num={5} den={8} size="sm" />
                        <span>+</span>
                        <Fraction num={1} den={4} size="sm" />
                        <span>=</span>
                        <Fraction num="٥ + ١" den="٨ + ٤" size="sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>=</span>
                        <Fraction num={6} den={12} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 font-bold text-[#526071]">
                        <span>=</span>
                        <Fraction num={1} den={2} size="sm" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* توضيح السبب */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#526071]">اختر التوضيح الرياضي الصحيح:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        id: 'r1',
                        text: 'سلطان على صواب؛ لأنه وحّد المقامين إلى ٨ (١/٤ = ٢/٨) ثم جمع البسطين فقط، بينما أخطأ مازن وجمع البسط مع البسط والمقام مع المقام.',
                      },
                      {
                        id: 'r2',
                        text: 'مازن على صواب؛ لأن جمع البسط مع البسط والمقام مع المقام يعطي ناتجاً أصغر وأبسط.',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEnrichmentReason(opt.id)}
                        className={`p-3 rounded-xl border text-right text-xs sm:text-sm transition-colors cursor-pointer ${
                          enrichmentReason === opt.id
                            ? 'bg-amber-50 border-[#B45309] text-[#1C2430] font-semibold'
                            : 'bg-white border-stone-200 text-[#526071] hover:bg-[#FAF9F6]'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedStudent || !enrichmentReason) {
                        setEnrichmentFeedback({
                          type: 'info',
                          text: 'اختر الطالب صاحب الإجابة الصحيحة والتوضيح الرياضي أولاً.',
                        });
                        return;
                      }
                      if (selectedStudent === 'sultan' && enrichmentReason === 'r1') {
                        setEnrichmentFeedback({
                          type: 'success',
                          text: 'تحليل ممتاز! لا يجوز جمع المقامين، بل نوحد المقامين بإيجاد الكسر المكافئ ١/٤ = ٢/٨ ثم نجمع البسطين لنحصل على ٧/٨.',
                        });
                        onMarkComplete(stop.id);
                      } else {
                        setEnrichmentFeedback({
                          type: 'error',
                          text: 'راجع ملاحظة الخطأ الشائع: جمع البسط والمقام معاً خطأ؛ الحل الصحيح هو توحيد المقام كما فعل سلطان.',
                        });
                      }
                    }}
                    className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    تحقق من الإجابة
                  </button>
                </div>
                {enrichmentFeedback && <FeedbackBanner {...enrichmentFeedback} />}
              </div>
            )}
          </div>
        );

      case 'dhofar':
        return (
          <div className="space-y-6">
            {/* التقويم الختامي */}
            <section className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F766E]">
                <BookOpen className="w-4 h-4" />
                <span>التقويم الختامي (من التحضير المرفق)</span>
              </div>
              <p className="text-base font-bold text-[#1C2430]">
                تمارين كتاب الطالب صفحة ١١٣ رقم ٣ ( أ و ب ) و ٤ ( ج و د )
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { id: 'q3a', label: 'كتاب الطالب ص ١١٣ — رقم ٣ (أ)' },
                  { id: 'q3b', label: 'كتاب الطالب ص ١١٣ — رقم ٣ (ب)' },
                  { id: 'q4c', label: 'كتاب الطالب ص ١١٣ — رقم ٤ (ج)' },
                  { id: 'q4d', label: 'كتاب الطالب ص ١١٣ — رقم ٤ (د)' },
                ].map((task) => (
                  <label
                    key={task.id}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-stone-200 cursor-pointer hover:bg-stone-50"
                  >
                    <input
                      type="checkbox"
                      checked={closingChecks[task.id]}
                      onChange={(e) => {
                        const next = { ...closingChecks, [task.id]: e.target.checked };
                        setClosingChecks(next);
                        if (next.q3a && next.q3b && next.q4c && next.q4d) {
                          onMarkComplete(stop.id);
                        }
                      }}
                      className="w-4 h-4 accent-[#0F766E] rounded"
                    />
                    <span className="text-xs sm:text-sm font-medium text-[#1C2430]">{task.label}</span>
                  </label>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>تنبيه حل المشكلات (السؤال ٤ من التمرين):</span>
                </div>
                <p>
                  • الهدف ٧Pt٧: يحل المسائل الكلامية التي تتضمن الأعداد الكاملة أو النسب المئوية أو الأعداد العشرية أو
                  النقود أو القياسات.
                </p>
                <p>• الهدف ٧Ps٣: يعمل بطريقة منطقية ويتوصل إلى استنتاجات بسيطة في السؤال ٤ من التمرين.</p>
              </div>
            </section>

            {/* الواجب المنزلي */}
            <section className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
              <h3 className="text-base font-bold text-[#1C2430]">الواجب المنزلي</h3>
              <p className="text-sm font-semibold text-[#0F766E]">
                تمارين كتاب النشاط صفحة ٧٩ رقم ( ٣ و ٤ )
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'hw3', label: 'كتاب النشاط ص ٧٩ — تمرين ٣' },
                  { id: 'hw4', label: 'كتاب النشاط ص ٧٩ — تمرين ٤' },
                ].map((hw) => (
                  <label
                    key={hw.id}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FAF9F6] border border-stone-200 cursor-pointer hover:bg-stone-100"
                  >
                    <input
                      type="checkbox"
                      checked={closingChecks[hw.id]}
                      onChange={(e) => {
                        const next = { ...closingChecks, [hw.id]: e.target.checked };
                        setClosingChecks(next);
                        if (next.hw3 || next.hw4) {
                          onMarkComplete(stop.id);
                        }
                      }}
                      className="w-4 h-4 accent-[#0F766E] rounded"
                    />
                    <span className="text-xs sm:text-sm font-medium text-[#1C2430]">{hw.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* رأس عنصر الحصة */}
      <div className="px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-[#526071] flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-[#0F766E]">المحطة {toEasternArabic(stop.order)}</span>
            <span aria-hidden="true">·</span>
            <span>{stop.governorateName}</span>
            <span aria-hidden="true">·</span>
            <span>الاستراتيجية: {stop.strategy}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C2430] mt-1">
            {stop.lessonElement}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onMarkComplete(stop.id)}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-stone-100 text-[#526071] hover:bg-stone-200 hover:text-[#1C2430]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCompleted ? 'تم إنجاز المحطة' : 'تحديد كمنجز'}</span>
        </button>
      </div>

      {/* محتوى النشاط التفاعلي */}
      <div className="p-6 flex-1 overflow-y-auto">{renderBody()}</div>

      {/* تذييل التنقل بين المحافظات بالسيارة */}
      <div className="px-6 py-4 border-t border-stone-200 bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={stopIndex === 0}
          className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-stone-300 bg-white text-[#1C2430] hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <ChevronRight className="w-4 h-4" />
          <span>المحافظة السابقة</span>
        </button>

        <div className="text-xs text-[#526071] tabular-nums">
          المحطة {toEasternArabic(stopIndex + 1)} من {toEasternArabic(totalStops)}
        </div>

        {stopIndex < totalStops - 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>انطلق بالسيارة للمحافظة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onRestart}
            className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#B45309] text-white hover:bg-[#92400E] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>العودة إلى جنوب الشرقية</span>
          </button>
        )}
      </div>
    </div>
  );
};
