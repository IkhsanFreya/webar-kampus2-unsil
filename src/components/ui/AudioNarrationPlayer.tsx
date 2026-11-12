"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, Sparkles, RotateCcw } from "lucide-react";

interface AudioNarrationPlayerProps {
  audioPath: string;
  title: string;
  duration?: number;
}

export const AudioNarrationPlayer: React.FC<AudioNarrationPlayerProps> = ({
  audioPath,
  title,
  duration = 15,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isSynthFallback, setIsSynthFallback] = useState<boolean>(false);
  const [volume] = useState<number>(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthOscRef = useRef<OscillatorNode | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);

  // Format time MM:SS
  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Cleanup synth sound
  const stopSynth = useCallback(() => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (synthGainRef.current && audioContextRef.current) {
      try {
        synthGainRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.05);
      } catch {
        // Safe ignore
      }
    }
    if (synthOscRef.current) {
      try {
        synthOscRef.current.stop();
        synthOscRef.current.disconnect();
      } catch {
        // Safe ignore
      }
      synthOscRef.current = null;
    }
  }, []);

  // Web Audio API ambient chime synth fallback
  const startSynthFallback = useCallback(
    (startSec: number = 0) => {
      setIsSynthFallback(true);
      stopSynth();

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        if (!audioContextRef.current || audioContextRef.current.state === "closed") {
          audioContextRef.current = new AudioCtx();
        } else if (audioContextRef.current.state === "suspended") {
          void audioContextRef.current.resume();
        }

        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Pleasant pentatonic frequencies: F3, A3, C4, E4, G4
        const frequencies = [174.61, 220.0, 261.63, 329.63, 392.0];
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequencies[Math.floor(startSec / 3) % frequencies.length], ctx.currentTime);

        gain.gain.setValueAtTime(0.08 * volume, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        synthOscRef.current = osc;
        synthGainRef.current = gain;

        let cur = startSec;
        synthTimerRef.current = setInterval(() => {
          cur += 0.25;
          setCurrentTime(Math.min(cur, duration));

          // Switch note every 3 seconds for soothing ambiance
          if (synthOscRef.current && ctx.state === "running") {
            const noteIdx = Math.floor(cur / 3) % frequencies.length;
            synthOscRef.current.frequency.setTargetAtTime(frequencies[noteIdx], ctx.currentTime, 0.1);
          }

          if (cur >= duration) {
            stopSynth();
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }, 250);
      } catch {
        // If web audio is blocked, keep progress bar running silently
        let cur = startSec;
        synthTimerRef.current = setInterval(() => {
          cur += 0.25;
          setCurrentTime(Math.min(cur, duration));
          if (cur >= duration) {
            stopSynth();
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }, 250);
      }
    },
    [duration, stopSynth, volume]
  );

  // Reset when audioPath changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsSynthFallback(false);
    stopSynth();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioPath, stopSynth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopSynth]);

  const togglePlay = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (isSynthFallback) {
        stopSynth();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      // Play
      setIsPlaying(true);
      if (isSynthFallback) {
        startSynthFallback(currentTime);
      } else if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // If HTML5 audio playback fails (e.g. 404 or codec error), switch to Web Audio API synth
          startSynthFallback(currentTime);
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    if (isSynthFallback) {
      if (isPlaying) {
        startSynthFallback(newTime);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleRestart = () => {
    setCurrentTime(0);
    if (isSynthFallback) {
      if (isPlaying) startSynthFallback(0);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().catch(() => startSynthFallback(0));
      }
    }
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  return (
    <div className="rounded-2xl bg-unsil-slate-900/90 border border-emerald-500/20 p-4 shadow-glass backdrop-blur-md">
      {/* Hidden real audio element with error fallback handler */}
      <audio
        ref={audioRef}
        src={audioPath}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => {
          // Smart fallback: activate Web Audio API synth
          setIsSynthFallback(true);
        }}
      />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-100 truncate">{title}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-emerald-400 font-medium">Narasi Suara Interaktif</span>
              {isSynthFallback && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  Synth Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Minimalist Audio Waveform Animation */}
        <div className="flex items-center gap-0.5 h-5 px-2 bg-slate-950/40 rounded-lg border border-white/5">
          {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((heightScale, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isPlaying ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, heightScale * 16)}px` : "4px",
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar & Slider */}
      <div className="space-y-1.5">
        <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden group cursor-pointer">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-100 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Audio progress seek bar"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title="Putar Ulang"
              aria-label="Putar ulang narasi audio"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Play/Pause CTA Controls */}
      <div className="mt-3 flex items-center justify-center">
        <button
          onClick={togglePlay}
          className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full font-medium text-xs transition-all duration-300 shadow-md ${
            isPlaying
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-amber-500/20"
              : "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-emerald-600/30 ring-1 ring-white/20"
          }`}
          aria-label={isPlaying ? "Jeda Narasi Audio" : "Dengarkan Narasi Audio"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Jeda Narasi</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Dengarkan Narasi Gedung</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

