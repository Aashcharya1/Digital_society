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
    
    const initialStrings = shuffleArray(STRINGS).map((s, i) => ({ ...s, slotIndex: i }));
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
    const higherPriorityBlockers = strings.filter(s => 
      s.priority > pulledString.priority && s.slotIndex > pulledString.slotIndex
    );

    if (higherPriorityBlockers.length > 0) {
      setGameStatus('lost-tangled');
      return;
    }

    if (pulledStringId !== actionStringId) {
      setGameStatus('lost-wrong');
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
        <CardContent ref={gameAreaRef} className="p-2 sm:p-4 relative aspect-[4/3] bg-card">
          <div className="absolute top-0 left-0 right-0 h-28 sm:h-32 p-2 flex justify-around items-start z-10">
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

          <div className="absolute inset-0 flex items-end justify-center">
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
          
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
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
