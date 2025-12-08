"use client";
import React from "react";
import styles from "./CommunityChats.module.css";
import { TelegramIcon } from "@/components/Icons/Icons";

interface ChatItem {
  id: string;
  title: string;
  handle: string;
  url?: string;
}

interface CommunityChatsProps {
  title?: string;
  chats?: ChatItem[];
}

const defaultChats: ChatItem[] = [
  {
    id: "main-channel",
    title: "Основний канал",
    handle: "@BFBmain",
    url: "https://t.me/BFBmain",
  },
  {
    id: "trainers-chat-1",
    title: "Чат тренерів",
    handle: "@BFBmain",
    url: "https://t.me/BFBmain",
  },
  {
    id: "trainers-chat-2",
    title: "Чат тренерів",
    handle: "@BFBmain",
    url: "https://t.me/BFBmain",
  },
  {
    id: "info-chat",
    title: "Інфо чат",
    handle: "@BFBmain",
    url: "https://t.me/BFBmain",
  },
];

const CommunityChats: React.FC<CommunityChatsProps> = ({
  title = "Посилання на чати з ком'юніті",
  chats = defaultChats,
}) => {
  const handleChatClick = (chat: ChatItem) => {
    if (chat.url) {
      window.open(chat.url, "_blank");
    }
  };

  return (
    <div className={styles.communityChats}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.chatsGrid}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={styles.chatCard}
            onClick={() => handleChatClick(chat)}
          >
            <div className={styles.chatIcon}>
              <TelegramIcon className={styles.telegramIcon} />
            </div>
            <div className={styles.chatInfo}>
              <h3 className={styles.chatTitle}>{chat.title}</h3>
              <p className={styles.chatHandle}>{chat.handle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityChats;
