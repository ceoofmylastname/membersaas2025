import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface DataSharingSettings {
  share_prayer_data: boolean;
  share_bible_data: boolean;
  share_fasting_data: boolean;
  share_giving_data: boolean;
}

export default function DataSharingPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<DataSharingSettings>({
    share_prayer_data: false,
    share_bible_data: false,
    share_fasting_data: false,
    share_giving_data: false,
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("community_profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        // Create default profile if it doesn't exist
        const { error: insertError } = await supabase
          .from("community_profiles")
          .insert([{ id: user?.id }]);

        if (insertError) {
          console.error("Error creating community profile:", insertError);
          toast({
            variant: "destructive",
            title: "Error creating profile",
            description: insertError.message,
          });
        }
      }
    } catch (error: any) {
      console.error("Error loading community settings:", error);
      toast({
        variant: "destructive",
        title: "Error loading settings",
        description: error.message,
      });
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from("community_profiles")
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq("id", user?.id);

      if (error) throw error;

      setSettings((prev) => ({ ...prev, [key]: value }));
      toast({
        title: "Settings updated",
        description: "Your community sharing preferences have been updated.",
      });
    } catch (error: any) {
      console.error("Error updating setting:", error);
      toast({
        variant: "destructive",
        title: "Error updating setting",
        description: error.message,
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Data Sharing Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="share-prayer">Share Prayer Data</Label>
          <Switch
            id="share-prayer"
            checked={settings.share_prayer_data}
            onCheckedChange={(checked) => updateSetting("share_prayer_data", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="share-bible">Share Bible Reading Data</Label>
          <Switch
            id="share-bible"
            checked={settings.share_bible_data}
            onCheckedChange={(checked) => updateSetting("share_bible_data", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="share-fasting">Share Fasting Data</Label>
          <Switch
            id="share-fasting"
            checked={settings.share_fasting_data}
            onCheckedChange={(checked) => updateSetting("share_fasting_data", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="share-giving">Share Giving Data</Label>
          <Switch
            id="share-giving"
            checked={settings.share_giving_data}
            onCheckedChange={(checked) => updateSetting("share_giving_data", checked)}
          />
        </div>
      </div>
    </Card>
  );
}