export type Food = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  price: number;
  emoji: string;
  tags: string[];
};

export type DayMenu = {
  day: string;
  date: string;
  mood: string;
  options: Food[];
};

export const foods: Food[] = [
  { id: "juje", name: "چلو جوجه‌کباب", vendor: "رست‌فود شریف", category: "ایرانی", price: 86, emoji: "🍗", tags: ["برنجی", "پروتئین بالا", "کبابی"] },
  { id: "alfredo", name: "پاستا چیکن آلفردو", vendor: "پاستاچیکن", category: "پاستا", price: 118, emoji: "🍝", tags: ["خامه‌ای", "سیرکننده", "مرغ"] },
  { id: "lasagna", name: "لازانیا گوشت", vendor: "کلانا", category: "فرنگی", price: 125, emoji: "🥘", tags: ["گوشت", "پنیر", "سنگین"] },
  { id: "sandwich", name: "ساندویچ رست‌بیف", vendor: "یونی‌فود", category: "ساندویچ", price: 104, emoji: "🥪", tags: ["گوشت", "سریع", "نان"] },
  { id: "falafel", name: "فلافل ویژه", vendor: "کاله", category: "گیاهی", price: 62, emoji: "🧆", tags: ["اقتصادی", "گیاهی", "سرخ‌شده"] },
  { id: "ghorme", name: "قورمه‌سبزی", vendor: "سلف مرکزی", category: "سلف", price: 28, emoji: "🍛", tags: ["برنجی", "خورشتی", "اقتصادی"] },
  { id: "pizza", name: "پیتزا سیر و استیک", vendor: "شریف فست‌فود", category: "فست‌فود", price: 139, emoji: "🍕", tags: ["گوشت", "پنیر", "فست‌فود"] },
  { id: "zereshk", name: "زرشک‌پلو با مرغ", vendor: "رست‌فود شریف", category: "ایرانی", price: 82, emoji: "🍚", tags: ["برنجی", "مرغ", "ایرانی"] },
];

export const weekMenus: DayMenu[] = [
  { day: "شنبه", date: "۶ مهر", mood: "شروع پرانرژی", options: [foods[0], foods[2], foods[5], foods[4]] },
  { day: "یکشنبه", date: "۷ مهر", mood: "انتخاب متعادل", options: [foods[1], foods[3], foods[5], foods[7]] },
  { day: "دوشنبه", date: "۸ مهر", mood: "روز شلوغ", options: [foods[2], foods[0], foods[6], foods[5]] },
  { day: "سه‌شنبه", date: "۹ مهر", mood: "سریع و جمع‌وجور", options: [foods[3], foods[4], foods[1], foods[5]] },
  { day: "چهارشنبه", date: "۱۰ مهر", mood: "پایان سبک‌تر", options: [foods[7], foods[4], foods[5], foods[1]] },
];

export const initialRatings: Record<string, number> = {
  juje: 84,
  alfredo: 79,
  lasagna: 72,
  sandwich: 76,
  falafel: 58,
  ghorme: 68,
  pizza: 74,
  zereshk: 70,
};

export const comparisonPairs = [
  ["juje", "alfredo"],
  ["lasagna", "sandwich"],
  ["pizza", "ghorme"],
  ["zereshk", "falafel"],
  ["alfredo", "lasagna"],
  ["juje", "sandwich"],
] as const;
