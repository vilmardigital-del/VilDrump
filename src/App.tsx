import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { drumEngine } from './audio/drumEngine';
import { AuthModal } from './components/AuthModal';
import { Header, UserProfile } from './components/Header';
import { ActivePadType, PadGrid } from './components/PadGrid';
import { RhythmCatalogModal } from './components/RhythmCatalogModal';
import { TransportControls } from './components/TransportControls';
import { LanguageCode, TRANSLATIONS } from './data/i18n';
import { FEATURED_RHYTHMS, RHYTHMS, RhythmDefinition } from './data/rhythms';

const USER_STORAGE_KEY = 'gdrums_user_v1';

export default function App() {
  const [lang, setLang] = useState<LanguageCode>('PT');
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  const [activeRhythm, setActiveRhythm] = useState<RhythmDefinition>(RHYTHMS[0]); // Arrocha
  const [bpm, setBpm] = useState<number>(RHYTHMS[0].defaultBpm); // 130
  const [volume, setVolume] = useState<number>(100);

  const [selectedRitmo, setSelectedRitmo] = useState<0 | 1 | 2>(1); // 2 RITMO active by default
  const [activePad, setActivePad] = useState<ActivePadType>({ kind: 'ritmo', index: 1 });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0); // 0..3
  const [pratoFlash, setPratoFlash] = useState<boolean>(false);

  const [catalogOpen, setCatalogOpen] = useState<boolean>(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login',
  });

  const t = TRANSLATIONS[lang];

  // Mutable refs for glitch-free Web Audio lookahead scheduling
  const isPlayingRef = useRef<boolean>(false);
  const rhythmRef = useRef<RhythmDefinition>(activeRhythm);
  const selectedRitmoRef = useRef<0 | 1 | 2>(selectedRitmo);
  const activeModeRef = useRef<ActivePadType>(activePad);
  const bpmRef = useRef<number>(bpm);
  const currentStepRef = useRef<number>(0);
  const nextNoteTimeRef = useRef<number>(0);
  const pendingCrashRef = useRef<boolean>(false);
  const schedulerIdRef = useRef<number | null>(null);
  const uiTimersRef = useRef<number[]>([]);
  const pratoTimerRef = useRef<number | null>(null);

  rhythmRef.current = activeRhythm;
  bpmRef.current = bpm;

  useEffect(() => {
    drumEngine.setVolume(volume / 100);
  }, [volume]);

  const clearUiTimers = useCallback(() => {
    for (const id of uiTimersRef.current) {
      clearTimeout(id);
    }
    uiTimersRef.current = [];
  }, []);

  const stopScheduler = useCallback(() => {
    isPlayingRef.current = false;
    if (schedulerIdRef.current !== null) {
      clearInterval(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }
    clearUiTimers();
    setIsPlaying(false);
  }, [clearUiTimers]);

  const scheduleStep = useCallback(
    (stepIdx: number, time: number) => {
      const rhythm = rhythmRef.current;
      const mode = activeModeRef.current;

      let hits;
      if (mode.kind === 'ritmo') {
        hits = rhythm.ritmos[mode.index][stepIdx];
      } else if (mode.kind === 'virada') {
        hits = rhythm.viradas[mode.index][stepIdx];
      } else {
        hits = rhythm.finalPattern[stepIdx];
      }

      if (pendingCrashRef.current && stepIdx === 0) {
        drumEngine.trigger('crash', time, 0.92);
        pendingCrashRef.current = false;
      }

      for (const h of hits) {
        drumEngine.trigger(h.instrument, time, h.velocity ?? 1);
      }

      const now = drumEngine.getCurrentTime();
      const delayMs = Math.max(0, (time - now) * 1000);
      const beat = Math.floor(stepIdx / 4);

      const timerId = window.setTimeout(() => {
        if (!isPlayingRef.current) return;
        setCurrentBeat(beat);
      }, delayMs);
      uiTimersRef.current.push(timerId);

      // End-of-bar state transitions
      if (stepIdx === 15) {
        if (mode.kind === 'virada') {
          const nextMode: ActivePadType = { kind: 'ritmo', index: selectedRitmoRef.current };
          activeModeRef.current = nextMode;
          pendingCrashRef.current = true;
          const endTimer = window.setTimeout(() => {
            if (!isPlayingRef.current) return;
            setActivePad(nextMode);
          }, delayMs);
          uiTimersRef.current.push(endTimer);
        } else if (mode.kind === 'final') {
          // Stop cleanly right after the ending bar completes
          const finalStopMs = delayMs + (60 / bpmRef.current / 4) * 1000 * 1.1;
          const stopTimer = window.setTimeout(() => {
            stopScheduler();
            const resetMode: ActivePadType = { kind: 'ritmo', index: selectedRitmoRef.current };
            activeModeRef.current = resetMode;
            setActivePad(resetMode);
            setIsPaused(false);
            setCurrentBeat(0);
            currentStepRef.current = 0;
          }, finalStopMs);
          uiTimersRef.current.push(stopTimer);
        }
      }
    },
    [stopScheduler]
  );

  const runScheduler = useCallback(() => {
    const scheduleAheadTime = 0.11;
    const ctxTime = drumEngine.getCurrentTime();

    while (nextNoteTimeRef.current < ctxTime + scheduleAheadTime && isPlayingRef.current) {
      const step = currentStepRef.current;
      const baseStepDuration = 60 / bpmRef.current / 4;
      const swing = rhythmRef.current.swing ?? 0;

      // Apply subtle swing timing to off-16ths
      let stepDuration = baseStepDuration;
      if (swing > 0) {
        stepDuration =
          step % 2 === 0
            ? baseStepDuration * (1 + swing)
            : baseStepDuration * (1 - swing);
      }

      scheduleStep(step, nextNoteTimeRef.current);

      if (step === 15 && activeModeRef.current.kind === 'final') {
        isPlayingRef.current = false;
        if (schedulerIdRef.current !== null) {
          clearInterval(schedulerIdRef.current);
          schedulerIdRef.current = null;
        }
        break;
      }

      nextNoteTimeRef.current += stepDuration;
      currentStepRef.current = (step + 1) % 16;
    }
  }, [scheduleStep]);

  const startPlayback = useCallback(
    (fromBeginning = false) => {
      drumEngine.unlock();
      if (fromBeginning) {
        currentStepRef.current = 0;
        setCurrentBeat(0);
      }
      if (isPlayingRef.current) return;

      isPlayingRef.current = true;
      setIsPlaying(true);
      setIsPaused(false);
      nextNoteTimeRef.current = drumEngine.getCurrentTime() + 0.025;
      runScheduler();
      schedulerIdRef.current = window.setInterval(runScheduler, 25);
    },
    [runScheduler]
  );

  useEffect(() => {
    return () => {
      stopScheduler();
    };
  }, [stopScheduler]);

  const handleTriggerRitmo = useCallback(
    (index: 0 | 1 | 2) => {
      selectedRitmoRef.current = index;
      setSelectedRitmo(index);
      const mode: ActivePadType = { kind: 'ritmo', index };
      activeModeRef.current = mode;
      setActivePad(mode);
      setIsPaused(false);

      if (!isPlayingRef.current) {
        startPlayback(true);
      }
    },
    [startPlayback]
  );

  const handleTriggerVirada = useCallback(
    (index: 0 | 1 | 2) => {
      const mode: ActivePadType = { kind: 'virada', index };
      activeModeRef.current = mode;
      setActivePad(mode);
      setIsPaused(false);

      if (!isPlayingRef.current) {
        startPlayback(true);
      }
    },
    [startPlayback]
  );

  const handleTogglePause = useCallback(() => {
    if (isPlayingRef.current) {
      stopScheduler();
      setIsPaused(true);
    } else {
      const mode: ActivePadType = { kind: 'ritmo', index: selectedRitmoRef.current };
      activeModeRef.current = mode;
      setActivePad(mode);
      startPlayback(false);
    }
  }, [startPlayback, stopScheduler]);

  const handleTriggerFinal = useCallback(() => {
    const mode: ActivePadType = { kind: 'final' };
    activeModeRef.current = mode;
    setActivePad(mode);
    setIsPaused(false);

    if (!isPlayingRef.current) {
      startPlayback(true);
    }
  }, [startPlayback]);

  const handleTriggerPrato = useCallback(() => {
    drumEngine.unlock();
    drumEngine.trigger('crash', undefined, 1.0);
    drumEngine.trigger('kick', undefined, 0.72);
    setPratoFlash(true);
    if (pratoTimerRef.current !== null) {
      clearTimeout(pratoTimerRef.current);
    }
    pratoTimerRef.current = window.setTimeout(() => {
      setPratoFlash(false);
    }, 200);
  }, []);

  const handleSelectRhythm = useCallback(
    (rhythm: RhythmDefinition) => {
      rhythmRef.current = rhythm;
      setActiveRhythm(rhythm);
      setBpm(rhythm.defaultBpm);
      bpmRef.current = rhythm.defaultBpm;

      // Ensure active mode stays cleanly on selected groove
      const mode: ActivePadType = { kind: 'ritmo', index: selectedRitmoRef.current };
      activeModeRef.current = mode;
      setActivePad(mode);
      pendingCrashRef.current = false;
    },
    []
  );

  const handleToggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'PT' ? 'EN' : prev === 'EN' ? 'ES' : 'PT'));
  }, []);

  const handleAuthSuccess = useCallback((profile: UserProfile) => {
    setUser(profile);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  // Keyboard shortcuts for desktop studio usability
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (catalogOpen || authModal.open) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === '1') handleTriggerRitmo(0);
      else if (e.key === '2') handleTriggerRitmo(1);
      else if (e.key === '3') handleTriggerRitmo(2);
      else if (e.key === '4' || e.key.toLowerCase() === 'q') handleTriggerVirada(0);
      else if (e.key === '5' || e.key.toLowerCase() === 'w') handleTriggerVirada(1);
      else if (e.key === '6' || e.key.toLowerCase() === 'e') handleTriggerVirada(2);
      else if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePause();
      } else if (e.key.toLowerCase() === 'f') handleTriggerFinal();
      else if (e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'c') handleTriggerPrato();
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setBpm((prev) => Math.min(activeRhythm.maxBpm, prev + 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setBpm((prev) => Math.max(activeRhythm.minBpm, prev - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeRhythm.maxBpm,
    activeRhythm.minBpm,
    authModal.open,
    catalogOpen,
    handleTogglePause,
    handleTriggerFinal,
    handleTriggerPrato,
    handleTriggerRitmo,
    handleTriggerVirada,
  ]);

  // Split featured rhythms into exact 2 rows matching screenshot:
  // Row 1: Arrocha, Gospel, Xote Nordestino
  // Row 2: Vaneira, Samba (Pandeiro) (+ custom catalog rhythm if non-featured selected)
  const row1Rhythms = FEATURED_RHYTHMS.slice(0, 3);
  const row2Rhythms = FEATURED_RHYTHMS.slice(3, 5);
  const isCustomSelected = !FEATURED_RHYTHMS.some((r) => r.id === activeRhythm.id);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      <Header
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
        user={user}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onLogout={handleLogout}
        t={t}
      />

      <main className="flex-1 w-full max-w-[460px] sm:max-w-[520px] mx-auto px-4 pt-4 pb-8 flex flex-col items-center">
        {/* Ver todos os ritmos button */}
        <button
          type="button"
          onClick={() => setCatalogOpen(true)}
          className="min-h-[42px] bg-[#161616] hover:bg-[#1f1f1f] active:scale-[0.98] border-[1.5px] border-[#9c9c9c] rounded-[8px] px-5 py-2 flex items-center justify-center gap-2.5 text-white font-bold text-[14px] tracking-wide transition-all cursor-pointer"
        >
          <Menu className="w-[18px] h-[18px] text-[#e5e5e5]" strokeWidth={2.2} />
          <span className="whitespace-nowrap">{t.seeAllRhythms}</span>
        </button>

        {/* Quick Rhythm Selector Chips (2 centered rows matching screenshot) */}
        <div className="w-full mt-4 space-y-2.5">
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {row1Rhythms.map((rhythm) => {
              const isSelected = activeRhythm.id === rhythm.id;
              return (
                <button
                  key={rhythm.id}
                  type="button"
                  onClick={() => handleSelectRhythm(rhythm)}
                  aria-pressed={isSelected}
                  className={`min-h-[40px] px-4 py-2 rounded-[7px] text-[14px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1a1a1a] border-[1.5px] border-white text-white'
                      : 'bg-[#191919] hover:bg-[#222222] border border-[#2a2a2a] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {rhythm.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {row2Rhythms.map((rhythm) => {
              const isSelected = activeRhythm.id === rhythm.id;
              return (
                <button
                  key={rhythm.id}
                  type="button"
                  onClick={() => handleSelectRhythm(rhythm)}
                  aria-pressed={isSelected}
                  className={`min-h-[40px] px-4 py-2 rounded-[7px] text-[14px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1a1a1a] border-[1.5px] border-white text-white'
                      : 'bg-[#191919] hover:bg-[#222222] border border-[#2a2a2a] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {rhythm.name}
                </button>
              );
            })}

            {isCustomSelected && (
              <button
                type="button"
                onClick={() => setCatalogOpen(true)}
                aria-pressed={true}
                className="min-h-[40px] px-4 py-2 rounded-[7px] text-[14px] font-bold bg-[#1a1a1a] border-[1.5px] border-[#f5a623] text-white transition-all cursor-pointer whitespace-nowrap"
              >
                {activeRhythm.name}
              </button>
            )}
          </div>
        </div>

        {/* Beat Progress Bar + 3x3 Pad Matrix */}
        <div className="w-full mt-5">
          <PadGrid
            selectedRitmo={selectedRitmo}
            activePad={activePad}
            isPlaying={isPlaying}
            isPaused={isPaused}
            currentBeat={currentBeat}
            pratoFlash={pratoFlash}
            onTriggerRitmo={handleTriggerRitmo}
            onTriggerVirada={handleTriggerVirada}
            onTogglePause={handleTogglePause}
            onTriggerFinal={handleTriggerFinal}
            onTriggerPrato={handleTriggerPrato}
            t={t}
          />
        </div>

        {/* Bottom BPM & Volume Control Bar */}
        <div className="w-full mt-4">
          <TransportControls
            bpm={bpm}
            minBpm={activeRhythm.minBpm}
            maxBpm={activeRhythm.maxBpm}
            volume={volume}
            onChangeBpm={setBpm}
            onChangeVolume={setVolume}
            t={t}
          />
        </div>
      </main>

      {/* Modals */}
      <RhythmCatalogModal
        isOpen={catalogOpen}
        rhythms={RHYTHMS}
        activeRhythmId={activeRhythm.id}
        onSelectRhythm={handleSelectRhythm}
        onClose={() => setCatalogOpen(false)}
        t={t}
      />

      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        onSuccess={handleAuthSuccess}
        t={t}
      />
    </div>
  );
}
