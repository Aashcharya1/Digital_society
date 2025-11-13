"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Hand, User, Footprints, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { StringState, GameStatus, LineCoordinate, PuppetPart, Show, Command } from '@/lib/definitions';
import { STRINGS, SHOW_SCRIPTS } from '@/lib/constants';

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const PuppetIcon = ({ part }: { part: PuppetPart }) => {
  const className = "size-5 text-primary-foreground";
  switch (part) {
    case 'Head': return <User className={className} />;
    case 'Left Hand':
    case 'Right Hand': return <Hand className={className} />;
    case 'Left Foot':
    case 'Right Foot': return <Footprints className={className} />;
    default: return null;
  }
};

const HaveliBackground = () => (
    <div className="absolute inset-0 overflow-hidden bg-[#D2B48C] z-0">
      {/* Main Wall Texture */}
      <div className="absolute inset-0 bg-repeat opacity-10" style={{backgroundImage: `url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%239C92AC" fill-opacity="0.1"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>')`}}></div>
  
      {/* Central Arch */}
      <div className="absolute inset-x-0 top-0 bottom-1/8 flex justify-center">
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <path
            d="M 50 300 L 50 150 C 50 50, 150 50, 200 100 C 250 50, 350 50, 350 150 L 350 300 Z"
            className="fill-amber-100/30"
          />
           <path
            d="M 60 300 L 60 150 C 60 60, 150 60, 200 110 C 250 60, 340 60, 340 150 L 340 300 Z"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>
      </div>
  
      {/* Stage Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-stone-300" style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'linear-gradient(to right, #BDBDBD 1px, transparent 1px), linear-gradient(to bottom, #BDBDBD 1px, transparent 1px)'
      }}></div>
  
       {/* Jharokha on left */}
      <div className="absolute top-1/4 left-4 h-24 w-12 bg-stone-700/50 rounded-t-lg border border-stone-800/50 p-1 hidden sm:block">
          <div className="w-full h-full border border-stone-600/50 rounded-t-md grid grid-cols-2 gap-1 p-1">
              <div className="bg-amber-100/10 rounded-sm"></div>
              <div className="bg-amber-100/10 rounded-sm"></div>
              <div className="bg-amber-100/10 rounded-sm col-span-2"></div>
              <div className="bg-amber-100/10 rounded-sm col-span-2"></div>
          </div>
      </div>

       {/* Curtain on right */}
       <div className="absolute top-0 right-0 h-full w-16 bg-red-800/70 hidden sm:block" style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)'}}>
           <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><path d="M40 40c11.046 0 20-8.954 20-20S51.046 0 40 0 20 8.954 20 20s8.954 20 20 20zm0 0c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20z" fill-opacity="0.2" fill="%23000000"/></svg>')`}}></div>
       </div>

      {/* Floor Cushions */}
      <div className="absolute bottom-1 left-2 w-20 h-10 bg-fuchsia-800 rounded-t-md opacity-80 hidden sm:block"></div>
      <div className="absolute bottom-1 right-2 w-24 h-12 bg-emerald-700 rounded-t-lg opacity-80 hidden sm:block"></div>

       {/* Diya Lamp */}
       <div className="absolute bottom-[calc(10%-4px)] right-28 w-6 h-4 bg-amber-600 rounded-full hidden sm:block">
         <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-3 bg-amber-400 rounded-full" style={{boxShadow: '0 0 5px 2px #fef08a'}}></div>
       </div>
    </div>
  );

