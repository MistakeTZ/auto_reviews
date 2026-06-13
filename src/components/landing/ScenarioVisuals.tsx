import React from "react";
import BrowserMockup from "@/components/ui/BrowserMockup";

interface ScenarioProps {
  t: (key: string) => string;
  language?: string;
}

export function ScenarioBrands({ t }: ScenarioProps) {
  return (
    <BrowserMockup headerTitle={t("landing.scenariosVisualTab0Header")}>
      <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div>
          <label className="text-[0.8rem] font-bold text-[#0A192F]">
            {t("landing.scenariosVisualTab0BrandsLabel")}
          </label>
          <div className="mt-1 sm:mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">
              Xiaomi{" "}
              <button className="leading-none text-[#cbd5e0] cursor-pointer">
                ×
              </button>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">
              Apple{" "}
              <button className="leading-none text-[#cbd5e0] cursor-pointer">
                ×
              </button>
            </span>
            <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-[#e2e8f0] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4f46e5] transition-colors hover:bg-[#fafafa]">
              + {t("landing.scenariosVisualTab0AddBrand")}
            </span>
          </div>
        </div>
        <div>
          <label className="text-[0.8rem] font-bold text-[#0A192F]">
            {t("landing.scenariosVisualTab0CategoriesLabel")}
          </label>
          <div className="mt-1 sm:mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">
              {t("landing.scenariosVisualTab0CategoryExample")}{" "}
              <button className="leading-none text-[#cbd5e0] cursor-pointer">
                ×
              </button>
            </span>
            <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-[#e2e8f0] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4f46e5] transition-colors hover:bg-[#fafafa]">
              + {t("landing.scenariosVisualTab0AddCategory")}
            </span>
          </div>
        </div>
        <div>
          <label className="text-[0.8rem] font-bold text-[#0A192F]">
            {t("landing.scenariosVisualTab0SkuLabel")}
          </label>
          <div className="mt-1 sm:mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">
              19284812{" "}
              <button className="leading-none text-[#cbd5e0] cursor-pointer">
                ×
              </button>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[#edf2f7] bg-[#f7fafc] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4a5568]">
              38472910{" "}
              <button className="leading-none text-[#cbd5e0] cursor-pointer">
                ×
              </button>
            </span>
            <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-[#e2e8f0] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-[#4f46e5] transition-colors hover:bg-[#fafafa]">
              + {t("landing.scenariosVisualTab0AddSku")}
            </span>
          </div>
        </div>
      </div>
    </BrowserMockup>
  );
}

export function ScenarioRatings({ t, language }: ScenarioProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <BrowserMockup headerTitle={t("landing.scenariosVisualTab1Header")}>
      <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div>
          <label className="flex items-center gap-1 text-[0.8rem] font-bold text-[#0A192F]">
            {t("landing.scenariosVisualTab1RatingLabel")}{" "}
            <span className="text-red-500">*</span>
            <span className="text-xs text-slate-400">ⓘ</span>
          </label>
          <div className="mt-2 sm:mt-3 flex flex-col gap-1.5 sm:gap-2.5">
            {stars.map((star) => (
              <label
                key={star}
                className="flex cursor-pointer items-center gap-2 text-[0.75rem] font-semibold text-[#4a5568]"
              >
                <input
                  type="checkbox"
                  className="h-[14px] w-[14px] rounded-[4px] border border-[#cbd5e1] accent-[#4f46e5]"
                  checked={star >= 4}
                  readOnly
                />
                <span>
                  {star}{" "}
                  {language === "en"
                    ? star === 1
                      ? t("landing.scenariosVisualTab1Star")
                      : t("landing.scenariosVisualTab1Stars")
                    : star === 1
                      ? t("landing.scenariosVisualTab1Star")
                      : star >= 5
                        ? t("landing.scenariosVisualTab1Stars5")
                        : t("landing.scenariosVisualTab1Stars")}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="h-px bg-[#edf2f7]" />
        <div className="flex cursor-pointer items-center justify-between text-xs font-semibold text-indigo-600">
          <span>∨ {t("landing.scenariosVisualTab1AdditionalSettings")}</span>
        </div>
      </div>
    </BrowserMockup>
  );
}

export function ScenarioBlacklist({ t }: ScenarioProps) {
  const stopWordsIndices = [0, 1, 2, 3];
  return (
    <BrowserMockup headerTitle={t("landing.scenariosVisualTab2Header")}>
      <div className="space-y-2.5 p-4 sm:p-6">
        <p className="mb-2 text-[0.8rem] leading-[1.5] text-[#4a5568]">
          {t("landing.scenariosVisualTab2Desc")}
        </p>
        <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2">
          {stopWordsIndices.map((idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-red-700"
            >
              {t(`landing.scenariosVisualTab2Word${idx}`)}
              <button className="leading-none text-red-400 hover:text-red-600 cursor-pointer">
                ×
              </button>
            </span>
          ))}
          <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-red-200 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-red-500 transition-colors hover:bg-red-50/50">
            + {t("landing.scenariosVisualTab2AddWord")}
          </span>
        </div>
      </div>
    </BrowserMockup>
  );
}

export function ScenarioWhitelist({ t }: ScenarioProps) {
  const triggerWordsIndices = [0, 1, 2, 3];
  return (
    <BrowserMockup headerTitle={t("landing.scenariosVisualTab3Header")}>
      <div className="space-y-2.5 p-4 sm:p-6">
        <p className="mb-2 text-[0.8rem] leading-[1.5] text-[#4a5568]">
          {t("landing.scenariosVisualTab3Desc")}
        </p>
        <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2">
          {triggerWordsIndices.map((idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md border border-green-100 bg-green-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-green-700"
            >
              {t(`landing.scenariosVisualTab3Word${idx}`)}
              <button className="leading-none text-green-400 hover:text-green-600 cursor-pointer">
                ×
              </button>
            </span>
          ))}
          <span className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-green-200 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.75rem] font-semibold text-green-500 transition-colors hover:bg-green-50/50">
            + {t("landing.scenariosVisualTab3AddWord")}
          </span>
        </div>
      </div>
    </BrowserMockup>
  );
}

export function ScenarioMedia({ t }: ScenarioProps) {
  return (
    <BrowserMockup headerTitle={t("landing.scenariosVisualTab4Header")}>
      <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <p className="mb-2 text-[0.8rem] leading-[1.5] text-[#4a5568]">
          {t("landing.scenariosVisualTab4Desc")}
        </p>
        <div className="flex flex-col gap-2 sm:gap-3">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="media_action"
              className="mt-0.5 h-[14px] w-[14px] rounded-full border border-[#cbd5e1] accent-[#4f46e5]"
              checked={false}
              readOnly
            />
            <span className="text-xs font-semibold text-slate-800">
              {t("landing.scenariosVisualTab4OptionNotImportant")}
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="media_action"
              className="mt-0.5 h-[14px] w-[14px] rounded-full border border-[#cbd5e1] accent-[#4f46e5]"
              checked
              readOnly
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">
                {t("landing.scenariosVisualTab4OptionOnlyWithMedia")}
              </span>
              <span className="text-[10px] text-slate-400">
                {t("landing.scenariosVisualTab4OptionOnlyWithMediaDesc")}
              </span>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="media_action"
              className="mt-0.5 h-[14px] w-[14px] rounded-full border border-[#cbd5e1] accent-[#4f46e5]"
              checked={false}
              readOnly
            />
            <span className="text-xs font-semibold text-slate-800">
              {t("landing.scenariosVisualTab4OptionOnlyWithoutMedia")}
            </span>
          </label>
        </div>
      </div>
    </BrowserMockup>
  );
}

export const ScenarioVisuals = {
  0: ScenarioBrands,
  1: ScenarioRatings,
  2: ScenarioBlacklist,
  3: ScenarioWhitelist,
  4: ScenarioMedia,
};
