import { usePlayer } from "@/contexts/PlayerContext";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import Slider from "rc-slider";

import "rc-slider/assets/index.css";
import { convertDurationToTimeString } from "@/utils/convertDurationToTimeString";

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    isLooping,
    toggleLoop,
    isShuffling,
    toggleShuffle,
    clearPlayerState,
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener() {
    audioRef.current?.currentTime = 0;
    audioRef.current?.addEventListener("timeupdate", (event) => {
      setProgress(Math.floor(audioRef.current?.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current?.currentTime = amount;
    setProgress(amount);
  }

  function handleEspisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
            alt=""
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={episode ? "" : styles.empty}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress) ?? 0}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                trackStyle={{ backgroundColor: "#04d361" }}
                railStyle={{ backgroundColor: "#9f75ff" }}
                handleStyle={{ borderColor: "#04d361", borderWidth: 4 }}
                max={episode.duration}
                onChange={() => handleSeek}
                value={progress}
              />
            ) : (
              <div className={styles.emptySlider}></div>
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration) ?? 0}</span>
        </div>

        {episode && (
          <audio
            ref={audioRef}
            src={episode.url}
            loop={isLooping}
            autoPlay
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
            onEnded={handleEspisodeEnded}
          ></audio>
        )}

        <div className={styles.buttons}>
          <button type="button">
            <img
              src="/shuffle.svg"
              alt="Embaralhar"
              onClick={() => toggleShuffle()}
              className={isShuffling ? styles.isActive : ""}
              disabled={!episode || episodeList.length === 1}
            />
          </button>
          <button
            type="button"
            onClick={() => playPrevious()}
            disabled={hasPrevious}
          >
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src="/pause.svg" alt="Tocar" />
            ) : (
              <img src="/play.svg" alt="Tocar" />
            )}
          </button>
          <button type="button" onClick={() => playNext()} disabled={hasNext}>
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>
          <button
            type="button"
            onClick={() => toggleLoop()}
            className={isLooping ? styles.isActive : ""}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
