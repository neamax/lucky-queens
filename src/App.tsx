import { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import { Settings, HelpCircle, Sun, Moon, Lightbulb, RotateCcw, Crown, Play, Mail, GitBranch, Send, MessageCircle } from 'lucide-react';
import { useGameLogic } from './hooks/useGameLogic';
import { BOARD_SIZES, DIFFICULTIES } from './levels';
import type { BoardSize, Difficulty } from './types';
import { Board } from './components/Board';
import { formatTime } from '@/lib/utils';
import { strings } from './locales';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// MARK: App
export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [boardSize, setBoardSize] = useState<BoardSize>(8);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [configOpen, setConfigOpen] = useState<boolean>(false);
  const [pendingChange, setPendingChange] = useState<
    { type: 'size'; value: BoardSize } | { type: 'difficulty'; value: Difficulty } | null
  >(null);

  const requestChange = (change: NonNullable<typeof pendingChange>) => {
    if (gameState === 'playing' && moveCount > 1) {
      setPendingChange(change);
    } else {
      applyChange(change);
    }
  };

  const applyChange = (change: NonNullable<typeof pendingChange>) => {
    if (change.type === 'size') setBoardSize(change.value);
    else setDifficulty(change.value);
    setPendingChange(null);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  }, [isDark]);

  const {
    gameState,
    board,
    toggleCell,
    conflicts,
    isAutoCrossEnabled,
    setIsAutoCrossEnabled,
    moveCount,
    secondsElapsed,
    start,
    resetGame,
    hintsRemaining,
    hintCell,
    requestHint,
    dragCross,
  } = useGameLogic(boardSize, difficulty);

  return (
    <div className={`h-[100dvh] w-full overflow-hidden flex flex-col font-sans transition-colors duration-200 select-none bg-secondary`}>
      {/* MARK: Header */}
      <header className="h-14 sm:h-16 shrink-0 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-foreground dark:bg-background z-10">
        <div className="flex items-center gap-3 h-full">
          <img src={logo} alt="Lucky Queens" className="h-full w-auto py-2" />
          <h1 className="text-sm font-medium tracking-tight bg-gradient-to-r from-emerald-300 to-teal-500 bg-clip-text text-transparent">
            {strings.title}
          </h1>
          <span className="hidden capitalize sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-slate-700 dark:text-slate-300">
            {boardSize}×{boardSize} · {difficulty}
          </span>
        </div>

        {/* right-side navigation drawer triggers */}
        <div className="flex items-center gap-2">
          {/* MARK: Help Drawer */}
          <Drawer swipeDirection="right">
            <DrawerTrigger render={<Button variant="outline" size="sm" className="gap-1.5 rounded-xl cursor-pointer" />}>
              <HelpCircle className="h-4 w-4" />
              <span className="hidden md:inline">{strings.helpTitle}</span>
            </DrawerTrigger>
            <DrawerContent className="inset-y-0 right-[2.5vw] md:right-[2vw] text-primary left-auto top-[5vh] md:top-[5dvh] bottom-auto mt-0 w-[95vw] md:w-[50vw] rounded-2xl border bg-background p-6 shadow-2xl flex flex-col">
              <DrawerHeader className="px-0 pt-0 pb-4 border-b text-left shrink-0 flex items-center justify-between">
                <DrawerTitle className="text-xl font-bold flex justify-between w-full">
                  {strings.helpTitle}
                  <DrawerClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" />}>✕</DrawerClose>
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-6 text-sm">
                <p className="pb-6 text-slate-500 dark:text-slate-400 leading-relaxed">
                  {strings.helpIntro}
                </p>

                {/* rules */}
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3">
                    {strings.rulesHeading}
                  </h3>
                  <ul className="space-y-2.5">
                    {strings.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 bg-secondary p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <span className="font-bold text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">{idx + 1}.</span>
                        <div>
                          <span className="font-semibold text-primary block mb-0.5">{rule.title}</span>
                          <span className="text-slate-500 dark:text-slate-400">{rule.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* controls */}
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3">
                    {strings.controlsHeading}
                  </h3>
                  <ul className="space-y-2">
                    {strings.controlsGuide.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-secondary">
                        <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                          {item.icon}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* strategies */}
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3">
                    {strings.strategiesHeading}
                  </h3>
                  <ul className="space-y-2.5">
                    {strings.strategies.map((s, idx) => (
                      <li key={idx} className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-secondary">
                        <span className="font-semibold text-primary block mb-0.5">{s.title}</span>
                        <span className="text-slate-500 dark:text-slate-400">{s.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* difficulty guide */}
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3">
                    {strings.difficultyGuideHeading}
                  </h3>
                  <ul className="space-y-2">
                    {strings.difficultyGuide.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-secondary">
                        <span className="shrink-0 px-2 py-0.5 rounded-md text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 mt-0.5">
                          {d.level}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 leading-relaxed">{d.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* MARK: Configurations */}
          <Drawer swipeDirection="right" open={configOpen} onOpenChange={setConfigOpen}>
            <DrawerTrigger render={<Button variant="outline" size="sm" className="gap-1.5 rounded-xl cursor-pointer" />}>
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">{strings.configTitle}</span>
            </DrawerTrigger>
            <DrawerContent className="inset-y-0 right-[2.5vw] md:right-[2vw] text-primary left-auto top-[5vh] md:top-[5dvh] bottom-auto mt-0 w-[95vw] md:w-[30vw] rounded-2xl border bg-background p-6 shadow-2xl flex flex-col">
              <DrawerHeader className="px-0 pt-0 pb-4 border-b text-left shrink-0 flex items-center justify-between">
                <DrawerTitle className="text-xl font-bold flex justify-between w-full">
                  {strings.configTitle}
                  <DrawerClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" />}>
                    ✕
                  </DrawerClose>
                </DrawerTitle>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {/* theme toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-secondary">
                  <span className="text-sm font-semibold">{strings.themeLabel}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDark(!isDark)}
                    className="gap-2 font-medium cursor-pointer"
                  >
                    {isDark ? (
                      <>
                        <Sun className="h-4 w-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* difficulty selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-primary">
                    {strings.difficultyLabel}
                  </label>
                  <Select
                    value={difficulty}
                    onValueChange={(val) => requestChange({ type: 'difficulty', value: val as Difficulty })}
                  >
                    <SelectTrigger className="w-full rounded-xl py-5 font-medium capitalize cursor-pointer bg-secondary border border-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d} className="cursor-pointer font-medium capitalize">
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* board size selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-primary">
                    {strings.boardSizeLabel}
                  </label>
                  <Select
                    value={boardSize.toString()}
                    onValueChange={(val) => requestChange({ type: 'size', value: Number(val) as BoardSize })}
                  >
                    <SelectTrigger className="w-full rounded-xl py-5 font-medium cursor-pointer bg-secondary border border-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BOARD_SIZES.map((s) => (
                        <SelectItem key={s} value={s.toString()} className="cursor-pointer font-medium">
                          {s}×{s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* auto-cross toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-secondary">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{strings.autoCrossLabel}</span>
                    <span className="text-xs">Automatically mark invalid cells</span>
                  </div>
                  <Switch
                    checked={isAutoCrossEnabled}
                    onCheckedChange={setIsAutoCrossEnabled}
                    className="cursor-pointer"
                  />
                </div>
              </div>
              {/* MARK: About Section */}
              <div className="pt-2 pb-3 rounded-xl bg-secondary border border-secondary shrink-0 space-y-2">
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                  <p>
                    Developed by{' '}
                    <a href="https://www.luckygene.net/neama" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">Neama Kazemi</a>
                  </p>
                  <p>
                    at{' '}
                    <a href="https://www.luckygene.net" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">LuckyGene Indie Studio</a>
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <a href="mailto:neama@luckygene.net" aria-label="Email">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg cursor-pointer"><Mail className="h-4 w-4" /></Button>
                  </a>
                  <a href="https://github.com/neamax" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg cursor-pointer"><GitBranch className="h-4 w-4" /></Button>
                  </a>
                  <a href="https://t.me/neamax" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg cursor-pointer"><Send className="h-4 w-4" /></Button>
                  </a>
                  <a href="https://wa.me/17866271131" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg cursor-pointer"><MessageCircle className="h-4 w-4" /></Button>
                  </a>
                </div>
              </div>
              <div className="pt-2 shrink-0">
                <Button
                  onClick={() => setConfigOpen(false)}
                  className="w-full font-bold rounded-xl cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Apply Settings
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      {/* MARK: Board */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative">
        <Board
          board={board}
          conflicts={conflicts}
          hintCell={hintCell}
          boardSize={boardSize}
          onCellClick={toggleCell}
          onCellDrag={dragCross}
        />

        {/* MARK: Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 p-4 animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <img src={logo} alt="Lucky Queens" className="h-16 w-16" />
                <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-300 to-teal-500 bg-clip-text text-transparent tracking-tight">Lucky Queens</h2>
                <p className="text-slate-300 text-sm font-medium">
                  {boardSize}×{boardSize} &middot; <span className="capitalize">{difficulty}</span> &middot; Auto-fill {isAutoCrossEnabled ? 'on' : 'off'}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button
                  onClick={start}
                  className="gap-2 px-8 py-5 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl cursor-pointer shadow-lg transition-all"
                >
                  <Play className="h-5 w-5 fill-white" />
                  Start Game
                </Button>
                <Button
                  variant="link"
                  onClick={() => setConfigOpen(true)}
                  className="gap-1.5 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Open Configurations
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MARK: Victory Overlay */}
        {gameState === 'won' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 p-4 animate-in fade-in duration-300">
            <div className="p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl text-center border border-slate-200 dark:border-slate-800 max-w-sm w-full flex flex-col items-center gap-4">
              <Crown className="h-12 w-12 text-emerald-500" />
              <div>
                <h2 className="text-2xl font-medium mb-1">{strings.victoryTitle}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium capitalize">
                  {boardSize}×{boardSize} &middot; {difficulty}
                </p>
              </div>
              <div className="flex gap-6 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-mono font-bold text-emerald-500">{formatTime(secondsElapsed)}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{strings.timeLabel}</span>
                </div>
                <div className="w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-mono font-bold text-emerald-500">{moveCount}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{strings.movesLabel}</span>
                </div>
              </div>
              <Button
                onClick={start}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer py-5 text-base"
              >
                {strings.nextLevelButton}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* MARK: Footer */}
      <footer className="shrink-0 h-14 sm:h-16 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800/80 bg-foreground dark:bg-background flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{strings.timeLabel}</span>
            <span className="text-base sm:text-lg font-mono font-bold text-slate-800 dark:text-slate-200">{formatTime(secondsElapsed)}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{strings.movesLabel}</span>
            <span className="text-base sm:text-lg font-mono font-bold text-slate-800 dark:text-slate-200">{moveCount}</span>
          </div>
        </div>

        {/* Hint Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={requestHint}
            disabled={hintsRemaining === 0 || gameState !== 'playing'}
            className={`font-bold rounded-xl transition-all cursor-pointer gap-1.5 shadow-2xs ${hintsRemaining > 0 && gameState === 'playing'
              ? 'bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/80 border-green-300 dark:border-green-700/50'
              : 'opacity-50 cursor-not-allowed'
              }`}
          >
            <Lightbulb className="h-4 w-4 text-green-800 dark:text-green-300 shrink-0" />
            <span>{strings.hintButton} ({hintsRemaining})</span>
          </Button>

        {/* Reset Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={resetGame}
            disabled={gameState !== 'playing'}
            className="font-bold rounded-xl transition-colors cursor-pointer gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{strings.resetButton}</span>
          </Button>
        </div>
      </footer>
      
      {/* MARK: Discard Dialog */}
      <AlertDialog open={pendingChange !== null} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{strings.discardTitle}</AlertDialogTitle>
            <AlertDialogDescription>{strings.discardDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{strings.discardCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => applyChange(pendingChange!)}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {strings.discardConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
