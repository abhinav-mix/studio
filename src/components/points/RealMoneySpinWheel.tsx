
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Prize segments for the wheel
const segments = [
  { value: 0, label: '₹10000', color: '#FFD700', isItem: true, textColor: '#000' }, // Gold for win
  { value: 0, label: 'Next Time', color: '#F44336', isItem: false, textColor: '#fff' }, // Red for lose
];

const SPIN_COST = 10000;

type PrizeResult = {
    prizeLabel: string;
    isItem: boolean;
    prizePoints: number;
} | null;

export default function RealMoneySpinWheel({ currentPoints, onSpinComplete }: { currentPoints: number; onSpinComplete: (prize: number, prizeLabel: string, isItem: boolean) => void; }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prizeResult, setPrizeResult] = useState<PrizeResult>(null);
  const { toast } = useToast();

  const handleSpin = () => {
    if (currentPoints < SPIN_COST) {
      toast({
        variant: 'destructive',
        title: 'Not enough points!',
        description: `You need ${SPIN_COST} points to spin this wheel.`,
      });
      return;
    }
    if (isSpinning) return;

    setPrizeResult(null);
    setIsSpinning(true);
    
    // 50/50 chance
    const randomIndex = Math.floor(Math.random() * 2);

    const resultSegment = segments[randomIndex];
    const { value: prizePoints, label: prizeLabel, isItem = false } = resultSegment;
    const prizeAngle = (360 / segments.length) * randomIndex;

    // Add multiple full rotations for effect + center the pointer on the segment
    const randomRotations = 5 + Math.floor(Math.random() * 5);
    const targetRotation = (randomRotations * 360) + prizeAngle + (360 / segments.length / 2);
    
    setRotation(prev => prev + targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinComplete(prizePoints, prizeLabel, isItem);
      setPrizeResult({ prizeLabel, isItem, prizePoints });
    }, 6000); // Match CSS transition duration
  };

  const segmentAngle = 360 / segments.length;

  return (
    <div className="flex flex-col items-center gap-8 py-8 relative border-2 border-yellow-400 rounded-xl bg-secondary/50">
      <h2 className="text-2xl font-bold font-headline text-yellow-500">High Stakes Wheel!</h2>
       {prizeResult && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in duration-500">
            <div className="relative bg-gradient-to-br from-yellow-400 to-amber-600 p-8 rounded-2xl shadow-2xl text-white text-center transform scale-100 animate-in zoom-in-75 duration-500">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:bg-white/20" onClick={() => setPrizeResult(null)}>
                    <X />
                </Button>
                {prizeResult.isItem ? (
                     <>
                        <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
                        <p className="text-4xl font-headline">You won {prizeResult.prizeLabel}!</p>
                        <p className="mt-4 text-sm">We will contact you shortly about your prize.</p>
                     </>
                ) : prizeResult.prizePoints > 0 ? (
                     <>
                        <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
                        <p className="text-4xl font-headline">You won {prizeResult.prizePoints} points!</p>
                        <p className="mt-4 text-sm">Your points have been added to your account.</p>
                     </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Better Luck Next Time!</h2>
                        <p className="text-4xl font-headline">No prize this time.</p>
                        <p className="mt-4 text-sm">Keep earning points to try again!</p>
                    </>
                )}
            </div>
        </div>
      )}
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-10" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }}>
          <div className="w-0 h-0 
            border-l-[15px] border-l-transparent
            border-r-[15px] border-r-transparent
            border-t-[30px] border-t-yellow-400">
          </div>
        </div>

        <div
          className="relative w-full h-full rounded-full border-8 border-yellow-400 shadow-2xl overflow-hidden"
          style={{ 
            transition: `transform 6000ms cubic-bezier(0.1, 0.5, 0.2, 1)`,
            transform: `rotate(${rotation}deg)` 
          }}
        >
          {segments.map((segment, index) => (
            <div
              key={index}
              className="absolute w-1/2 h-1/2 origin-bottom-right"
              style={{
                transform: `rotate(${index * segmentAngle}deg)`,
                backgroundColor: segment.color,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%)',
              }}
            />
          ))}
          {segments.map((segment, index) => (
              <div
                key={`label-${index}`}
                className="absolute w-full h-full flex items-start justify-center"
                style={{
                  transform: `rotate(${index * segmentAngle + segmentAngle / 2}deg)`,
                }}
              >
                <span 
                  className="font-bold text-lg md:text-xl"
                  style={{
                    color: segment.textColor,
                    transform: 'translateY(35px) rotate(-90deg)',
                    display: 'inline-block',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {segment.label}
                </span>
              </div>
          ))}
          <div className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-yellow-500 rounded-full shadow-inner"/>
        </div>
      </div>
      <Button
        onClick={handleSpin}
        disabled={isSpinning || currentPoints < SPIN_COST}
        size="lg"
        className={cn("text-xl px-8 py-6 transition-all duration-300 transform hover:scale-105 bg-yellow-500 hover:bg-yellow-600 text-white", isSpinning && 'cursor-not-allowed animate-pulse')}
      >
        {isSpinning ? 'Spinning...' : `Spin for ${SPIN_COST} Points`}
      </Button>
      {currentPoints < SPIN_COST && !isSpinning && (
          <p className="text-sm text-destructive">You need {SPIN_COST - currentPoints} more points to spin.</p>
      )}
    </div>
  );
}
