"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
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

const HaveliBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-background z-0">
            <div className="absolute inset-0 bg-rajasthani-wall">
                {/* Decorative Arch */}
                <div className="absolute inset-x-0 top-0 h-full max-w-lg mx-auto">
                    <div className="relative w-full h-full">
                        <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M 10 90 C 20 20, 30 -10, 50 5 S 70 -10, 80 20, 90 90, 90 90" fill="rgba(0,0,0,0.08)" />
                        </svg>
                    </div>
                </div>

                {/* Faint motifs */}
                 <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27100%27%20height=%27100%27%20viewBox=%270%200%20100%20100%27%3E%3Cg%20fill=%27%23333%27%20opacity=%270.2%27%3E%3Cpath%20d=%27M50%200C22.4%200%200%2022.4%200%2050s22.4%2050%2050%2050%2050-22.4%2050-50S77.6%200%2050%200zm0%2010c22.1%200%2040%2017.9%2040%2040s-17.9%2040-40%2040S10%2072.1%2010%2050%2027.9%2010%2050%2010z%27/%3E%3Cpath%20d=%27M50%2020c16.5%200%2030%2013.5%2030%2030s-13.5%2030-30%2030-30-13.5-30-30%2013.5-30%2030-30z%27/%3E%3C/g%3E%3C/svg%3E')] bg-repeat bg-center" style={{backgroundSize: '100px'}}></div>
                </div>
            </div>
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Jali Screen */}
            <div className="absolute top-0 left-0 right-0 h-1/5 bg-[radial-gradient(ellipse_at_top,_#00000030_0%,_transparent_60%)] opacity-50">
                 <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23d3a17d%27%20fill-opacity=%270.3%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>

            {/* Bottom elements */}
            <div className="absolute bottom-0 left-0 right-0 h-[12%] flex items-end">
                <div className="w-full h-full bg-marble-floor" />
                {/* Diya Lamp */}
                <div className="absolute right-6 bottom-4 text-amber-400 drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4C13.5 4 12 5.5 12 7.5S13.5 11 16 11s4-1.5 4-3.5S18.5 4 16 4z" fill="orange" />
                        <path d="M21.5 13.5C21.5 13.5 18 16 16 16s-5.5-2.5-5.5-2.5C6 14 3 17 3 19.5c0 1.5 1 2.5 2.5 2.5h13c1.5 0 2.5-1 2.5-2.5C21 17 18 14 21.5 13.5z" />
                    </svg>
                </div>
            </div>

             <style jsx>{`
                .bg-rajasthani-wall {
                    background-color: #FDF5E6; /* Old Lace - a soft, aged plaster color */
                    background-image:
                        /* Small floral block print */
                        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd' fill='%23d3a17d' fill-opacity='0.4'%3E%3Cpath d='M20 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm16 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM20 28c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'/%3E%3Cpath d='M20 0a20 20 0 100 40 20 20 0 000-40zM3.5 20a16.5 16.5 0 1133 0 16.5 16.5 0 01-33 0z'/%3E%3C/g%3E%3C/svg%3E");
                    background-size: 20px 20px;
                }
                .bg-marble-floor {
                    background-color: #f0e6d2; /* Light cream marble */
                    background-image: 
                      linear-gradient(45deg, #d1c4a8 25%, transparent 25%, transparent 75%, #d1c4a8 75%, #d1c4a8),
                      linear-gradient(45deg, #d1c4a8 25%, transparent 25%, transparent 75%, #d1c4a8 75%, #d1c4a8);
                    background-size: 30px 30px;
                    background-position: 0 0, 15px 15px;
                }
            `}</style>
        </div>
    )
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

    const command = show.script[currentMove];
    if (pulledStringId !== command.actionString) {
        setGameStatus('lost-wrong');
        return;
    }

    const pulledString = strings.find(s => s.id === pulledStringId);
    if (!pulledString) return;

    // A string is tangled if any string to its right has a higher priority.
    const isTangled = strings.some(otherString => {
        if (otherString.id === pulledString.id) {
            return false; // Don't compare a string to itself
        }
        const isToTheRight = otherString.slotIndex > pulledString.slotIndex;
        const hasHigherPriority = otherString.priority > pulledString.priority;
        return isToTheRight && hasHigherPriority;
    });

    if (isTangled) {
        setGameStatus('lost-tangled');
        return;
    }
    
    // Success
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
        <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary" style={{ textShadow: '0 0 5px white, 0 0 10px white, 0 0 15px white' }}>The Sutradhar's Show</h1>
        <div className="text-muted-foreground mt-3 text-base sm:text-lg flex justify-center items-center gap-2 flex-wrap">
          {show.script.map((command, index) => (
             <React.Fragment key={command.id + index}>
              <span className={cn(
                "px-2 py-1 rounded",
                {'font-bold text-foreground bg-primary/20': index === currentMove},
                {'opacity-60': index < currentMove},
              )} style={{ textShadow: '0 0 2px white' }}>
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
                <g transformOrigin="100 100" className={cn('transition-transform duration-500', {'rotate-[20deg]': isBowing})}>
                  <circle ref={el => anchorRefs.current.set('Head', el)} cx="100" cy="80" r="20" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>

                {/* Left Arm */}
                 <g transformOrigin="80 110" className={cn('transition-transform duration-500', {'origin-top-right rotate-[45deg]': isWavingLeft})}>
                  <line x1="80" y1="110" x2="40" y2="130" stroke="#8B4513" strokeWidth="5" />
                  <circle ref={el => anchorRefs.current.set('Left Hand', el)} cx="40" cy="130" r="8" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>

                {/* Right Arm (for waving) */}
                <g transformOrigin="120 110" className={cn('transition-transform duration-500', {'origin-top-left rotate-[-45deg]': isWaving})}>
                  <line x1="120" y1="110" x2="160" y2="130" stroke="#8B4513" strokeWidth="5" />
                  <circle ref={el => anchorRefs.current.set('Right Hand', el)} cx="160" cy="130" r="8" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>
                
                {/* Left Leg */}
                <g transformOrigin="90 180" className={cn('transition-transform duration-300', {'translate-y-[-10px]': isTappingFootLeft})}>
                  <line x1="90" y1="180" x2="70" y2="220" stroke="#8B4513" strokeWidth="5" />
                  <circle ref={el => anchorRefs.current.set('Left Foot', el)} cx="70" cy="220" r="10" fill="#F5DEB3" stroke="#A0522D" strokeWidth="2" />
                </g>

                {/* Right Leg (for tapping) */}
                 <g transformOrigin="110 180" className={cn('transition-transform duration-300', {'translate-y-[-10px]': isTappingFoot})}>
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
      
      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-md mt-4 mx-4 shadow-md">
        <p className="text-center text-sm text-foreground">
          Goal: Perform the show by pulling the correct strings. To pull a string, no string with a higher priority can be to its right. Drag anchors to untangle them.
        </p>
      </div>

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
