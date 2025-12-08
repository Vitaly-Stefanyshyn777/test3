"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  WalkingIcon,
  StudentHatIcon,
  User2Icon,
  Weight3Icon,
  InstagramIcon,
} from "@/components/Icons/Icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { SwiperRef } from "swiper/react";
import s from "./Team.module.css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { normalizeImageUrl } from "@/lib/imageUtils";
import TeamSkeleton from "./TeamSkeleton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface TeamMemberUi {
  id: number | string;
  name: string;
  role: string;
  image: string;
  instagram: string;
  achievements: { icon: React.ReactNode; text: string }[];
}

interface InstructorApi {
  id?: number;
  title?: { rendered?: string };
  // Старі поля для fallback
  Status?: string;
  Avatar?: string;
  Text_instagram?: string;
  Point_1?: string;
  Point_2?: string;
  Experience?: string;
  // Нові acf поля
  acf?: {
    input_text_status?: string;
    img_link_data_avatar?: string;
    input_text_experience?: string;
    input_text_count_training?: string;
    input_text_certificates?: string;
    textarea_about_me?: string;
    textarea_description?: string;
    instagram?: {
      title?: string;
      url?: string;
      target?: string;
    };
    point_data_specialization?: Array<{
      specialization?: string;
    }>;
    points?: Array<{
      point?: string;
    }>;
  };
}

export default function Team() {
  const swiperRef = useRef<SwiperRef>(null);
  const [active, setActive] = useState(0);
  const [members, setMembers] = useState<TeamMemberUi[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadedStates, setImageLoadedStates] = useState<Record<string | number, boolean>>({});

  const baseMembers: TeamMemberUi[] = useMemo(
    () => [
      {
        id: 1,
        name: "Ліка Фітденс",
        role: "Засновниця BFB",
        image: "/images/Rectangle5898.png",
        instagram: "@lika_fitdance",
        achievements: [
          {
            icon: <WalkingIcon className={s.achievementIconSvg} />,
            text: "Засновниця BFB",
          },
          {
            icon: <StudentHatIcon className={s.achievementIconSvg} />,
            text: "Ідеологиня платформи та напрямку",
          },
          {
            icon: <User2Icon className={s.achievementIconSvg} />,
            text: "Об'єднує людей навколо фітнесу",
          },
          {
            icon: <Weight3Icon className={s.achievementIconSvg} />,
            text: "12 років практичного досвіду",
          },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    (async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
        const res = await fetch(`${baseUrl}/wp-json/wp/v2/instructors`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as InstructorApi[];
        const mapped: TeamMemberUi[] = (Array.isArray(data) ? data : []).map(
          (i) => {
            const acf = i?.acf || {};
            const name: string = i?.title?.rendered || "";
            // Використовуємо нові acf поля з fallback на старі
            const role: string = (acf.input_text_status as string) || i?.Status || "";
            // Нормалізуємо avatar URL (може бути JSON рядком)
            const rawImage = (acf.img_link_data_avatar as string) || i?.Avatar || "";
            const normalizedImage = normalizeImageUrl(rawImage);
            const image: string = normalizedImage !== "/placeholder.svg" ? normalizedImage : "/images/Rectangle5898.png";
            const instagram: string = (acf.instagram as { title?: string })?.title || i?.Text_instagram || "";
            const achievements: TeamMemberUi["achievements"] = [];
            
            if (role) {
              achievements.push({
                icon: <WalkingIcon className={s.achievementIconSvg} />,
                text: role,
              });
            }
            
            // Використовуємо points з acf або старі Point_1, Point_2
            const points = acf.points as Array<{ point?: string }> | undefined;
            if (points && Array.isArray(points) && points.length > 0) {
              points.forEach((point, index) => {
                if (point.point) {
                  const icons = [<StudentHatIcon className={s.achievementIconSvg} />, <User2Icon className={s.achievementIconSvg} />, <Weight3Icon className={s.achievementIconSvg} />];
                  achievements.push({
                    icon: icons[index % icons.length],
                    text: point.point,
                  });
                }
              });
            } else {
              // Fallback на старі поля
              if (i?.Point_1)
                achievements.push({
                  icon: <StudentHatIcon className={s.achievementIconSvg} />,
                  text: i.Point_1,
                });
              if (i?.Point_2)
                achievements.push({
                  icon: <User2Icon className={s.achievementIconSvg} />,
                  text: i.Point_2,
                });
            }
            
            // Додаємо досвід з acf або старого поля
            const experience = (acf.input_text_experience as string) || i?.Experience;
            if (experience)
              achievements.push({
                icon: <Weight3Icon className={s.achievementIconSvg} />,
                text: `Досвід: ${experience}`,
              });
            return {
              id: i?.id ?? name,
              name,
              role,
              image,
              instagram,
              achievements,
            };
          }
        );
        setMembers(mapped.length > 0 ? mapped : baseMembers);
      } catch {
        setMembers(baseMembers);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [baseMembers]);

  const teamMembers = members ?? baseMembers;

  const handlePrev = () => swiperRef.current?.swiper.slidePrev();
  const handleNext = () => swiperRef.current?.swiper.slideNext();

  const handleImageLoad = (memberId: number | string) => {
    setImageLoadedStates((prev) => ({ ...prev, [memberId]: true }));
  };

  if (isLoading) {
    return <TeamSkeleton />;
  }

  return (
    <section className={s.teamSection}>
      <div className={s.teamContainer}>
        <div className={s.teamHeader}>
          <span className={s.teamSubtitle}>Наша команда</span>
          <h2 className={s.teamTitle}>Люди, які створюють BFB</h2>
        </div>

        <div className={s.swiperContainer}>
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            slidesPerGroup={1}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            onSlideChange={(swiper) => setActive(swiper.activeIndex)}
            className={s.swiper}
          >
            {teamMembers.map((member) => (
              <SwiperSlide key={member.id} className={s.swiperSlide}>
                <div className={s.teamCard}>
                  <div className={s.teamCardImage}>
                    {!imageLoadedStates[member.id] && (
                      <Skeleton
                        height="100%"
                        width="100%"
                        style={{
                          position: "absolute",
                          inset: 0,
                          zIndex: 1,
                        }}
                      />
                    )}
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 300px"
                      className={s.teamCardImageInner}
                      onLoad={() => handleImageLoad(member.id)}
                      style={{
                        opacity: imageLoadedStates[member.id] ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                    <div className={s.instagramHandle}>
                      <InstagramIcon />
                      <p className={s.instagramHandleText}>
                        {member.instagram}
                      </p>
                    </div>
                  </div>

                  <div className={s.teamCardContent}>
                    <div className={s.teamCardContentHeader}>
                      <div className={s.teamCardRole}>{member.role}</div>
                      <h3 className={s.teamCardName}>{member.name}</h3>
                    </div>

                    <div className={s.achievementsList}>
                      {member.achievements.map((achievement, index) => (
                        <div key={index} className={s.achievementItem}>
                          <div className={s.achievementIcon}>
                            {achievement.icon}
                          </div>
                          <span className={s.achievementText}>
                            {achievement.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {teamMembers.length > 4 && (
          <SliderNav
            activeIndex={active}
            dots={teamMembers.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onDotClick={(idx) => swiperRef.current?.swiper.slideTo(idx)}
          />
        )}
      </div>
    </section>
  );
}
