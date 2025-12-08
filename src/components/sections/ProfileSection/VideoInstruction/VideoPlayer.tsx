"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./VideoPlayer.module.css";
import { CloseButtonIcon } from "../../../Icons/Icons";
import VideoPlayerSkeleton from "./VideoPlayerSkeleton";

interface VideoPlayerProps {
  videoUrl: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  overlayPlayButton?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  onlyPlayPause?: boolean; // custom minimal control: only play/pause button overlay
  noBlur?: boolean; // Remove backdrop-filter blur from play button (for Hero)
}

export default function VideoPlayer({
  videoUrl,
  className = "",
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  poster,
  overlayPlayButton = true,
  showCloseButton = false,
  onClose,
  onlyPlayPause = false,
  noBlur = false,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(!!autoPlay);
  const [showPreview, setShowPreview] = useState<boolean>(
    overlayPlayButton && !autoPlay
  );
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    setIsLoading(true);
    setError(null);
    video.load();

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      const errorMsg = video.error?.message || "Не вдалося завантажити відео";
      setError(errorMsg);
      if (process.env.NODE_ENV !== "production") {
        console.error("[VideoPlayer] Error loading video:", {
          url: videoUrl,
          error: video.error,
          code: video.error?.code,
        });
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoUrl]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setShowOverlay(true);
    } else {
      video.play();
      setShowOverlay(false);
    }
  };

  const handleStartFromPreview = () => {
    setShowPreview(false);
    setShowOverlay(false);
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  };

  if (error) {
    return (
      <div className={className}>
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-2">URL: {videoUrl}</p>
        </div>
      </div>
    );
  }

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !showOverlay) {
      video.pause();
      setShowOverlay(true);
    }
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      onClick={handleVideoClick}
    >
      {showCloseButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className={styles.closeButton}
        >
          <CloseButtonIcon className={styles.closeIcon} />
          <span className={styles.closeButtonText}>Приховати</span>
        </button>
      )}

      {showPreview && (
        <button
          type="button"
          onClick={handleStartFromPreview}
          className={styles.previewButton}
          aria-label="Play preview"
        >
          {poster ? (
            <Image
              src={poster}
              alt="Video preview"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className={styles.previewImage}
            />
          ) : null}
          <span className={styles.playButton}>
            <Image
              src="/images/Vector5.svg"
              width={36}
              height={40}
              alt="Play"
              className={styles.playIcon}
            />
          </span>
        </button>
      )}
      {isLoading && !showPreview && (
        <VideoPlayerSkeleton
          showCloseButton={showCloseButton}
          asOverlay={true}
        />
      )}

      <video
        ref={videoRef}
        className={styles.video}
        controls={showPreview ? false : onlyPlayPause ? false : controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        poster={poster}
        preload="metadata"
        src={videoUrl}
        style={{
          opacity: isLoading && !showPreview ? 0 : 1,
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Ваш браузер не підтримує відео тег.
      </video>

      {(!controls || onlyPlayPause) && !showPreview && showOverlay && (
        <div
          className={`${styles.overlay} ${noBlur ? styles.overlayNoBlur : ""}`}
        >
          <button
            type="button"
            className={`${styles.playPauseButton} ${
              noBlur ? styles.noBlur : ""
            }`}
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <span className={styles.pauseIcon} />
            ) : (
              <Image
                src="/images/Vector5.svg"
                width={27}
                height={30}
                alt="Play"
                className={styles.playTriangle}
              />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
