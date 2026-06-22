import { useState, useEffect } from 'react';

export function useScreenLoading(delay = 350) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(id);
  }, [delay]);

  return loading;
}
