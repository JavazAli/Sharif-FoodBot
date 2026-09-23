"use client";

import {
  ArrowLeft,
  Bot,
  Check,
  ChevronLeft,
  CircleGauge,
  Clock3,
  Download,
  Heart,
  Import,
  Leaf,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { comparisonPairs, foods, initialRatings, weekMenus, type Food } from "./food-data";

type Tab = "home" | "taste" | "rules";
type StoredProfile = {
  ratings: Record<string, number>;
  comparisons: number;
  pairIndex: number;
  reasons: string[];
  maxPrice: number;
  preferSelf: boolean;
  fastFoodLimit: number;
};

const defaultProfile: StoredProfile = {
  ratings: initialRatings,
  comparisons: 3,
  pairIndex: 0,
  reasons: [],
  maxPrice: 130,
  preferSelf: true,
  fastFoodLimit: 2,
};

const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

function scoreFood(food: Food, rating: number, maxPrice: number) {
  const overBudget = Math.max(0, food.price - maxPrice);
  const valueBonus = food.price <= 85 ? 4 : 0;
  return Math.max(0, Math.min(99, Math.round(rating + valueBonus - overBudget * 0.8)));
}

export default function FoodbotApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [profile, setProfile] = useState<StoredProfile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let restored = defaultProfile;
    try {
      const saved = localStorage.getItem("loghme-profile-v1");
      if (saved) restored = { ...defaultProfile, ...JSON.parse(saved) };
    } catch {
      // A broken local profile should never prevent the app from opening.
    }
    const timer = window.setTimeout(() => {
      setProfile(restored);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("loghme-profile-v1", JSON.stringify(profile));
  }, [profile, hydrated]);

  const pair = comparisonPairs[profile.pairIndex % comparisonPairs.length];
  const pairFoods = pair.map((id) => foods.find((food) => food.id === id)!) as [Food, Food];

  const recommendations = useMemo(
    () =>
      weekMenus.map((day) => {
        const ranked = [...day.options]
          .map((food) => ({ food, score: scoreFood(food, profile.ratings[food.id] ?? 60, profile.maxPrice) }))
          .filter(({ food }) => food.price <= profile.maxPrice || (profile.preferSelf && food.vendor === "سلف مرکزی"))
          .sort((a, b) => b.score - a.score);
        return { ...day, ranked };
      }),
    [profile.maxPrice, profile.preferSelf, profile.ratings],
  );

  function submitChoice() {
    if (!selected) return;
    const loser = pairFoods.find((food) => food.id !== selected)!;
    setProfile((current) => ({
      ...current,
      ratings: {
        ...current.ratings,
        [selected]: Math.min(99, (current.ratings[selected] ?? 60) + 5),
        [loser.id]: Math.max(10, (current.ratings[loser.id] ?? 60) - 3),
      },
      comparisons: current.comparisons + 1,
      pairIndex: (current.pairIndex + 1) % comparisonPairs.length,
      reasons: reason.trim() ? [...current.reasons, reason.trim()].slice(-20) : current.reasons,
    }));
    setSelected(null);
    setReason("");
    setNotice("انتخابت ثبت شد؛ پیشنهادهای هفته به‌روز شدند.");
    window.setTimeout(() => setNotice(""), 2600);
  }

  function exportProfile() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), profile }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "loghme-taste-profile.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importProfile(file?: File) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (!payload?.profile?.ratings) throw new Error("invalid profile");
      setProfile({ ...defaultProfile, ...payload.profile });
      setNotice("پروفایل با موفقیت وارد شد.");
    } catch {
      setNotice("این فایل، پروفایل معتبر لقمه نیست.");
    }
  }

  const progress = Math.min(100, Math.round((profile.comparisons / 12) * 100));

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("home")} aria-label="صفحه اصلی لقمه">
          <span className="brand-mark"><UtensilsCrossed size={22} /></span>
          <span><strong>لقمه</strong><small>انتخاب‌گر غذای شریف</small></span>
        </button>
        <nav aria-label="بخش‌های اصلی">
          <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}>این هفته</button>
          <button className={tab === "taste" ? "active" : ""} onClick={() => setTab("taste")}>شناخت سلیقه</button>
          <button className={tab === "rules" ? "active" : ""} onClick={() => setTab("rules")}>قوانین من</button>
        </nav>
        <div className="status-pill"><span /> حالت مشاهده</div>
      </header>

      {notice && <div className="toast" role="status"><Check size={17} />{notice}</div>}

      {tab === "home" && (
        <div className="page home-page">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><Sparkles size={16} /> انتخاب‌های این هفته آماده‌اند</div>
              <h1>تو فقط غذا را بخور؛<br /><em>انتخابش با لقمه.</em></h1>
              <p>بر اساس سلیقه، بودجه و خط قرمزهای تو، برای هر روز یک انتخاب اصلی و دو جایگزین آماده کرده‌ایم.</p>
              <div className="hero-actions">
                <button className="primary" onClick={() => setTab("taste")}>دقیق‌ترم کن <ArrowLeft size={18} /></button>
                <button className="secondary" onClick={() => setTab("rules")}><Settings2 size={18} /> ویرایش قوانین</button>
              </div>
            </div>
            <div className="hero-score">
              <div className="score-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}>
                <span>{money(progress)}٪</span><small>شناخت سلیقه</small>
              </div>
              <div className="score-meta"><strong>{money(profile.comparisons)} مقایسه</strong><span>برای شروع خوب است؛ ۱۲ مقایسه دقت را بالا می‌برد.</span></div>
            </div>
          </section>

          <section className="section-heading">
            <div><span className="kicker">برنامهٔ ناهار</span><h2>پیشنهادهای هفته</h2></div>
            <span className="week-label">هفتهٔ ۶ تا ۱۰ مهر</span>
          </section>

          <section className="week-grid">
            {recommendations.map((day, index) => {
              const best = day.ranked[0];
              const backups = day.ranked.slice(1, 3);
              return (
                <article className={`meal-card ${index === 2 ? "featured" : ""}`} key={day.day}>
                  <div className="meal-day"><div><strong>{day.day}</strong><span>{day.date}</span></div>{index === 2 && <b>پیشنهاد ویژه</b>}</div>
                  {best ? (
                    <>
                      <div className="food-visual"><span>{best.food.emoji}</span><i>{best.score}٪ هماهنگ</i></div>
                      <div className="food-title"><span>{best.food.vendor}</span><h3>{best.food.name}</h3></div>
                      <div className="tags">{best.food.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
                      <div className="price-row"><span>{money(best.food.price)} هزار تومان</span><small>{day.mood}</small></div>
                      <div className="fallbacks"><span>جایگزین‌ها</span>{backups.map(({ food }) => <b key={food.id} title={food.name}>{food.emoji}</b>)}</div>
                    </>
                  ) : <div className="empty-pick">هیچ گزینه‌ای از قوانین فعلی عبور نکرد.</div>}
                </article>
              );
            })}
          </section>

          <section className="lower-grid">
            <article className="connection-card">
              <div className="card-icon teal"><Bot /></div>
              <div className="connection-copy"><span className="kicker">اتصال به سماد</span><h3>فعلاً می‌بینیم؛ هنوز رزرو نمی‌کنیم</h3><p>حالت امن اولیه فقط زمان بازشدن و منوی هفته را ثبت می‌کند. بعد از یک هفته مشاهده و تست کنترل‌شده، اتوپایلوت قابل فعال‌سازی می‌شود.</p></div>
              <div className="steps" aria-label="مراحل راه‌اندازی">
                <div className="done"><Check size={15} /><span>ساخت پروفایل</span></div>
                <div className="current"><Clock3 size={15} /><span>مشاهدهٔ زمان بازشدن</span></div>
                <div><LockKeyhole size={15} /><span>فعال‌سازی رزرو</span></div>
              </div>
            </article>
            <article className="privacy-card">
              <ShieldCheck size={26} />
              <div><strong>رمز دانشگاه اینجا ذخیره نمی‌شود</strong><p>این نسخه فقط سلیقه و قوانین را روی دستگاهت نگه می‌دارد. ورود سماد بعداً در Worker امن و جدا انجام می‌شود.</p></div>
            </article>
          </section>
        </div>
      )}

      {tab === "taste" && (
        <div className="page taste-page">
          <section className="page-intro">
            <span className="kicker">تمرین سریع</span><h1>کدام را واقعاً ترجیح می‌دهی؟</h1><p>هر جواب، لقمه را یک قدم به سلیقهٔ واقعی تو نزدیک‌تر می‌کند.</p>
          </section>
          <section className="compare-panel">
            <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
            <div className="compare-meta"><span>مقایسهٔ {money(profile.comparisons + 1)} از ۱۲</span><span>{money(progress)}٪ تکمیل</span></div>
            <div className="food-duel">
              {pairFoods.map((food, index) => (
                <button key={food.id} className={`duel-card ${selected === food.id ? "selected" : ""}`} onClick={() => setSelected(food.id)}>
                  <span className="duel-emoji">{food.emoji}</span>
                  <span className="duel-vendor">{food.vendor}</span>
                  <strong>{food.name}</strong>
                  <span className="duel-price">{money(food.price)} هزار تومان</span>
                  <span className="duel-tags">{food.tags.join(" · ")}</span>
                  {selected === food.id && <i><Check size={15} /> انتخاب من</i>}
                  {index === 0 && <b className="versus">یا</b>}
                </button>
              ))}
            </div>
            <label className="reason-box">
              <span><MessageSquareText size={18} /><strong>چرا این را انتخاب کردی؟</strong><small>اختیاری، ولی خیلی کمک می‌کند.</small></span>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="مثلاً کیفیت گوشتش بهتره، سبک‌تره یا ارزش خرید بیشتری داره…" />
            </label>
            <button className="primary wide" disabled={!selected} onClick={submitChoice}>ثبت و مقایسهٔ بعدی <ChevronLeft size={18} /></button>
          </section>
          <section className="learned-grid">
            <article><Heart /><strong>علاقه‌های فعلی</strong><p>غذای کبابی، مرغ، وعده‌های برنجی</p></article>
            <article><WalletCards /><strong>حساسیت به قیمت</strong><p>متوسط؛ ارزش خرید مهم‌تر از ارزانی مطلق</p></article>
            <article><Leaf /><strong>تنوع هفتگی</strong><p>ترجیح به تکرارنشدن پروتئین در دو روز پیاپی</p></article>
          </section>
        </div>
      )}

      {tab === "rules" && (
        <div className="page rules-page">
          <section className="page-intro"><span className="kicker">اختیار از پیش‌تعریف‌شده</span><h1>قوانین تو، خط قرمز لقمه‌اند</h1><p>این قوانین همیشه از امتیاز سلیقه مهم‌ترند و بدون تأیید لحظه‌ای اجرا می‌شوند.</p></section>
          <div className="rules-layout">
            <section className="rules-panel">
              <div className="rule-row">
                <div className="rule-icon"><WalletCards /></div><div><strong>سقف قیمت هر وعده</strong><p>گزینه‌های گران‌تر وارد رتبه‌بندی نمی‌شوند.</p></div>
                <div className="range-wrap"><b>{money(profile.maxPrice)} هزار</b><input aria-label="سقف قیمت" type="range" min="40" max="180" step="5" value={profile.maxPrice} onChange={(event) => setProfile((p) => ({ ...p, maxPrice: Number(event.target.value) }))} /></div>
              </div>
              <div className="rule-row">
                <div className="rule-icon"><UtensilsCrossed /></div><div><strong>حداکثر فست‌فود در هفته</strong><p>برای حفظ تنوع و سبک‌ترشدن برنامه.</p></div>
                <div className="stepper"><button onClick={() => setProfile((p) => ({ ...p, fastFoodLimit: Math.max(0, p.fastFoodLimit - 1) }))}>−</button><b>{money(profile.fastFoodLimit)}</b><button onClick={() => setProfile((p) => ({ ...p, fastFoodLimit: Math.min(5, p.fastFoodLimit + 1) }))}>+</button></div>
              </div>
              <div className="rule-row">
                <div className="rule-icon"><ShieldCheck /></div><div><strong>بازگشت امن به غذای سلف</strong><p>اگر هیچ گزینه‌ای مناسب نبود، غذای سلف انتخاب شود.</p></div>
                <button className={`switch ${profile.preferSelf ? "on" : ""}`} role="switch" aria-checked={profile.preferSelf} onClick={() => setProfile((p) => ({ ...p, preferSelf: !p.preferSelf }))}><span /></button>
              </div>
              <div className="rule-row muted-rule">
                <div className="rule-icon"><RotateCcw /></div><div><strong>جایگزین خودکار</strong><p>اگر انتخاب اول پر شد، سراغ انتخاب دوم و سوم برود.</p></div><span className="fixed-badge">همیشه روشن</span>
              </div>
            </section>
            <aside className="profile-tools">
              <CircleGauge size={26} /><h3>پروفایل قابل انتقال</h3><p>سلیقه و قوانینت را بدون رمز یا اطلاعات حساب سماد برای دوستت بفرست.</p>
              <button onClick={exportProfile}><Download size={17} /> خروجی پروفایل</button>
              <button onClick={() => importRef.current?.click()}><Import size={17} /> ورود پروفایل</button>
              <input ref={importRef} hidden type="file" accept="application/json" onChange={(event) => importProfile(event.target.files?.[0])} />
              <small><LockKeyhole size={13} /> فایل فقط شامل امتیازها و قوانین است.</small>
            </aside>
          </div>
        </div>
      )}

      <footer><span>لقمه، پروژهٔ متن‌باز برای انتخاب بهتر غذای دانشگاه</span><span>نسخهٔ اولیه · حالت امن و مشاهده</span></footer>
    </main>
  );
}
