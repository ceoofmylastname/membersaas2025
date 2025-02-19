import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function PrayerCard() {
  const [dailyProgress, setDailyProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [goalMinutes] = useState(10000); // Fixed goal as per requirement
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchPrayerData = async () => {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Get all prayer sessions for the current month
      const { data: sessions } = await supabase
        .from('prayer_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id)
        .gte('started_at', startOfMonth.toISOString())
        .lte('ended_at', endOfMonth.toISOString());

      if (sessions) {
        // Convert seconds to minutes, rounding down to ensure accuracy
        const totalMinutes = sessions.reduce(
          (acc, session) => acc + Math.floor(session.duration_seconds / 60),
          0
        );
        setDailyProgress(totalMinutes);
      }
    };

    fetchPrayerData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('prayer-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prayer_sessions',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchPrayerData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const progressPercentage = Math.min((dailyProgress / goalMinutes) * 100, 100);

  return (
    <Card className="relative overflow-hidden transform-gpu transition-all duration-300 bg-gradient-to-br from-maroon-50 to-maroon-100 dark:from-maroon-900/30 dark:to-maroon-800/30 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(128,0,0,0.12)] hover:border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Daily Prayer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span>{Math.round(dailyProgress)} / {goalMinutes} minutes</span>
          <span className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            {streak} day streak
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-gray-200/50 dark:bg-gray-700/50"
        />
        <p className="text-sm text-muted-foreground text-center">
          {progressPercentage >= 100 ? "Great job! Goal achieved! 🎉" :
           progressPercentage >= 50 ? "You're doing great! Keep going! 💪" :
           "Let's start praying! 🙏"}
        </p>
      </CardContent>
    </Card>
  );
}