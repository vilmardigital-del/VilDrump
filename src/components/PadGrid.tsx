import React from 'react';
import { Translations } from '../data/i18n';

export type ActivePadType =
  | { kind: 'ritmo'; index: 0 | 1 | 2 }
  | { kind: 'virada'; index: 0 | 1 | 2 }
  | { kind: 'final' };

interface PadGridProps {
  selectedRitmo: 0 | 1 | 2;
  activePad: ActivePadType;
  isPlaying: boolean;
  isPaused: boolean;
  currentBeat: number; // 0..3
  pratoFlash: boolean;
  onTriggerRitmo: (index: 0 | 1 | 2) => void;
  onTriggerVirada: (index: 0 | 1 | 2) => void;
  onTogglePause: () => void;
  onTriggerFinal: () => void;
  onTriggerPrato: () => void;
  t: Translations;
}

export const PadGrid: React.FC<PadGridProps> = ({
  selectedRitmo,
  activePad,
  isPlaying,
  isPaused,
  currentBeat,
  pratoFlash,
  onTriggerRitmo,
  onTriggerVirada,
  onTogglePause,
  onTriggerFinal,
  onTriggerPrato,
  t,
}) => {
  const ritmoNumbers: Array<0 | 1 | 2> = [0, 1, 2];

  return (
    <div className="w-full">
      {/* 4-Beat Progress Bar */}
      <div className="grid grid-cols-4 gap-2 mb-3.5" aria-label="Indicador de compasso">
        {[0, 1, 2, 3].map((beat) => {
          const isActive = currentBeat === beat;
          const isIdleFourth = !isPlaying && beat === 3;
          return (
            <div
              key={beat}
              className={`h-[7px] rounded-[2px] transition-colors duration-75 ${
                isActive
                  ? 'bg-[#f5a623]'
                  : isIdleFourth
                    ? 'bg-[#666666]'
                    : 'bg-[#1c1c1c] border border-[#4a4a4a]'
              }`}
            />
          );
        })}
      </div>

      {/* 3x3 Tactile Pad Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* ROW 1: 1 RITMO, 2 RITMO, 3 RITMO */}
        {ritmoNumbers.map((idx) => {
          const activeCream = activePad.kind === 'ritmo' && activePad.index === idx;
          const isQueuedRitmo = activePad.kind !== 'ritmo' && selectedRitmo === idx;

          return (
            <button
              key={`ritmo-${idx}`}
              type="button"
              onClick={() => onTriggerRitmo(idx)}
              aria-pressed={activeCream}
              className={`aspect-[1/0.96] sm:aspect-[1/0.86] rounded-[8px] flex flex-col items-center justify-center transition-all duration-100 active:scale-[0.97] cursor-pointer select-none border-[1.5px] ${
                activeCream
                  ? 'bg-[#f5f2ed] border-[#f5f2ed] text-[#111111]'
                  : 'bg-[#181818] hover:bg-[#202020] border-[#d4d4d4] text-white'
              }`}
            >
              <span
                className={`text-[30px] sm:text-[34px] font-extrabold leading-none ${
                  activeCream ? 'text-[#111111]' : 'text-[#7b7b7b]'
                }`}
              >
                {idx + 1}
              </span>
              <span
                className={`text-[13px] font-extrabold tracking-[0.06em] uppercase mt-1.5 ${
                  activeCream ? 'text-[#111111]' : 'text-[#c9c9c9]'
                }`}
              >
                {t.ritmo}
              </span>
              <span
                className={`w-[9px] h-[9px] rounded-full mt-2.5 transition-colors ${
                  activeCream
                    ? isPlaying
                      ? 'bg-[#f5a623]'
                      : 'bg-[#737373]'
                    : isQueuedRitmo
                      ? 'bg-[#737373]'
                      : 'bg-[#282828]'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}

        {/* ROW 2: 1 VIRADA, 2 VIRADA, 3 VIRADA */}
        {ritmoNumbers.map((idx) => {
          const isViradaActive = activePad.kind === 'virada' && activePad.index === idx;
          return (
            <button
              key={`virada-${idx}`}
              type="button"
              onClick={() => onTriggerVirada(idx)}
              aria-pressed={isViradaActive}
              className={`aspect-[1/0.96] sm:aspect-[1/0.86] rounded-[8px] flex flex-col items-center justify-center transition-all duration-100 active:scale-[0.97] cursor-pointer select-none border-[1.5px] ${
                isViradaActive
                  ? 'bg-[#f5f2ed] border-[#f5a623] text-[#111111]'
                  : 'bg-[#181818] hover:bg-[#202020] border-[#d4d4d4] text-white'
              }`}
            >
              <span
                className={`text-[30px] sm:text-[34px] font-extrabold leading-none ${
                  isViradaActive ? 'text-[#111111]' : 'text-[#7b7b7b]'
                }`}
              >
                {idx + 1}
              </span>
              <span
                className={`text-[13px] font-extrabold tracking-[0.06em] uppercase mt-1.5 ${
                  isViradaActive ? 'text-[#111111]' : 'text-[#c9c9c9]'
                }`}
              >
                {t.virada}
              </span>
              <span
                className={`w-[9px] h-[9px] rounded-full mt-2.5 transition-colors ${
                  isViradaActive ? 'bg-[#f5a623]' : 'bg-[#282828]'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}

        {/* ROW 3: PAUSAR, FINAL, PRATO */}
        <button
          type="button"
          onClick={onTogglePause}
          aria-pressed={isPaused}
          className={`min-h-[82px] sm:min-h-[88px] rounded-[8px] flex flex-col items-center justify-center transition-all duration-100 active:scale-[0.97] cursor-pointer select-none border ${
            isPaused
              ? 'bg-[#23201b] border-[#f5a623]'
              : 'bg-[#151515] hover:bg-[#1d1d1d] border-[#262626]'
          }`}
        >
          <span
            className={`text-[13px] font-extrabold tracking-[0.06em] uppercase ${
              isPaused ? 'text-[#f5a623]' : 'text-[#d4d4d4]'
            }`}
          >
            {t.pausar}
          </span>
          <span
            className={`w-[9px] h-[9px] rounded-full mt-2.5 transition-colors ${
              isPaused ? 'bg-[#f5a623]' : 'bg-[#2a2a2a]'
            }`}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={onTriggerFinal}
          aria-pressed={activePad.kind === 'final'}
          className={`min-h-[82px] sm:min-h-[88px] rounded-[8px] flex flex-col items-center justify-center transition-all duration-100 active:scale-[0.97] cursor-pointer select-none border ${
            activePad.kind === 'final'
              ? 'bg-[#f5f2ed] border-[#f5a623]'
              : 'bg-[#151515] hover:bg-[#1d1d1d] border-[#262626]'
          }`}
        >
          <span
            className={`text-[13px] font-extrabold tracking-[0.06em] uppercase ${
              activePad.kind === 'final' ? 'text-[#111111]' : 'text-[#d4d4d4]'
            }`}
          >
            {t.final}
          </span>
          <span
            className={`w-[9px] h-[9px] rounded-full mt-2.5 transition-colors ${
              activePad.kind === 'final' ? 'bg-[#f5a623]' : 'bg-[#2a2a2a]'
            }`}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={onTriggerPrato}
          className={`min-h-[82px] sm:min-h-[88px] rounded-[8px] flex flex-col items-center justify-center transition-all duration-75 active:scale-[0.97] cursor-pointer select-none border ${
            pratoFlash
              ? 'bg-[#f5f2ed] border-[#f5a623]'
              : 'bg-[#151515] hover:bg-[#1d1d1d] border-[#262626]'
          }`}
        >
          <span
            className={`text-[13px] font-extrabold tracking-[0.06em] uppercase ${
              pratoFlash ? 'text-[#111111]' : 'text-[#d4d4d4]'
            }`}
          >
            {t.prato}
          </span>
          <span
            className={`w-[9px] h-[9px] rounded-full mt-2.5 transition-colors ${
              pratoFlash ? 'bg-[#f5a623]' : 'bg-[#2a2a2a]'
            }`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
};
