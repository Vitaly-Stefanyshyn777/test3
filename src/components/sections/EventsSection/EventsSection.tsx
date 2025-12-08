"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import s from "./EventsSection.module.css";
import {
  ArrowLeftIcon,
  RightArrowIcon,
  StudentHatIcon,
  User2Icon,
  WalkingIcon,
  WeightIcon,
  CloseButtonIcon,
} from "@/components/Icons/Icons";
import { useEventsQuery } from "@/components/hooks/useWpQueries";
import type { EventPost } from "@/lib/bfbApi";
import { normalizeImageUrl } from "@/lib/imageUtils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Event {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  image: string;
  location: string;
  venue: string;
  dateRange: string;
  results: {
    icon: string;
    text: string;
  }[];
}

// Масив місяців у називному відмінку (для заголовка календаря)
const monthNames = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const formatDateUkrainian = (dateString: string): string => {
  let normalizedDate = dateString;
  if (dateString.includes("/")) {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  const date = new Date(normalizedDate);
  const months = [
    "Січня",
    "Лютого",
    "Березня",
    "Квітня",
    "Травня",
    "Червня",
    "Липня",
    "Серпня",
    "Вересня",
    "Жовтня",
    "Листопада",
    "Грудня",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

const formatDateRange = (
  schedule: Array<{
    date?: string;
  }>
): string => {
  if (!schedule || schedule.length === 0) return "";

  const dates = schedule
    .map((s) => {
      const dateValue = s.date;
      if (!dateValue) return null;
      if (dateValue.includes("/")) {
        const parts = dateValue.split("/");
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      return dateValue;
    })
    .filter(Boolean)
    .sort();

  if (dates.length === 0) return "";
  if (dates.length === 1) {
    const date = new Date(dates[0]!);
    const months = [
      "СІЧНЯ",
      "ЛЮТОГО",
      "БЕРЕЗНЯ",
      "КВІТНЯ",
      "ТРАВНЯ",
      "ЧЕРВНЯ",
      "ЛИПНЯ",
      "СЕРПНЯ",
      "ВЕРЕСНЯ",
      "ЖОВТНЯ",
      "ЛИСТОПАДА",
      "ГРУДНЯ",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  const firstDate = new Date(dates[0]!);
  const lastDate = new Date(dates[dates.length - 1]!);
  const months = [
    "СІЧНЯ",
    "ЛЮТОГО",
    "БЕРЕЗНЯ",
    "КВІТНЯ",
    "ТРАВНЯ",
    "ЧЕРВНЯ",
    "ЛИПНЯ",
    "СЕРПНЯ",
    "ВЕРЕСНЯ",
    "ЖОВТНЯ",
    "ЛИСТОПАДА",
    "ГРУДНЯ",
  ];

  if (firstDate.getMonth() === lastDate.getMonth()) {
    return `${firstDate.getDate()}-${lastDate.getDate()} ${
      months[firstDate.getMonth()]
    } ${firstDate.getFullYear()}`;
  }

  return `${firstDate.getDate()} ${
    months[firstDate.getMonth()]
  }-${lastDate.getDate()} ${
    months[lastDate.getMonth()]
  } ${firstDate.getFullYear()}`;
};

const getScheduleFromEventPost = (
  eventPost: EventPost
): Array<{
  date?: string;
  time?: string;
}> => {
  const acf = eventPost.acf || {};
  let scheduleData = acf.hl_data_schedule;

  if (typeof scheduleData === "string") {
    try {
      scheduleData = JSON.parse(scheduleData);
    } catch {
      return [];
    }
  }

  if (scheduleData && Array.isArray(scheduleData)) {
    return scheduleData.map((item: any) => ({
      date: item.hl_input_date_date || "",
      time: item.hl_input_time_time || "",
    }));
  }

  return [];
};

const mapEventPostToEvent = (
  eventPost: EventPost,
  isMobile: boolean = false
): Event => {
  const acf = eventPost.acf || {};
  const schedule = getScheduleFromEventPost(eventPost);
  const firstSchedule = schedule[0];
  const eventDate = firstSchedule?.date || "";
  const eventTime = firstSchedule?.time || "12:00";
  const formattedDate = eventDate ? formatDateUkrainian(eventDate) : "";
  const dateRange = formatDateRange(schedule);

  let results: Array<{ icon: string; text: string }> = [];
  let resultData = acf.hl_data_result;

  if (typeof resultData === "string") {
    try {
      resultData = JSON.parse(resultData);
    } catch {
      resultData = undefined;
    }
  }

  if (resultData && Array.isArray(resultData)) {
    results = resultData.map((result: any) => ({
      icon: result.hl_img_svg_icon || "",
      text: result.hl_input_text_text || "",
    }));
  }

  let bannerSource: string | undefined = undefined;

  if (
    acf.img_link_data_banner &&
    typeof acf.img_link_data_banner === "string" &&
    !acf.img_link_data_banner.trim().startsWith("[")
  ) {
    bannerSource = acf.img_link_data_banner;
  }

  const bannerUrl = normalizeImageUrl(bannerSource);

  return {
    id: String(eventPost.id),
    date: formattedDate,
    time: eventTime,
    title: eventPost.title?.rendered || "",
    description: acf.textarea_description || "",
    image: bannerUrl,
    location: acf.input_text_city || "",
    venue: acf.input_text_location || "",
    dateRange,
    results,
  };
};

const EventsSection: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: eventsData = [], isLoading, isError } = useEventsQuery();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
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

  const events: Event[] = useMemo(() => {
    if (!eventsData || eventsData.length === 0) return [];
    return eventsData.map((eventPost) =>
      mapEventPostToEvent(eventPost, isMobile)
    );
  }, [eventsData, isMobile]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventPost>();

    if (eventsData && eventsData.length > 0) {
      eventsData.forEach((eventPost) => {
        const schedule = getScheduleFromEventPost(eventPost);
        schedule.forEach((scheduleItem) => {
          const dateValue = scheduleItem.date;
          if (dateValue && !map.has(dateValue)) {
            map.set(dateValue, eventPost);
          }
        });
      });
    }

    return map;
  }, [eventsData]);

  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const calendarDays = [];
    const eventDates = new Set<number>();

    if (eventsData && eventsData.length > 0) {
      eventsData.forEach((eventPost) => {
        const schedule = getScheduleFromEventPost(eventPost);
        schedule.forEach((scheduleItem) => {
          const dateValue = scheduleItem.date;
          if (dateValue) {
            const normalizedDate = dateValue.includes("/")
              ? dateValue.split("/").reverse().join("-")
              : dateValue;
            const eventDate = new Date(normalizedDate);
            if (
              eventDate.getMonth() === month &&
              eventDate.getFullYear() === year
            ) {
              eventDates.add(eventDate.getDate());
            }
          }
        });
      });
    }

    const hasEventOnDay = (day: number) => eventDates.has(day);

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === currentDay && month === currentMonth && year === currentYear;

      calendarDays.push({
        day,
        isCurrentMonth: true,
        isToday,
        hasEvent: hasEventOnDay(day),
      });
    }

    const remainingDays = 35 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
      });
    }

    return calendarDays;
  };

  const calendarDays = generateCalendar(currentDate);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const isModalOpen = isMobile && selectedEvent !== null;

    if (isModalOpen) {
      const currentScrollY = window.scrollY;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${currentScrollY}px`;
      document.body.classList.add("events-modal-open");

      document.body.setAttribute("data-scroll-y", currentScrollY.toString());
    } else {
      const savedScrollY = document.body.getAttribute("data-scroll-y");
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      document.body.style.top = "unset";
      document.body.classList.remove("events-modal-open");
      document.body.removeAttribute("data-scroll-y");

      if (savedScrollY) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScrollY));
        });
      }
    }

    return () => {
      const savedScrollY = document.body.getAttribute("data-scroll-y");
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      document.body.style.top = "unset";
      document.body.classList.remove("events-modal-open");
      document.body.removeAttribute("data-scroll-y");

      if (savedScrollY) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScrollY));
        });
      }
    };
  }, [isMobile, selectedEvent]);

  // Скидаємо selectedEvent при переході на мобільну версію
  React.useEffect(() => {
    if (isMobile && selectedEvent !== null) {
      setSelectedEvent(null);
    }
  }, [isMobile]);

  // Встановлюємо обрану подію при завантаженні даних (тільки для десктопу)
  React.useEffect(() => {
    if (events.length > 0 && !selectedEvent && !isMobile) {
      setSelectedEvent(events[0]);

      // Знаходимо перший день першої події для підсвітки в календарі
      const firstEventPost = eventsData[0];
      if (firstEventPost) {
        const schedule = getScheduleFromEventPost(firstEventPost);
        const firstScheduleDate = schedule[0]?.date;
        if (firstScheduleDate) {
          // Нормалізуємо дату (може бути DD/MM/YYYY або YYYY-MM-DD)
          const normalizedDate = firstScheduleDate.includes("/")
            ? firstScheduleDate.split("/").reverse().join("-") // DD/MM/YYYY -> YYYY-MM-DD
            : firstScheduleDate;
          const eventDay = new Date(normalizedDate).getDate();
          setSelectedDay(eventDay);
        }
      }
    }
  }, [events, selectedEvent, eventsData, isMobile]);

  // Скидаємо стан завантаження зображення при зміні події
  React.useEffect(() => {
    setImageLoaded(false);
  }, [selectedEvent]);

  // Функція для обробки кліку на день календаря
  const handleDayClick = (
    day: number,
    isCurrentMonth: boolean,
    hasEvent: boolean
  ) => {
    if (!isCurrentMonth || !hasEvent) return;

    // Формуємо дату в форматі YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    // Шукаємо подію для цієї дати
    const eventPost = eventsByDate.get(dateKey);
    if (eventPost) {
      const event = mapEventPostToEvent(eventPost);
      setSelectedEvent(event);
      setSelectedDay(day); // Встановлюємо вибраний день
    }
  };

  const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "НД"];

  const goToPreviousMonth = () => {
    if (!currentDate) return;
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (!currentDate) return;
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDay(null);
  };

  if (!isMounted) return null;

  if (isError) {
    return (
      <section className={s.section}>
        <div className={s.container}>
          <div className={s.header}>
            <div className={s.headerLine}></div>
            <div className={s.TitleTextBlock}>
              <p className={s.headerText}>Календар подій</p>
              <h2 className={s.title}>
                Живі події, реальні люди, фітнес, який надихає
              </h2>
            </div>
          </div>
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            Помилка завантаження подій. Спробуйте пізніше.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className={s.section}>
      <div className={s.container}>
        <div className={s.header}>
          <div className={s.headerLine}></div>
          <div className={s.TitleTextBlock}>
            <p className={s.headerText}>Календар подій</p>
            <h2 className={s.title}>
              Живі події, реальні люди, фітнес, який надихає
            </h2>
          </div>
        </div>

        <div className={s.content}>
          <div className={s.leftColumn}>
            <div className={s.leftColumnWrapper}>
              <div className={s.calendarBlock}>
                <div className={s.calendar}>
                  <div className={s.calendarHeader}>
                    <h3 className={s.monthTitle}>
                      <span className={s.monthName}>
                        {monthNames[currentDate.getMonth()]}
                      </span>
                      <span className={s.monthYear}>
                        {currentDate.getFullYear()}
                      </span>
                    </h3>
                    <div className={s.monthNavigation}>
                      <button
                        className={s.navButton}
                        onClick={goToPreviousMonth}
                      >
                        <div className={s.navButtonIcon}>
                          <ArrowLeftIcon />
                        </div>
                      </button>
                      <button className={s.navButton} onClick={goToNextMonth}>
                        <div className={s.navButtonIcon}>
                          <RightArrowIcon />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className={s.calendarContent}>
                    <div className={s.weekDays}>
                      {weekDays.map((day) => (
                        <div key={day} className={s.weekDay}>
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className={s.calendarGrid}>
                      {calendarDays.map((day, index) => (
                        <div
                          key={index}
                          className={`${s.calendarDay} ${
                            !day.isCurrentMonth ? s.otherMonth : ""
                          } ${day.isToday ? s.selected : ""} ${
                            day.hasEvent ? s.hasEvent : ""
                          } ${
                            selectedDay === day.day && day.isCurrentMonth
                              ? s.selectedEventDay
                              : ""
                          }`}
                          tabIndex={-1}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDayClick(
                              day.day,
                              day.isCurrentMonth,
                              day.hasEvent
                            );
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          style={
                            day.hasEvent && day.isCurrentMonth
                              ? { cursor: "pointer" }
                              : undefined
                          }
                        >
                          {day.day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <h3 className={s.eventsTitle}>Календар подій</h3>
              <div className={s.eventsListBlock}>
                <div className={s.eventsList}>
                  {events.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                      Подій поки що немає
                    </div>
                  ) : (
                    events.map((event, index) => {
                      const eventPost = eventsData.find(
                        (e) => String(e.id) === event.id
                      );
                      const schedule = eventPost
                        ? getScheduleFromEventPost(eventPost)
                        : [];
                      const firstScheduleDate = schedule[0]?.date;
                      const eventDay = firstScheduleDate
                        ? (() => {
                            // Нормалізуємо дату (може бути DD/MM/YYYY або YYYY-MM-DD)
                            const normalizedDate = firstScheduleDate.includes(
                              "/"
                            )
                              ? firstScheduleDate.split("/").reverse().join("-") // DD/MM/YYYY -> YYYY-MM-DD
                              : firstScheduleDate;
                            return new Date(normalizedDate).getDate();
                          })()
                        : null;

                      return (
                        <div
                          key={event.id}
                          className={`${s.eventItem} ${
                            selectedEvent?.id === event.id ? s.activeEvent : ""
                          }`}
                          onClick={() => {
                            if (!isMobile) {
                              setSelectedEvent(event);
                              if (eventDay) setSelectedDay(eventDay);
                            }
                          }}
                        >
                          <div className={s.eventDate}>
                            <span className={s.eventDay}>{event.date}</span>
                            <span className={s.eventTime}>{event.time}</span>
                          </div>
                          <div className={s.eventDivider}></div>
                          {isMobile ? (
                            <div className={s.eventInfoWrapper}>
                              <div className={s.eventInfo}>
                                <h4 className={s.eventTitle}>{event.title}</h4>
                              </div>
                              <button
                                className={s.eventDetailsButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                  if (eventDay) setSelectedDay(eventDay);
                                }}
                              >
                                Детальніше
                              </button>
                            </div>
                          ) : (
                            <div className={s.eventInfo}>
                              <h4 className={s.eventTitle}>{event.title}</h4>
                              {event.description && (
                                <p className={s.eventDescription}>
                                  {event.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isMobile && (
            <div className={s.rightColumn}>
              {selectedEvent ? (
                <div className={s.eventCardBlock}>
                  <div className={s.eventCard}>
                    <div className={s.eventCardImage}>
                      {!imageLoaded && (
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
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={s.cardImage}
                        onLoad={() => setImageLoaded(true)}
                        style={{
                          opacity: imageLoaded ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      />
                    </div>
                    <div className={s.eventCardImageWrap}>
                      <div className={s.eventCardContent}>
                        <div className={s.eventCardMeta}>
                          {selectedEvent.dateRange && (
                            <div className={s.cardMetaItem}>
                              <p className={s.cardMetaItemText}>
                                {selectedEvent.dateRange}
                              </p>
                            </div>
                          )}
                          {selectedEvent.location && (
                            <div className={s.cardMetaItem}>
                              <p className={s.cardMetaItemText}>
                                {selectedEvent.location.toUpperCase()}
                              </p>
                            </div>
                          )}
                          {selectedEvent.venue && (
                            <div className={s.cardMetaItem}>
                              <p className={s.cardMetaItemText}>
                                {selectedEvent.venue.toUpperCase()}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className={s.eventCardInfo}>
                          <h3 className={s.eventCardTitle}>
                            {selectedEvent.title}
                          </h3>
                          {selectedEvent.description && (
                            <p className={s.eventCardDescription}>
                              {selectedEvent.description}
                            </p>
                          )}
                        </div>

                        {selectedEvent.results &&
                          selectedEvent.results.length > 0 && (
                            <div className={s.eventCardResults}>
                              <h4 className={s.resultsTitle}>Результат:</h4>
                              <div className={s.resultsGrid}>
                                {selectedEvent.results.map((result, index) => (
                                  <div key={index} className={s.resultItem}>
                                    <span
                                      className={s.resultIcon}
                                      dangerouslySetInnerHTML={{
                                        __html: result.icon || "",
                                      }}
                                    />
                                    <span className={s.resultText}>
                                      {result.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      <button className={s.eventCardButton}>Записатись</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                  Оберіть подію зі списку
                </div>
              )}
            </div>
          )}

          {isMobile && selectedEvent && (
            <div
              className={s.modalOverlay}
              onClick={() => setSelectedEvent(null)}
            >
              <div
                className={s.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={s.modalCloseButton}
                  onClick={() => setSelectedEvent(null)}
                >
                  <CloseButtonIcon />
                </button>
                <div className={s.eventCardBlock}>
                  <div className={s.eventCard}>
                    <div className={s.eventCardImage}>
                      {!imageLoaded && (
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
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={s.cardImage}
                        onLoad={() => setImageLoaded(true)}
                        style={{
                          opacity: imageLoaded ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      />
                    </div>
                    <div className={s.eventCardImageWrap}>
                      <div className={s.eventCardContent}>
                        <div className={s.eventCardMeta}>
                          {selectedEvent.dateRange && (
                            <div className={s.cardMetaItem}>
                              <p className={s.cardMetaItemText}>
                                {selectedEvent.dateRange}
                              </p>
                            </div>
                          )}
                          {selectedEvent.location && (
                            <div className={s.cardMetaItem}>
                              <p className={s.cardMetaItemText}>
                                {selectedEvent.location.toUpperCase()}
                              </p>
                            </div>
                          )}
                          {selectedEvent.venue && (
                            <div className={s.cardMetaItem}>
                              <p className={s.cardMetaItemText}>
                                {selectedEvent.venue.toUpperCase()}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className={s.eventCardInfo}>
                          <h3 className={s.eventCardTitle}>
                            {selectedEvent.title}
                          </h3>
                          {selectedEvent.description && (
                            <p className={s.eventCardDescription}>
                              {selectedEvent.description}
                            </p>
                          )}
                        </div>

                        {selectedEvent.results &&
                          selectedEvent.results.length > 0 && (
                            <div className={s.eventCardResults}>
                              <h4 className={s.resultsTitle}>Результат:</h4>
                              <div className={s.resultsGrid}>
                                {selectedEvent.results.map((result, index) => (
                                  <div key={index} className={s.resultItem}>
                                    <span
                                      className={s.resultIcon}
                                      dangerouslySetInnerHTML={{
                                        __html: result.icon || "",
                                      }}
                                    />
                                    <span className={s.resultText}>
                                      {result.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      <button className={s.eventCardButton}>Записатись</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
