"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function StreakWidget() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
        const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from("progress_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completion_status", "completed");

      setStreak(count ?? 0);
    })();
  }, []);

  return (
    <div className="rounded-xl w-full bg-white p-4 shadow">
      <h2 className="mb-2 text-lg font-semibold text-gray-600">Streak</h2>
      <p className="text-3xl font-bold text-blue-600">{streak}</p>
    </div>
  );
}