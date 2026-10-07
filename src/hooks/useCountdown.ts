import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownOptions {
  expiresAt: string | null;
  onExpire?: () => void;
  isConfirmed?: boolean;
}

interface UseCountdownReturn {
  formattedTime: string;
  isExpired: boolean;
  remainingSeconds: number;
}

export function useCountdown({
  expiresAt,
  onExpire,
  isConfirmed = false,
}: UseCountdownOptions): UseCountdownReturn {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const calculateRemaining = useCallback((): number => {
    if (!expiresAt || isConfirmed) return 0;

    const targetTime = new Date(expiresAt).getTime();
    if (isNaN(targetTime)) return 0;

    const now = Date.now();
    const diffInSeconds = Math.floor((targetTime - now) / 1000);
    return Math.max(0, diffInSeconds);
  }, [expiresAt, isConfirmed]);

  useEffect(() => {
    if (!expiresAt || isConfirmed) {
      setRemainingSeconds(0);
      setIsExpired(false);
      return;
    }

    const initialRemaining = calculateRemaining();
    setRemainingSeconds(initialRemaining);

    if (initialRemaining <= 0) {
      setIsExpired(true);
      if (onExpireRef.current) {
        onExpireRef.current();
      }
      return;
    }

    setIsExpired(false);

    const intervalId = setInterval(() => {
      const secondsLeft = calculateRemaining();
      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        setIsExpired(true);
        clearInterval(intervalId);
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [expiresAt, isConfirmed, calculateRemaining]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    formattedTime: formatTime(remainingSeconds),
    isExpired: isExpired || (remainingSeconds <= 0 && Boolean(expiresAt) && !isConfirmed),
    remainingSeconds,
  };
}
