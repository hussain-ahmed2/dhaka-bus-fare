"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

// A unique session ID for this user's trip to anonymize tracking
const sessionId = Math.random().toString(36).substring(2, 15);

export function useBroadcastLocation(isOnTrain: boolean) {
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, [supabase.auth]);

  useEffect(() => {
    if (!isOnTrain) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Geolocation is not supported by your browser");
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude, speed, heading } = position.coords;
      
      // We only insert if we have a reasonable speed (e.g. they are moving)
      // or we just let the database trigger filter it. We will send it to the DB.
      
      try {
        const { error } = await supabase.from('raw_user_locations').insert({
          session_id: sessionId,
          user_id: userId, // Link to logged-in user if available
          location: `POINT(${longitude} ${latitude})`,
          speed: speed,
          heading: heading,
          is_on_train: true
        });

        if (error) {
          console.error("Error broadcasting location:", error);
        }
      } catch (err) {
        console.error("Failed to broadcast location:", err);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(error.message);
    };

    // Watch position in real-time
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isOnTrain, supabase, userId]);

  return { error };
}
