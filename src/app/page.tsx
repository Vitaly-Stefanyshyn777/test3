import type { Metadata } from "next";
import { headers } from "next/headers";
import HeroSection from "../components/sections/HeroSection";
import AchievmentsSection from "../components/sections/AchievmentsSection/AchievmentsSection";
import TargetAuditorySection from "../components/sections/TargetAuditorySection/TargetAuditorySection";
import CalculateSection from "../components/sections/CalculateSection/CalculateSection";
import LearningFormats from "../components/sections/AboutBFBSection/LearningFormats/LearningFormats";
import BoardSection from "../components/sections/BoardSection/BoardSection";
import CoursesShowcase from "../components/sections/CoursesSection/CoursesShowcase/CoursesShowcase";
import ProductsShowcase from "../components/sections/ProductsSection/ProductsShowcase/ProductsShowcase";
import EventsSection from "../components/sections/EventsSection/EventsSection";
import Founder from "../components/sections/AboutBFBSection/Founder/Founder";
import InstructorAdvantages from "../components/sections/InstructorAdvantages/InstructorAdvantages";
import ContactsSection from "../components/sections/ContactsSection/ContactsSection";

type YoastRobots = {
  index?: string;
  follow?: string;
  ["max-snippet"]?: string;
  ["max-image-preview"]?: string;
  ["max-video-preview"]?: string;
};

type YoastHeadJson = {
  title?: string;
  robots?: YoastRobots;
  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_url?: string;
  og_site_name?: string;
  article_modified_time?: string;
  twitter_card?: string;
};

async function fetchHomeSeo(): Promise<YoastHeadJson | null> {
  try {
    // Для server-side запитів використовуємо headers() для отримання host
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/banners`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[generateMetadata] Failed to fetch banners:", res.status);
      return null;
    }
    const data = await res.json();
    const first = Array.isArray(data) && data.length > 0 ? data[0] : data;
    const yoast = first?.yoast_head_json as YoastHeadJson | undefined;
    if (!yoast) {
      console.warn(
        "[generateMetadata] No yoast_head_json found in banner data"
      );
      return null;
    }
    return yoast;
  } catch (error) {
    console.error("[generateMetadata] Error fetching SEO data:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const yoast = await fetchHomeSeo();

    if (!yoast) {
      console.log("[generateMetadata] Using default metadata");
      return {
        title: "B.F.B Fitness",
        description: "Навчання, інвентар та тренування",
      };
    }

    console.log("[generateMetadata] Using Yoast SEO data:", {
      title: yoast.title,
      og_title: yoast.og_title,
    });

    const robots = yoast.robots ?? {};

    return {
      title: yoast.title ?? "B.F.B Fitness",
      description: "Навчання, інвентар та тренування", // Додаємо description
      robots: {
        index: robots.index !== "noindex",
        follow: robots.follow !== "nofollow",
      },
      openGraph: {
        title: yoast.og_title ?? yoast.title ?? "B.F.B Fitness",
        url: yoast.og_url,
        siteName: yoast.og_site_name ?? "BFB",
        locale: yoast.og_locale ?? "uk_UA",
        type: (yoast.og_type as any) || "website",
      },
      twitter: {
        card: (yoast.twitter_card as any) || "summary_large_image",
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Error:", error);
    return {
      title: "B.F.B Fitness",
      description: "Навчання, інвентар та тренування",
    };
  }
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <AchievmentsSection />
      <TargetAuditorySection />
      <CalculateSection />
      <div className="py-[100px]">
        <LearningFormats />
      </div>
      <BoardSection />
      <CoursesShowcase />
      <EventsSection />
      <div className="py-[100px]">
        <Founder />
      </div>
      <InstructorAdvantages />
      <div className="py-[100px]">
        <ContactsSection />
      </div>
      <ProductsShowcase />
    </>
  );
}
