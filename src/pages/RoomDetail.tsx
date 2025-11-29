import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Users, Loader2, Crown, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface Participant {
  id: string;
  user_id: string;
  role: string;
  user_name?: string;
}

interface Room {
  id: string;
  title: string;
  description: string | null;
  topic_category: string;
  is_live: boolean;
  created_by: string;
}

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchRoom();
      fetchMessages();
      fetchParticipants();
      fetchUser();

      // Subscribe to realtime messages
      const messagesChannel = supabase
        .channel(`room-messages-${id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${id}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
          }
        )
        .subscribe();

      // Subscribe to participants
      const participantsChannel = supabase
        .channel(`room-participants-${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${id}` },
          () => fetchParticipants()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(participantsChannel);
      };
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

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

  const fetchRoom = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      navigate('/dashboard');
      return;
    }
    setRoom(data);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('room_messages')
      .select('*')
      .eq('room_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
    
    // Fetch user names for messages
    const userIds = [...new Set((data || []).map(m => m.user_id))];
    fetchUserNames(userIds);
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', id)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching participants:', error);
      return;
    }

    setParticipants(data || []);
    
    // Fetch user names
    const userIds = (data || []).map(p => p.user_id);
    fetchUserNames(userIds);
  };

  const fetchUserNames = async (userIds: string[]) => {
    if (userIds.length === 0) return;

    const { data } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);

    if (data) {
      const names: Record<string, string> = {};
      data.forEach(p => {
        names[p.id] = p.name;
      });
      setUserProfiles(prev => ({ ...prev, ...names }));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase.from('room_messages').insert({
        room_id: id,
        user_id: userId,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (userId) {
      await supabase
        .from('room_participants')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('room_id', id)
        .eq('user_id', userId);
    }
    navigate('/dashboard');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Room not found</p>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleLeaveRoom}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-foreground truncate text-sm">
                {room.title}
              </h1>
              {room.is_live && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{participants.length} participants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Strip */}
      <div className="bg-muted/30 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {participants.slice(0, 8).map((p) => {
            const name = userProfiles[p.user_id] || 'User';
            const isHost = p.role === 'host';
            return (
              <div key={p.id} className="flex flex-col items-center gap-1 shrink-0">
                <div className="relative">
                  <Avatar className="w-8 h-8 border-2 border-card">
                    <AvatarFallback className={isHost ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"}>
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  {isHost && (
                    <Crown className="w-3 h-3 text-secondary absolute -top-1 -right-1" />
                  )}
                  {p.role === 'speaker' && (
                    <Mic className="w-3 h-3 text-accent absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground truncate w-10 text-center">
                  {name.split(' ')[0]}
                </span>
              </div>
            );
          })}
          {participants.length > 8 && (
            <div className="flex flex-col items-center gap-1 shrink-0">
              <Avatar className="w-8 h-8 bg-muted">
                <AvatarFallback className="text-xs text-muted-foreground">
                  +{participants.length - 8}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.user_id === userId;
              const name = userProfiles[msg.user_id] || 'User';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {!isOwn && (
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] ${isOwn ? 'items-end' : ''}`}>
                    {!isOwn && (
                      <span className="text-xs text-muted-foreground mb-0.5 block">
                        {name}
                      </span>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            disabled={!userId}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || !userId}
            className="gradient-primary text-primary-foreground shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {!userId && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Sign in to send messages
          </p>
        )}
      </div>
    </div>
  );
};

export default RoomDetail;
