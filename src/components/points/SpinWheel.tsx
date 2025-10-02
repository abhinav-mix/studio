
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Prize segments for the wheel
const segments = [
  { value: 500, label: '500', color: '#9C27B0', textColor: '#fff' }, // Purple
  { value: 100, label: '100', color: '#FFC107', textColor: '#fff' }, // Amber
  { value: 1000, label: '1000', color: '#8BC34A', textColor: '#fff' }, // Light Green
  { value: 0, label: 'iPhone', color: '#F44336', isItem: true, textColor: '#fff' }, // Red
  { value: 10000, label: '10k', color: '#4CAF50', textColor: '#fff' }, // Green
  { value: 0, label: 'Samsung S25', color: '#2196F3', isItem: true, textColor: '#fff' }, // Blue
];

const SPIN_COST = 500;

export default function SpinWheel({ currentPoints, onSpinComplete }: { currentPoints: number; onSpinComplete: (prize: number, prizeLabel: string, isItem: boolean) => void; }) {
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
    
    // Only allow results for index 0 (500 points) or index 1 (100 points)
    const allowedIndices = [0, 1];
    const randomIndex = allowedIndices[Math.floor(Math.random() * allowedIndices.length)];

    const resultSegment = segments[randomIndex];
    const { value: prizePoints, label: prizeLabel, isItem = false } = resultSegment;
    const prizeAngle = (360 / segments.length) * randomIndex;

    // Add multiple full rotations for effect + center the pointer on the segment
    const randomRotations = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
    const targetRotation = (randomRotations * 360) + prizeAngle + (360 / segments.length / 2);
    
    setRotation(prev => prev + targetRotation);

    // After the spin animation
    setTimeout(() => {
      setIsSpinning(false);
      onSpinComplete(prizePoints, prizeLabel, isItem);
      
      if (isItem) {
          toast({
            title: `Congratulations! You won a ${prizeLabel}!`,
            description: 'We will contact you shortly regarding your prize.',
            duration: 10000,
          });
      } else if (prizePoints > 0) {
        toast({
            title: `🎉 You won ${prizePoints} points! 🎉`,
            description: `Your points have been added to your account.`,
            duration: 8000,
        });
      }

    }, 6000); // This should match the CSS transition duration
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
          className="relative w-full h-full rounded-full border-8 border-primary shadow-2xl overflow-hidden"
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
          {/* Text Labels */}
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
           {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-primary rounded-full shadow-inner"/>
        </div>
      </div>
      <Button
        onClick={handleSpin}
        disabled={isSpinning || currentPoints < SPIN_COST}
        size="lg"
        className={cn("text-xl px-8 py-6 transition-all duration-300 transform hover:scale-105", isSpinning && 'cursor-not-allowed animate-pulse')}
      >
        <Gift className="mr-2 h-6 w-6" />
        {isSpinning ? 'Spinning...' : `Spin for ${SPIN_COST} Points`}
      </Button>
      {currentPoints < SPIN_COST && !isSpinning && (
          <p className="text-sm text-destructive">You need {SPIN_COST - currentPoints} more points to spin.</p>
      )}
    </div>
  );
}
