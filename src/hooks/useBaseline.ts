import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface BaselineData {
  id: string;
  date: string;
  weight: number;
  waist: number | null;
  hips: number | null;
  chest: number | null;
  thighs: number | null;
  biceps: number | null;
  forearms: number | null;
  calves: number | null;
  shoulders: number | null;
  neck: number | null;
  created_at: string;
}

export function useBaseline() {
  const [baseline, setBaseline] = useState<BaselineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMeasurements, setHasMeasurements] = useState(false);

  const fetchBaseline = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('baseline_data')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching baseline:', error);
        setBaseline(null);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const baselineData = data[0] as BaselineData;
        setBaseline(baselineData);
        
        // Check if measurements were recorded
        const hasMeasures = 
          baselineData.waist !== null ||
          baselineData.hips !== null ||
          baselineData.chest !== null ||
          baselineData.thighs !== null ||
          baselineData.biceps !== null ||
          baselineData.forearms !== null ||
          baselineData.calves !== null ||
          baselineData.shoulders !== null ||
          baselineData.neck !== null;
        
        setHasMeasurements(hasMeasures);
      } else {
        setBaseline(null);
        setHasMeasurements(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseline();
  }, [fetchBaseline]);

  const hasBaseline = baseline !== null;

  return { baseline, hasBaseline, hasMeasurements, loading, fetchBaseline };
}
