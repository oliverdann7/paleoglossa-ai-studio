import { useState } from "react";
import { Download, RefreshCcw, Settings as SettingsIcon, Snowflake } from "lucide-react";
import { useSettings } from "../lib/hooks/useSettings";
import { cn } from "@/lib/utils";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { useTranslation } from "react-i18next";
import { db } from "../lib/firebase";
import { DICTIONARY_SOURCES } from "../lib/data/dictionaryDB";

export const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { exportData, stats } = useKnowledge();

  const freezesTotal = stats?.freezesTotal ?? 2;
  const freezesUsed = stats?.freezesUsed ?? 0;
  const freezesRemaining = freezesTotal - freezesUsed;
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem("app_lang", newLang);
  };


  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paleoglossa-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    localStorage.removeItem("paleoglossa_knowledge");
    localStorage.removeItem("paleoglossa_stats");
    localStorage.removeItem("paleoglossa_reading_sessions");
    
    if (db) {
      try {
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const { collection, getDocs, writeBatch } = await import("firebase/firestore");
          const collectionsToClear = ['vocabulary', 'imports', 'readingProgress', 'reviewLogs'];
          
          for (const coll of collectionsToClear) {
            const querySnapshot = await getDocs(collection(db, `users/${user.uid}/${coll}`));
            const batch = writeBatch(db);
            querySnapshot.forEach((doc) => {
              batch.delete(doc.ref);
            });
            await batch.commit();
          }
        }
      } catch (err) {
        console.error("Failed to wipe firestore data:", err);
      }
    }
    
    window.location.reload();
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto font-sans min-h-screen pb-24">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-muted" /> {t("settings.title", "Preferences")}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t("settings.description", "Configure your reading environment and manage your scholarly data.")}
        </p>
      </header>

      <div className="space-y-8">
        <section className="card p-8">
          <h3 className="font-serif text-[20px] text-ink mb-6 pb-4 border-b border-bdr">
            {t("settings.language", "App Language")}
          </h3>
          <div className="mb-8">
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="w-full md:w-1/2 p-4 bg-parch2/50 border border-bdr rounded-xl text-ink focus:outline-none focus:border-blue transition-all font-bold"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
              <option value="ru">Русский</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </section>

        <section className="card p-8">
          <h3 className="font-serif text-[20px] text-ink mb-6 pb-4 border-b border-bdr">
            {t("settings.readingGoals", "Reading Goals")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-widest text-muted mb-3">
                {t("settings.dailyWords", "Daily Words Goal")}
              </label>
              <input
                type="number"
                value={settings.dailyGoalWords}
                onChange={(e) =>
                  updateSettings({
                    dailyGoalWords: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-4 bg-parch2/50 border border-bdr rounded-xl text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-widest text-muted mb-3">
                {t("settings.dailyMinutes", "Daily Minutes Goal")}
              </label>
              <input
                type="number"
                value={settings.dailyGoalMinutes}
                onChange={(e) =>
                  updateSettings({
                    dailyGoalMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-4 bg-parch2/50 border border-bdr rounded-xl text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
              />
            </div>
          </div>
          <div className="mt-8 p-4 bg-blue/5 border border-blue/10 rounded-xl flex justify-between items-center">
            <div>
              <h4 className="font-bold text-[14px] text-blue flex items-center gap-2">
                <Snowflake className="w-4 h-4" />
                {t("settings.streakFreezes", "Streak Freezes")}
              </h4>
              <p className="text-[12px] text-ink3">
                {freezesRemaining > 0
                  ? t("settings.freezesRemaining", `You have ${freezesRemaining} freeze${freezesRemaining !== 1 ? 's' : ''} remaining this month.`, { count: freezesRemaining })
                  : t("settings.freezesNone", "No streak freezes remaining this month.")}
              </p>
            </div>
            <div className={cn("px-3 py-1 rounded font-bold shadow-sm text-[14px]", freezesRemaining > 0 ? "bg-white/50 text-blue" : "bg-red-50 text-red-500")}>
              {freezesRemaining}/{freezesTotal}
            </div>
          </div>
        </section>

        <section className="card p-8">
          <h3 className="font-serif text-[20px] text-ink mb-6 pb-4 border-b border-bdr">
            {t("settings.readerAppearance", "Reader Appearance")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-widest text-muted mb-3">
                {t("settings.fontSize", "Base Font Size")}
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) =>
                  updateSettings({ fontSize: parseInt(e.target.value) || 24 })
                }
                className="w-full p-4 bg-parch2/50 border border-bdr rounded-xl text-ink focus:outline-none focus:border-blue transition-all"
              >
                {[16, 18, 20, 22, 24, 26, 28].map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-widest text-muted mb-3">
                {t("settings.highlightIntensity", "Highlight Intensity")}
              </label>
              <select
                value={settings.highlightIntensity}
                onChange={(e) =>
                  updateSettings({ highlightIntensity: e.target.value as any })
                }
                className="w-full p-4 bg-parch2/50 border border-bdr rounded-xl text-ink focus:outline-none focus:border-blue transition-all"
              >
                <option value="subtle">{t("settings.intensitySubtle", "Subtle")}</option>
                <option value="normal">{t("settings.intensityNormal", "Normal")}</option>
                <option value="strong">{t("settings.intensityStrong", "Strong")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-widest text-muted mb-3">
                {t("settings.theme", "Theme")}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ theme: "parchment" })}
                  className={cn(
                    "flex-1 py-3 border rounded-xl font-bold text-[13px] transition-all",
                    settings.theme === "parchment"
                      ? "bg-white border-blue text-blue shadow-sm"
                      : "bg-parch2/50 border-bdr text-muted hover:text-ink",
                  )}
                >
                  {t("settings.themeParchment", "Parchment")}
                </button>
                <button
                  onClick={() => updateSettings({ theme: "sepia" })}
                  className={cn(
                    "flex-1 py-3 border rounded-xl font-bold text-[13px] transition-all",
                    settings.theme === "sepia"
                      ? "bg-[#f4ecd8] border-amber-500 text-amber-700 shadow-sm"
                      : "bg-[#f4ecd8]/40 border-bdr text-muted hover:text-ink",
                  )}
                >
                  {t("settings.themeSepia", "Sepia")}
                </button>
                <button
                  onClick={() => updateSettings({ theme: "dark" })}
                  className={cn(
                    "flex-1 py-3 border rounded-xl font-bold text-[13px] transition-all",
                    settings.theme === "dark"
                      ? "bg-[#151c27] border-blue-400 text-blue-300 shadow-sm"
                      : "bg-[#151c27]/40 border-[#2a364a] text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  {t("settings.themeDark", "Dark")}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-widest text-muted mb-3">
                {t("settings.audioSpeed", "Audio Speed Default")}
              </label>
              <div className="flex gap-1 bg-parch2/50 p-1 border border-bdr rounded-xl">
                {[0.85, 1.0, 1.15].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSettings({ audioSpeedDefault: speed })}
                    className={cn(
                      "flex-1 py-2 rounded-lg font-bold text-[13px] transition-all",
                      settings.audioSpeedDefault === speed
                        ? "bg-white text-blue shadow-sm border border-bdr/50"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.showTranslit}
                onChange={(e) =>
                  updateSettings({ showTranslit: e.target.checked })
                }
                className="w-5 h-5 rounded text-blue focus:ring-blue accent-blue border-bdr bg-white"
              />
              <span className="text-[14px] font-medium text-ink group-hover:text-blue transition-colors">
                {t("settings.showTranslit", "Show transliteration by default")}
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.showParallelDefault}
                onChange={(e) =>
                  updateSettings({ showParallelDefault: e.target.checked })
                }
                className="w-5 h-5 rounded text-blue focus:ring-blue accent-blue border-bdr bg-white"
              />
              <span className="text-[14px] font-medium text-ink group-hover:text-blue transition-colors">
                {t("settings.showParallel", "Show parallel text by default")}
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.swipePageMovesToKnown ?? true}
                onChange={(e) =>
                  updateSettings({ swipePageMovesToKnown: e.target.checked })
                }
                className="w-5 h-5 rounded text-blue focus:ring-blue accent-blue border-bdr bg-white"
              />
              <span className="flex flex-col">
                <span className="text-[14px] font-medium text-ink group-hover:text-blue transition-colors">
                  {t("settings.swipeMovesToKnown", "Swipe page moves to known")}
                </span>
                <span className="text-[12px] text-muted">
                  {t("settings.swipeMovesToKnownDesc", "When enabled, moving to the next page automatically marks the current page's words as known.")}
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="card p-8">
          <h3 className="font-serif text-[20px] text-ink mb-2 pb-4 border-b border-bdr">
            {t("settings.dictionaries", "Dictionaries & Lexicons")}
          </h3>
          <p className="text-[13px] text-muted mb-6">
            {t("settings.dictionariesDesc", "Select which dictionaries to use when looking up words.")}
          </p>
          <div className="space-y-3">
            {Object.values(DICTIONARY_SOURCES).map((source) => {
              const active = settings.activeDictionaries ?? Object.keys(DICTIONARY_SOURCES);
              const isChecked = active.includes(source.id);
              return (
                <label key={source.id} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const current = settings.activeDictionaries ?? Object.keys(DICTIONARY_SOURCES);
                      const next = e.target.checked
                        ? [...current, source.id]
                        : current.filter((id) => id !== source.id);
                      updateSettings({ activeDictionaries: next });
                    }}
                    className="w-5 h-5 mt-0.5 rounded text-blue focus:ring-blue accent-blue border-bdr bg-white"
                  />
                  <span className="flex flex-col">
                    <span className="text-[14px] font-medium text-ink group-hover:text-blue transition-colors">
                      {source.name}
                    </span>
                    <span className="text-[11px] text-muted">{source.licenseName}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="card p-8">
          <h3 className="font-serif text-[20px] text-ink mb-6 pb-4 border-b border-bdr">
            {t("settings.dataExport", "Data & Export")}
          </h3>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <button
              onClick={handleExport}
              className="flex-1 btn-secondary py-4 flex flex-col items-center gap-2 group"
            >
              <Download className="w-5 h-5 text-muted group-hover:text-ink transition-colors" />
              <span className="font-bold text-[14px]">{t("settings.export", "Export All Data")}</span>
              <span className="text-[11px] font-normal text-muted">
                {t("settings.exportDesc", "Download .json of vocabulary and logs")}
              </span>
            </button>
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex-1 bg-red-50 border border-red-100 hover:border-red-300 py-4 flex flex-col items-center gap-2 group text-red-600 rounded-2xl transition-all"
            >
              <RefreshCcw className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
              <span className="font-bold text-[14px]">{t("settings.reset", "Reset Progress")}</span>
              <span className="text-[11px] font-normal opacity-80">
                {t("settings.resetDesc", "Erase all knowledge and streaks")}
              </span>
            </button>
          </div>

          {showConfirmReset && (
            <div className="p-4 bg-red-100 border border-red-200 rounded-xl mt-4">
              <p className="text-[13px] font-bold text-red-800 mb-3">
                {t("settings.resetConfirm", "Are you absolutely sure? This cannot be undone.")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-[12px] hover:bg-red-700"
                >
                  {t("settings.resetYes", "Yes, erase everything")}
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="bg-white text-ink px-4 py-2 rounded-lg font-bold text-[12px] border border-bdr"
                >
                  {t("settings.resetCancel", "Cancel")}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
