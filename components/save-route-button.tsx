"use client";

import { useState, useEffect, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSavedRoute } from "@/app/[locale]/(auth)/saved-routes-actions";
import { createClient } from "@/utils/supabase/client";

interface SaveRouteButtonProps {
  routeId: string;
  routeType: "bus" | "metro";
}

export default function SaveRouteButton({ routeId, routeType }: SaveRouteButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkSaved() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsAuthenticated(true);

      const { data } = await supabase
        .from("saved_routes")
        .select("id")
        .eq("user_id", user.id)
        .eq("route_id", routeId)
        .eq("route_type", routeType)
        .single();

      if (data) setIsSaved(true);
    }
    checkSaved();
  }, [routeId, routeType, supabase]);

  if (!isAuthenticated) return null;

  const handleToggle = () => {
    startTransition(async () => {
      // Optimistic update
      setIsSaved(!isSaved);
      
      const formData = new FormData();
      formData.append("routeId", routeId);
      formData.append("routeType", routeType);
      
      const res = await toggleSavedRoute(formData);
      if (res?.error) {
        // Revert on error
        setIsSaved(isSaved);
        console.error(res.error);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
      title={isSaved ? "Unsave Route" : "Save Route"}
    >
      {isSaved ? (
        <BookmarkCheck className="h-4 w-4 mr-1 text-emerald-400" />
      ) : (
        <Bookmark className="h-4 w-4 mr-1" />
      )}
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
