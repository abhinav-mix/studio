
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Prize segments for the wheel
const segments = [
  { value: 100, label: '100', color: '#FFC107' },
  { value: 0, label: 'Try Again', color: '#E0E0E0' },
  { value: 200, label: '200', color: '#8BC34A' },
  { value: 50, label: '50', color: '#FF9800' },
  { value: 500, label: '500', color: '#4CAF50' },
  { value: 0, label: 'Try Again', color: '#E0E0E0' },
  { value: 1000, label: '1000', color: '#F44336' },
  { value: 250, label: '250', color: '#2196F3' },
];

const SPIN_COST = 500;

export default function SpinWheel({ currentPoints, onSpinComplete }: { currentPoints: number; onSpinComplete: (prize: number) => void; }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const handleSpin = () => {
    if (currentPoints < SPIN_COST) {
      toast({
        variant: 'destructive',
        title: 'Not enough points!',
        description: `You need ${SPIN_COST} points to spin the wheel.`,
      });
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    
    // Calculate the random spin result
    const randomIndex = Math.floor(Math.random() * segments.length);
    const prize = segments[randomIndex].value;
    const prizeAngle = (360 / segments.length) * randomIndex;

    // Add multiple full rotations for effect + center the pointer on the segment
    const randomRotations = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
    const targetRotation = (randomRotations * 360) + prizeAngle + (360 / segments.length / 2);
    
    setRotation(prev => prev + targetRotation);

    // After the spin animation
    setTimeout(() => {
      setIsSpinning(false);
      onSpinComplete(prize);
      toast({
        title: prize > 0 ? `You won ${prize} points!` : 'Better luck next time!',
        description: `Spin again for another chance to win.`,
      });
    }, 5000); // This should match the CSS transition duration
  };

  const segmentAngle = 360 / segments.length;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Pointer */}
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-10" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }}>
          <div className="w-0 h-0 
            border-l-[15px] border-l-transparent
            border-r-[15px] border-r-transparent
            border-t-[30px] border-t-primary">
          </div>
        </div>

        {/* Wheel */}
        <div
          className="relative w-full h-full rounded-full border-8 border-primary shadow-2xl overflow-hidden transition-transform duration-[5000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {segments.map((segment, index) => (
            <div
              key={index}
              className="absolute w-1/2 h-1/2 origin-bottom-right"
              style={{
                transform: `rotate(${index * segmentAngle}deg)`,
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 0)`, // Creates a triangle
                backgroundColor: segment.color,
              }}
            >
              <div
                className="absolute w-full h-full flex items-center justify-center -rotate-90"
                style={{ transform: `rotate(${(segmentAngle / 2)}deg) translate(50%, 25%)` }}
              >
                <span className="text-white font-bold text-lg -rotate-90 origin-center">{segment.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button
        onClick={handleSpin}
        disabled={isSpinning || currentPoints < SPIN_COST}
        size="lg"
        className={cn("text-xl px-8 py-6", isSpinning && 'cursor-not-allowed animate-pulse')}
      >
        <Gift className="mr-2 h-6 w-6" />
        {isSpinning ? 'Spinning...' : `Spin for ${SPIN_COST} Points`}
      </Button>
      {currentPoints < SPIN_COST && (
          <p className="text-sm text-destructive">You need {SPIN_COST - currentPoints} more points to spin.</p>
      )}
    </div>
  );
}

