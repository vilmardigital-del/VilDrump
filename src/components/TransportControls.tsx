import React, { useRef, useState } from 'react';
import { Translations } from '../data/i18n';

interface TransportControlsProps {
  bpm: number;
  minBpm: number;
  maxBpm: number;
  volume: number; // 0..100
  onChangeBpm: (nextBpm: number) => void;
  onChangeVolume: (nextVol: number) => void;
  t: Translations;
}

export const TransportControls: React.FC<TransportControlsProps> = ({
  bpm,
  minBpm,
  maxBpm,
  volume,
  onChangeBpm,
  onChangeVolume,
  t,
}) => {
  const holdTimerRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  const [tapPulse, setTapPulse] = useState(false);

  const clampBpm = (val: number) => Math.max(minBpm, Math.min(maxBpm, val));

  const startHold = (delta: number) => {
    onChangeBpm(clampBpm(bpm + delta));
    stopHold();
    holdTimerRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        onChangeBpm(delta); // Note: handled via functional updater in parent if needed, let's adjust below
      }, 90);
    }, 350);
  };

  // Actually let's use a ref-tracked BPM for smooth press-and-hold increments
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const beginHold = (delta: number) => {
    onChangeBpm(clampBpm(bpmRef.current + delta));
    stopHold();
    holdTimerRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        const next = clampBpm(bpmRef.current + delta);
        bpmRef.current = next;
        onChangeBpm(next);
      }, 85);
    }, 320);
  };

  const stopHold = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  // Avoid unused warning on startHold
  void startHold;

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current.filter((ts) => now - ts < 2200);
    taps.push(now);
    tapTimesRef.current = taps;

    setTapPulse(true);
    window.setTimeout(() => setTapPulse(false), 120);

    if (taps.length >= 2) {
      let total = 0;
      for (let i = 1; i < taps.length; i++) {
        total += taps[i] - taps[i - 1];
      }
      const avgMs = total / (taps.length - 1);
      const calculatedBpm = Math.round(60000 / avgMs);
      onChangeBpm(clampBpm(calculatedBpm));
    }
  };

  return (
    <div className="w-full bg-[#151515] border border-[#262626] rounded-[10px] px-3.5 py-2.5 flex items-center justify-between gap-3">
      {/* BPM Section */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-bold tracking-wider text-[#737373] uppercase mr-0.5 select-none">
          {t.bpm}
        </span>

        <button
          type="button"
          onPointerDown={() => beginHold(-1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          aria-label="Diminuir BPM"
          className="w-10 h-10 bg-[#1c1c1c] hover:bg-[#252525] active:scale-95 border border-[#2e2e2e] rounded-[7px] flex items-center justify-center text-[#d4d4d4] text-[20px] font-medium leading-none cursor-pointer select-none transition-all"
        >
          −
        </button>

        <button
          type="button"
          onClick={handleTapTempo}
          title="Toque no ritmo (Tap Tempo)"
          className={`min-w-[56px] h-10 px-2.5 bg-[#1c1c1c] border rounded-[7px] flex items-center justify-center font-extrabold text-[15px] tabular-nums cursor-pointer select-none transition-colors ${
            tapPulse ? 'border-[#f5a623] text-[#f5a623]' : 'border-[#2e2e2e] text-white hover:border-[#444]'
          }`}
        >
          {bpm}
        </button>

        <button
          type="button"
          onPointerDown={() => beginHold(1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          aria-label="Aumentar BPM"
          className="w-10 h-10 bg-[#1c1c1c] hover:bg-[#252525] active:scale-95 border border-[#2e2e2e] rounded-[7px] flex items-center justify-center text-[#d4d4d4] text-[20px] font-medium leading-none cursor-pointer select-none transition-all"
        >
          +
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#2a2a2a] shrink-0" aria-hidden="true" />

      {/* Volume Section */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span className="text-[11px] font-bold tracking-wider text-[#737373] uppercase shrink-0 select-none">
          {t.vol}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onChangeVolume(Number(e.target.value))}
          aria-label={t.vol}
          style={{
            background: `linear-gradient(to right, #3a3a3a 0%, #3a3a3a ${volume}%, #232323 ${volume}%, #232323 100%)`,
          }}
          className="gdrums-slider w-full h-1.5 rounded-full min-w-[60px]"
        />

        <span className="text-[14px] font-bold text-[#a3a3a3] tabular-nums w-[44px] text-right shrink-0 select-none">
          {volume}%
        </span>
      </div>
    </div>
  );
};
