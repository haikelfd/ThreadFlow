"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface TimeAgoProps {
  timestamp: number;
  className?: string;
}

export function TimeAgo({ timestamp, className }: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className} />;
  }

  return (
    <span className={className}>
      {formatDistanceToNow(timestamp * 1000, { addSuffix: true })}
    </span>
  );
}
