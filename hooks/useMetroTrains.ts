"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface TrainLocation {
  id: string;
  lat: number;
  lng: number;
  direction: number;
  speed: number;
  last_updated: string;
}

function parsePoint(pointStr: string) {
  const match = pointStr.match(/POINT\(([^ ]+) ([^)]+)\)/);
  if (match) {
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2])
    };
  }
  return { lat: 0, lng: 0 };
}

export function useMetroTrains() {
  const [trains, setTrains] = useState<Record<string, TrainLocation>>({});
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch initial active trains
    const fetchTrains = async () => {
      const { data, error } = await supabase
        .from('active_trains')
        .select('*');

      if (!error && data) {
        const initialTrains: Record<string, TrainLocation> = {};
        data.forEach(train => {
          const coords = parsePoint(train.current_location);
          initialTrains[train.train_id] = {
            id: train.train_id,
            lat: coords.lat,
            lng: coords.lng,
            direction: train.direction || 0,
            speed: train.speed || 0,
            last_updated: train.last_updated
          };
        });
        setTrains(initialTrains);
      }
    };

    fetchTrains();

    // 2. Subscribe to realtime updates
    const channel = supabase
      .channel('public:active_trains')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_trains' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newTrain = payload.new as Record<string, any>;
            const coords = parsePoint(newTrain.current_location as string);
            setTrains(prev => ({
              ...prev,
              [newTrain.train_id]: {
                id: newTrain.train_id,
                lat: coords.lat,
                lng: coords.lng,
                direction: newTrain.direction || 0,
                speed: newTrain.speed || 0,
                last_updated: newTrain.last_updated
              }
            }));
          } else if (payload.eventType === 'DELETE') {
            const oldTrain = payload.old as { train_id: string };
            setTrains(prev => {
              const next = { ...prev };
              delete next[oldTrain.train_id];
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Convert map to array for easier rendering
  return Object.values(trains);
}
