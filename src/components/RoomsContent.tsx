import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RoomCard } from "./RoomCard";
import { Button } from "./ui/button";
import { Plus, Users2, Flame, Clock, Loader2 } from "lucide-react";
import { CreateRoomDialog } from "./CreateRoomDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: string;
  title: string;
  description: string | null;
  topic_category: string;
  is_live: boolean;
  scheduled_at: string | null;
  created_at: string;
  created_by: string;
  participant_count?: number;
}

export const RoomsContent = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
    fetchUser();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        () => fetchRooms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (profile) {
        setUserId(profile.id);
      }
    }
  };

  const fetchRooms = async () => {
    try {
      const { data: roomsData, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('is_live', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch participant counts for each room
      const roomsWithCounts = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { count } = await supabase
            .from('room_participants')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_active', true);
          
          return { ...room, participant_count: count || 0 };
        })
      );

      setRooms(roomsWithCounts);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to join a room",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already a participant
      const { data: existing } = await supabase
        .from('room_participants')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        await supabase.from('room_participants').insert({
          room_id: roomId,
          user_id: userId,
          role: 'listener'
        });
      }

      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      navigate(`/room/${roomId}`);
    }
  };

  const liveRooms = rooms.filter(r => r.is_live);
  const scheduledRooms = rooms.filter(r => r.scheduled_at && !r.is_live);
  const recentRooms = rooms.filter(r => !r.is_live && !r.scheduled_at);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="gradient-hero rounded-2xl p-5 text-primary-foreground">
        <div className="flex items-center gap-2 mb-2">
          <Users2 className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Discussion Rooms</h2>
        </div>
        <p className="text-sm opacity-90">
          Join live discussions on politics and local issues
        </p>
      </div>

      {/* Live Rooms */}
      {liveRooms.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-foreground">Live Now</h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
          </div>
          <div className="space-y-3">
            {liveRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={() => handleJoinRoom(room.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Rooms */}
      {scheduledRooms.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-secondary" />
            <h3 className="font-semibold text-foreground">Scheduled</h3>
          </div>
          <div className="space-y-3">
            {scheduledRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={() => handleJoinRoom(room.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Rooms */}
      {recentRooms.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Recent Discussions</h3>
          <div className="space-y-3">
            {recentRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={() => handleJoinRoom(room.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rooms.length === 0 && (
        <div className="bg-card rounded-xl p-8 text-center border border-border">
          <Users2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No active rooms</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to start a discussion!
          </p>
        </div>
      )}

      {/* Create Room Button */}
      <Button 
        onClick={() => setIsCreateOpen(true)}
        className="w-full gradient-primary text-primary-foreground"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create New Room
      </Button>

      <CreateRoomDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        userId={userId}
        onCreated={fetchRooms}
      />
    </div>
  );
};
