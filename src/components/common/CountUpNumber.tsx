import React, { useEffect, useState } from 'react';
import { formatNumber, formatVND } from '../../utils/formatters';

interface CountUpNumberProps {
  value: number;
  duration?: number;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  duration = 1000,
  isCurrency = false,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(startValue + (endValue - startValue) * easeProgress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = isCurrency ? formatVND(current) : formatNumber(current);

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
};
