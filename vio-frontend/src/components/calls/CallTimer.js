"use client";

import { useState, useEffect } from 'react';
import { formatCallDuration } from '../../utils/callFormatters';

export default function CallTimer({ startTime }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Calculate initial offset if call started earlier
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      setSeconds(Math.floor((now - start) / 1000));
    }

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span className="font-mono font-bold text-lg">
      {formatCallDuration(seconds)}
    </span>
  );
}
