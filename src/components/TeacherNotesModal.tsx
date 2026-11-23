import React from 'react';
import { X } from 'lucide-react';
import { SUCCESS_CRITERIA, TEACHER_NOTES } from '../data/journeyData';

export type GuideTab = 'notes' | 'criteria' | 'resources';

interface TeacherNotesModalProps {
  open: boolean;
  activeTab: GuideTab;
  onChangeTab: (tab: GuideTab) => void;
  onClose: () => void;
}

export const TeacherNotesModal: React.FC<TeacherNotesModalProps> = ({
  open,
  activeTab,
  onChangeTab,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="دليل التحضير وملاحظات المعلم"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#1C2430]">مرجع التحضير المرفق</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 rounded-lg text-[#526071] hover:text-[#1C2430] hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-3 border-b border-stone-200 flex items-center gap-2">
          {[
            { id: 'notes' as const, label: 'ملاحظات المعلم' },
            { id: 'criteria' as const, label: 'معايير النجاح والأهداف' },
            { id: 'resources' as const, label: 'الوسائل ومصادر التعلم' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#0F766E] text-[#0F766E]'
                  : 'border-transparent text-[#526071] hover:text-[#1C2430]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {activeTab === 'notes' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <h3 className="text-sm font-bold text-rose-900">يجب تنبيه الطلاب للأخطاء الشائعة</h3>
                <ul className="space-y-1.5 text-sm text-rose-950 leading-relaxed">
                  {TEACHER_NOTES.commonErrors.map((err) => (
                    <li key={err}>• {err}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-2">
                <h3 className="text-sm font-bold text-[#1C2430]">ملخص أهداف حل المشكلات</h3>
                <ul className="space-y-2 text-sm text-[#526071] leading-relaxed">
                  {TEACHER_NOTES.problemSolvingSummary.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="space-y-3">
              {SUCCESS_CRITERIA.map((c) => (
                <div
                  key={c.code}
                  className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-1"
                >
                  <div className="text-xs font-bold text-[#0F766E]">المعيار {c.code} · {c.title}</div>
                  <p className="text-sm text-[#1C2430]">{c.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-3">
              <p className="text-sm text-[#526071]">
                الوسائل ومصادر التعلم المعتمدة في خطة التحضير المرفقة:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TEACHER_NOTES.resources.map((res) => (
                  <li
                    key={res}
                    className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200 text-sm font-semibold text-[#1C2430]"
                  >
                    {res}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