export function SutradharGame() {
  const [strings, setStrings] = useState<StringState[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [activeAnimation, setActiveAnimation] = useState<Command | null>(null);
  const [lineCoords, setLineCoords] = useState<LineCoordinate[]>([]);
  const [draggedStringId, setDraggedStringId] = useState<PuppetPart | null>(null);
  
  const [show, setShow] = useState<Show>({ id: '', name: '', script: [] });
  const [currentMove, setCurrentMove] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Map<PuppetPart, HTMLDivElement | null>>(new Map());
  const anchorRefs = useRef<Map<PuppetPart, SVGElement | null>>(new Map());

  const resetGame = useCallback(() => {
    const randomShow = SHOW_SCRIPTS[Math.floor(Math.random() * SHOW_SCRIPTS.length)];
    setShow(randomShow);
    setCurrentMove(0);
    
    let initialStrings = shuffleArray(STRINGS).map((s, i) => ({ ...s, slotIndex: i }));

    // Ensure the game starts in a tangled state for the second move if possible
    if (randomShow.script.length > 1) {
      const firstAction = randomShow.script[0];
      const secondAction = randomShow.script[1];
      const secondActionString = initialStrings.find(s => s.id === secondAction.actionString)!;
      const higherPriorityStrings = initialStrings.filter(s => s.priority > secondActionString.priority);
      
      const isTangledForSecondMove = higherPriorityStrings.some(s => s.slotIndex > secondActionString.slotIndex);
      
      if (!isTangledForSecondMove && higherPriorityStrings.length > 0) {
          const stringToTangle = higherPriorityStrings[0];
          const tangleTargetSlotIndex = initialStrings.length - 1;

          if (secondActionString.slotIndex < tangleTargetSlotIndex) {
              const stringAtTarget = initialStrings.find(s => s.slotIndex === tangleTargetSlotIndex)!;
              
              const tangledStringOldIndex = stringToTangle.slotIndex;
              stringToTangle.slotIndex = tangleTargetSlotIndex;
              stringAtTarget.slotIndex = tangledStringOldIndex;
          }
      }
    }

    setStrings(initialStrings.sort((a, b) => a.slotIndex - b.slotIndex));
    setGameStatus('playing');
    setActiveAnimation(null);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const updateLineCoordinates = useCallback(() => {
    if (!gameAreaRef.current) return;
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const newCoords: LineCoordinate[] = [];
    
    const currentActionId = show.script[currentMove]?.actionString;

    for (const string of strings) {
      const slotEl = slotRefs.current.get(string.id);
      const anchorEl = anchorRefs.current.get(string.id);

      if (slotEl && anchorEl) {
        const slotRect = slotEl.getBoundingClientRect();
        const anchorRect = anchorEl.getBoundingClientRect();

        newCoords.push({
          id: string.id,
          x1: slotRect.left + slotRect.width / 2 - gameAreaRect.left,
          y1: slotRect.top + slotRect.height - gameAreaRect.top,
          x2: anchorRect.left + anchorRect.width / 2 - gameAreaRect.left,
          y2: anchorRect.top - gameAreaRect.top,
          color: string.color,
          isAction: string.id === currentActionId,
        });
      }
    }
    setLineCoords(newCoords);
  }, [strings, show.script, currentMove]);


  useLayoutEffect(() => {
    updateLineCoordinates();
    window.addEventListener('resize', updateLineCoordinates);
    return () => window.removeEventListener('resize', updateLineCoordinates);
  }, [updateLineCoordinates]);
  
  const handlePull = (pulledStringId: PuppetPart) => {
    if (gameStatus !== 'playing') return;

    const pulledString = strings.find(s => s.id === pulledStringId)!;
    const actionStringId = show.script[currentMove].actionString;
    
    // Check for tangles based on priority
    // To pull a string, no string with a higher priority can be to its right.
    const pulledStringSlotIndex = pulledString.slotIndex;
    const higherPriorityBlockers = strings.filter(s => 
        s.slotIndex > pulledStringSlotIndex && s.priority > pulledString.priority
    );

    if (pulledStringId !== actionStringId) {
      setGameStatus('lost-wrong');
      return;
    }

    if (higherPriorityBlockers.length > 0) {
      setGameStatus('lost-tangled');
      return;
    }

    // Success
    const command = show.script[currentMove];
    setActiveAnimation(command);
    setTimeout(() => setActiveAnimation(null), 700);

    if (currentMove < show.script.length - 1) {
      setCurrentMove(prev => prev + 1);
    } else {
      setGameStatus('won');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: PuppetPart) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedStringId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: PuppetPart) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') as PuppetPart;
    if (sourceId && sourceId !== targetId) {
      setStrings(prevStrings => {
        const sourceString = prevStrings.find(s => s.id === sourceId)!;
        const targetString = prevStrings.find(s => s.id === targetId)!;

        const sourceIndex = sourceString.slotIndex;
        const targetIndex = targetString.slotIndex;

        const newStrings = prevStrings.map(s => {
          if (s.id === sourceId) return { ...s, slotIndex: targetIndex };
          if (s.id === targetId) return { ...s, slotIndex: sourceIndex };
          return s;
        });

        return newStrings.sort((a, b) => a.slotIndex - b.slotIndex);
      });
    }
    setDraggedStringId(null);
  };
  
  const getDialogContent = () => {
    switch(gameStatus) {
      case 'won':
        return {
          title: "The Show is a Success!",
          description: "A flawless performance! The audience roars with applause, a testament to your skill as the Sutradhar."
        };
      case 'lost-tangled':
        return {
          title: "Tangled!",
          description: "The strings are crossed! A higher priority string is blocking the way. A true Sutradhar keeps their lines clear at all times."
        };
      case 'lost-wrong':
        return {
          title: "Wrong Move!",
          description: "You pulled the wrong string for this part of the show! Precision is key to a captivating performance."
        };
      default:
        return { title: "", description: "" };
    }
  };
  
  const getCommandDisplayName = (command: Command) => {
    if (command.name === 'Wave') {
      return command.actionString.includes('Left') ? 'Wave (Left)' : 'Wave (Right)';
    }
    if (command.name === 'Tap Foot') {
      return command.actionString.includes('Left') ? 'Tap Foot (Left)' : 'Tap Foot (Right)';
    }
    return command.name;
  };
  
  const currentCommand = show.script[currentMove];
  const dialogContent = getDialogContent();
  const isBowing = activeAnimation?.name === 'Bow';
  const isWaving = activeAnimation?.actionString === 'Right Hand' && activeAnimation.name === 'Wave';
  const isWavingLeft = activeAnimation?.actionString === 'Left Hand' && activeAnimation.name === 'Wave';
  const isTappingFoot = activeAnimation?.actionString === 'Right Foot' && activeAnimation.name === 'Tap Foot';
  const isTappingFootLeft = activeAnimation?.actionString === 'Left Foot' && activeAnimation.name === 'Tap Foot';

  return (
    <div className="w-full max-w-2xl mx-auto font-body">
      <header className="text-center mb-4">
        <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">The Sutradhar's Show</h1>
        <div className="text-muted-foreground mt-3 text-base sm:text-lg flex justify-center items-center gap-2 flex-wrap">
          {show.script.map((command, index) => (
             <React.Fragment key={command.id + index}>
              <span className={cn(
                "px-2 py-1 rounded",
                {'font-bold text-foreground bg-primary/20': index === currentMove},
                {'opacity-60': index < currentMove},
              )}>
                {getCommandDisplayName(command)}
              </span>
              {index < show.script.length - 1 && <ChevronsRight className="size-5 opacity-50 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </header>
      
      <Card className="shadow-lg overflow-hidden">
        <CardContent ref={gameAreaRef} className="p-2 sm:p-4 relative aspect-[4/3] bg-transparent">
          <HaveliBackground />
          <div className="absolute top-0 left-0 right-0 h-28 sm:h-32 p-2 flex justify-around items-start z-20">
            {strings.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-2"
                style={{
                  opacity: draggedStringId === s.id ? 0.5 : 1,
                  transition: 'opacity 0.2s ease-in-out',
                }}
              >
                <div
                  ref={el => slotRefs.current.set(s.id, el)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, s.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, s.id)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
                  style={{'--tw-shadow-color': s.color} as React.CSSProperties}
                  aria-label={`Draggable anchor for ${s.name}`}
                >
                  <PuppetIcon part={s.id} />
                </div>
                <Button
                  onClick={() => handlePull(s.id)}
                  variant="default"
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-4"
                  aria-label={`Pull ${s.name} string`}
                >
                  Pull
                </Button>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-end justify-center z-10">
            <svg width="200" height="250" viewBox="0 0 200 300" className="drop-shadow-lg">
              <defs>
                <filter id="puppet-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2"/>
                </filter>
              </defs>
              <g filter="url(#puppet-shadow)">
                {/* Body */}
                <path d="M 80 180 Q 100 200 120 180 L 120 100 Q 100 90 80 100 Z" fill="#D2B48C" stroke="#A0522D" strokeWidth="2" />
                
                {/* Head (for bowing) */}
                <g transform-origin="100 100" className={cn('transition-transform duration-500', {'rotate-[20deg]': isBowing})}>
                  <circle ref={el => anchorRefs.current.set('Head', el)} cx="100" cy="80" r="20" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>

                {/* Left Arm */}
                 <g transform-origin="80 110" className={cn('transition-transform duration-500', {'origin-top-right rotate-[45deg]': isWavingLeft})}>
                  <line x1="80" y1="110" x2="40" y2="130" stroke="#8B4513" strokeWidth="5" />
                  <circle ref={el => anchorRefs.current.set('Left Hand', el)} cx="40" cy="130" r="8" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>

                {/* Right Arm (for waving) */}
                <g transform-origin="120 110" className={cn('transition-transform duration-500', {'origin-top-left rotate-[-45deg]': isWaving})}>
                  <line x1="120" y1="110" x2="160" y2="130" stroke="#8B4513" strokeWidth="5" />
                  <circle ref={el => anchorRefs.current.set('Right Hand', el)} cx="160" cy="130" r="8" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>
                
                {/* Left Leg */}
                <g transform-origin="90 180" className={cn('transition-transform duration-300', {'translate-y-[-10px]': isTappingFootLeft})}>
                  <line x1="90" y1="180" x2="70" y2="220" stroke="#8B4513" strokeWidth="5" />
                  <circle ref={el => anchorRefs.current.set('Left Foot', el)} cx="70" cy="220" r="10" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>

                {/* Right Leg (for tapping) */}
                 <g transform-origin="110 180" className={cn('transition-transform duration-300', {'translate-y-[-10px]': isTappingFoot})}>
                  <line x1="110" y1="180" x2="130" y2="220" stroke="#8B4513" strokeWidth="5" />
                  <circle ref={el => anchorRefs.current.set('Right Foot', el)} cx="130" cy="220" r="10" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>
              </g>
            </svg>
          </div>
          
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20" aria-hidden="true">
            {lineCoords.sort((a,b) => a.isAction ? 1 : -1).map(lc => (
              <line
                key={lc.id}
                x1={lc.x1}
                y1={lc.y1}
                x2={lc.x2}
                y2={lc.y2}
                stroke={lc.color}
                strokeWidth={lc.isAction ? 3 : 2}
                strokeOpacity={lc.isAction ? 1 : 0.7}
                style={{transition: 'all 0.3s ease-in-out'}}
              />
            ))}
          </svg>
        </CardContent>
      </Card>
      
      <p className="text-center text-sm text-muted-foreground mt-4 px-4">
        Goal: Perform the show by pulling the correct strings. To pull a string, no string with a higher priority can be to its right. Drag anchors to untangle them.
      </p>

      <AlertDialog open={gameStatus !== 'playing'} onOpenChange={(open) => !open && resetGame()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline">{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetGame}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
