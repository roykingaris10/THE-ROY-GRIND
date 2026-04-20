import { useState, useEffect } from 'react';
import { fetchLiturgicalDay, type LiturgicalDay } from '@/lib/orthocal';

export function useLiturgicalDay() {
  const [data, setData] = useState<LiturgicalDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchLiturgicalDay(new Date()).then(result => {
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { liturgicalDay: data, loading };
}
