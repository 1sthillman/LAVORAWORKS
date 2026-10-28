import React from 'react';
import { useLongPress } from '@/hooks/useLongPress';
import { cn } from '@/lib/utils';

interface LongPressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onLongPress: () => void;
  threshold?: number;
  children: React.ReactNode;
}

export const LongPressButton: React.FC<LongPressButtonProps> = ({
  onLongPress,
  threshold = 1200,
  children,
  className,
  ...props
}) => {
  const longPress = useLongPress(onLongPress, {
    threshold,
    onStart: () => console.log('Long press started'),
    onFinish: () => console.log('Long press finished'),
    onCancel: () => console.log('Long press cancelled'),
  });

  return (
    <button
      {...props}
      {...longPress}
      className={cn(
        'relative overflow-hidden',
        className
      )}
    >
      {/* Progress bar */}
      {longPress.progress > 0 && (
        <div
          className="absolute inset-0 bg-white/20 transition-all duration-75"
          style={{ width: `${longPress.progress}%` }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
