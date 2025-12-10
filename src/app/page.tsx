import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import AchievmentsSection from "@/components/sections/AchievmentsSection/AchievmentsSection";
import TargetAuditorySection from "@/components/sections/TargetAuditorySection/TargetAuditorySection";
import CalculateSection from "@/components/sections/CalculateSection/CalculateSection";
import LearningFormats from "@/components/sections/AboutBFBSection/LearningFormats/LearningFormats";
import BoardSection from "@/components/sections/BoardSection/BoardSection";
import CoursesShowcase from "@/components/sections/CoursesSection/CoursesShowcase/CoursesShowcase";
import ProductsShowcase from "@/components/sections/ProductsSection/ProductsShowcase/ProductsShowcase";
import EventsSection from "@/components/sections/EventsSection/EventsSection";
import Founder from "@/components/sections/AboutBFBSection/Founder/Founder";
import InstructorAdvantages from "@/components/sections/InstructorAdvantages/InstructorAdvantages";
import ContactsSection from "@/components/sections/ContactsSection/ContactsSection";
import PageLoader from "@/components/PageLoader";

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
    // Викликаємо WordPress API напряму для статичної генерації
    const UPSTREAM_BASE = process.env.UPSTREAM_BASE;
    if (!UPSTREAM_BASE) {
      console.warn("[generateMetadata] UPSTREAM_BASE not configured");
      return null;
    }

    // Отримуємо токен для авторизації
    const normalize = (v?: string) => (v || "").replace(/^['"]|['"]$/g, "");
    const username = normalize(process.env.ADMIN_USER);
    const password = normalize(process.env.ADMIN_PASS);

    let freshToken: string | undefined;
    if (username && password) {
      try {
        const tokenRes = await fetch(
          `${UPSTREAM_BASE}/wp-json/jwt-auth/v1/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            next: { revalidate: 3600 }, // Кешуємо токен на 1 годину
          }
        );

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          freshToken = tokenData?.token;
        }
      } catch (tokenError) {
        console.warn("[generateMetadata] Failed to get auth token:", tokenError);
      }
    }

    // Запитуємо дані банерів напряму з WordPress
    const targetUrl = new URL(`${UPSTREAM_BASE}/wp-json/wp/v2/banner`);

    const headers: Record<string, string> = {};
    if (freshToken) {
      headers["Authorization"] = `Bearer ${freshToken}`;
    }

    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers,
      next: { revalidate: 3600 }, // Кешуємо банери на 1 годину
    });

    if (!res.ok) {
      console.error("[generateMetadata] Failed to fetch banners:", res.status);
      return null;
    }

    const data = await res.json();
    const first = Array.isArray(data) && data.length > 0 ? data[0] : data;
    const yoast = first?.yoast_head_json as YoastHeadJson | undefined;
    if (!yoast) {
      console.warn("[generateMetadata] No yoast_head_json found in banner data");
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
      <PageLoader />
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
