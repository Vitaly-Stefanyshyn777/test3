"use client";
import React, { useEffect, useState } from "react";
import {
  HeartbeatIcon,
  DumbbellsIcon,
  DiplomaIcon,
} from "@/components/Icons/Icons";
import s from "./Founder.module.css";
import { useInstructorQuery } from "@/components/hooks/useWpQueries";
import {
  InstagramIcon,
  StudentHatIcon,
  HonorsIcon,
  BulbIcon,
} from "@/components/Icons/Icons";
import { normalizeImageUrl } from "@/lib/imageUtils";

interface Instructor {
  title: string;
  status: string;
  avatar: string;
  experience: string;
  countTraining: string;
  certificates: string;
  linkInstagram: string;
  textInstagram: string;
  aboutMe: string;
  myMission: string;
}

export default function Founder() {
  const [data, setData] = useState<Instructor | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { data: raw, isLoading, isError } = useInstructorQuery(233);

  useEffect(() => {
    if (!raw) return;

    // Використовуємо нові acf поля, з fallback на старі поля для сумісності
    const acf = (raw as { acf?: Record<string, unknown> })?.acf || {};

    // Нормалізуємо avatar URL (може бути JSON рядком)
    const rawAvatar =
      (acf.img_link_data_avatar as string) ||
      (raw as { Avatar?: string }).Avatar ||
      "";
    const normalizedAvatar = normalizeImageUrl(rawAvatar);
    const avatar =
      normalizedAvatar !== "/placeholder.svg" ? normalizedAvatar : "";

    const mapped: Instructor = {
      title: raw?.title?.rendered || "",
      status:
        (acf.input_text_status as string) ||
        (raw as { Status?: string }).Status ||
        "Засновниця BFB",
      avatar,
      experience:
        (acf.input_text_experience as string) ||
        (raw as { Experience?: string }).Experience ||
        "",
      countTraining:
        (acf.input_text_count_training as string) ||
        (raw as { Count_training?: string }).Count_training ||
        "",
      certificates:
        (acf.input_text_certificates as string) ||
        (raw as { Certificates?: string }).Certificates ||
        "",
      linkInstagram:
        (acf.instagram as { url?: string })?.url ||
        (raw as { Link_instagram?: string }).Link_instagram ||
        "",
      textInstagram:
        (acf.instagram as { title?: string })?.title ||
        (raw as { Text_instagram?: string }).Text_instagram ||
        "",
      aboutMe:
        (acf.textarea_about_me as string) ||
        (acf.textarea_description as string) ||
        (raw as { About_me?: string; Description?: string }).About_me ||
        (raw as { About_me?: string; Description?: string }).Description ||
        "",
      myMission:
        (acf.textarea_my_mission as string) ||
        (raw as { My_mission?: string }).My_mission ||
        "",
    };
    setData(mapped);
  }, [raw]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  const achievements = [
    {
      id: 1,
      icon: <HeartbeatIcon />,
      number: data?.experience || "",
      description: "Практичного досвіду у сфері фітнесу та тренерської роботи",
    },
    {
      id: 2,
      icon: <DumbbellsIcon />,
      number: data?.countTraining || "",
      description: "Практичні майстер-класи для професійного розвитку тренерів",
    },
    {
      id: 3,
      icon: <DiplomaIcon />,
      number: data?.certificates || "",
      description:
        "Сертифікувала сотні тренерів по всій Україні та за її межами",
    },
  ];

  if (isError) {
    return (
      <section className={s.founderSection}>
        <div className={s.founderContainer}>
          <div className={s.missionCard}>
            <div className={s.missionCardContent}>
              <h3 className={s.missionTitle}>Не вдалося завантажити</h3>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={s.founderSection}>
      <div className={s.founderContainer}>
        <div className={s.founderLeft}>
          <div className={s.founderCard}>
            <div className={s.founderAboutMe}>
              <div className={s.founderAboutMeIcon}>
                <InstagramIcon />
              </div>
              <p className={s.founderAboutMeNickname}>
                {data?.textInstagram || ""}
              </p>
              <div></div>
            </div>
            <div className={s.foundermission}>
              <h4 className={s.founderAboutMeTitle}>Про мене</h4>
              <p className={s.founderAboutMeText}>{data?.aboutMe || ""}</p>
            </div>
          </div>

          <div className={s.founderMission}>
            <div className={s.founderMissionIcons}>
              <div className={s.founderMissionIcon}>
                <StudentHatIcon />
              </div>
              <div className={s.founderMissionIcon}>
                <HonorsIcon />
              </div>
              <div className={s.founderMissionIcon}>
                <BulbIcon />
              </div>
            </div>
            <div className={s.founderMissionContent}>
              <h4 className={s.founderMissionTitle}>Моя місія</h4>
              <p className={s.founderMissionText}>{data?.myMission || ""}</p>
            </div>
          </div>
        </div>
        <div
          className={s.missionCard}
          style={{
            backgroundImage: data?.avatar ? `url(${data.avatar})` : undefined,
          }}
        >
          <div className={s.missionCardContent}>
            <h3 className={s.missionTitle}>
              {data?.status || "Засновниця BFB"}{" "}
            </h3>
            <p className={s.missionText}>{data?.title || ""}</p>
          </div>
        </div>

        <div className={s.achievements}>
          {achievements.map((achievement) => (
            <div key={achievement.id} className={s.achievementCard}>
              <div className={s.achievementIcon}>{achievement.icon}</div>
              <div className={s.achievementNumberDescription}>
                {isMobile ? (
                  <p className={s.achievementDescription}>
                    <span className={s.achievementNumberInline}>
                      {achievement.number}
                    </span>
                    {achievement.description}
                  </p>
                ) : (
                  <>
                    <h4 className={s.achievementNumber}>
                      {achievement.number}
                    </h4>
                    <p className={s.achievementDescription}>
                      {achievement.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
