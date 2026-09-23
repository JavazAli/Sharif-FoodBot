import type { Metadata } from "next";
import FoodbotApp from "./FoodbotApp";

export const metadata: Metadata = {
  title: { absolute: "لقمه | انتخاب‌گر هوشمند غذای شریف" },
  description:
    "سلیقه‌ات را یاد می‌گیرد، قوانینت را رعایت می‌کند و برای هر روز بهترین انتخاب را آماده می‌گذارد.",
};

export default function Home() {
  return <FoodbotApp />;
}
