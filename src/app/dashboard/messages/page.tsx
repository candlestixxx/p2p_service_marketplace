"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getRecentConversations, getConversation, sendMessage } from "@/actions/messaging";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId");
  const { data: session } = useSession();

  const [conversations, setConversations] = useState<Array<{
    contactId: string;
    contactName: string;
    contactRole: string;
    lastMessage: string;
    lastMessageAt: Date;
  }>>([]);
  const [activeThread, setActiveThread] = useState<Array<{
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    receiverId: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const convos = await getRecentConversations();
        setConversations(convos);

        if (contactId) {
          const thread = await getConversation(contactId);
          setActiveThread(thread as unknown as Array<{
            id: string;
            content: string;
            createdAt: Date;
            senderId: string;
            receiverId: string;
          }>);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // 15 second polling for new messages
    const interval = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [contactId]);

  useEffect(() => {
     // Scroll to bottom when thread loads
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !contactId) return;

    const content = messageContent.trim();
    setMessageContent(""); // Optimistic clear

    try {
       await sendMessage({ receiverId: contactId, content });
       // We skip full loadData here because the polling loop will catch it, or we rely on optimism
    } catch (err: unknown) {
       toast.error((err as Error).message || "Failed to send message.");
    }
  };

  if (loading && conversations.length === 0) {
    return <div className="p-8 text-center">Loading Messages...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Sidebar: Conversations List */}
      <Card className="w-1/3 flex flex-col h-full overflow-hidden">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-lg">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto flex-1">
          {conversations.length === 0 ? (
             <div className="p-4 text-center text-sm text-muted-foreground">No recent conversations.</div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.contactId}
                onClick={() => router.push(`/dashboard/messages?contactId=${c.contactId}`)}
                className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${contactId === c.contactId ? 'bg-muted/80' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <UserCircle2 className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm truncate">{c.contactName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="w-2/3 flex flex-col h-full overflow-hidden">
         {!contactId ? (
             <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                 Select a conversation to start messaging.
             </div>
         ) : (
             <>
                <CardHeader className="py-4 border-b bg-muted/20">
                  <CardTitle className="text-lg">Chat</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
                   {activeThread.length === 0 ? (
                       <div className="text-center text-muted-foreground text-sm my-auto">Start the conversation...</div>
                   ) : (
                       activeThread.map(msg => {
                          const isMe = msg.senderId === session?.user?.id;
                          return (
                            <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                               <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                                  {msg.content}
                               </div>
                               <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                          );
                       })
                   )}
                   <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t bg-background">
                   <form onSubmit={handleSend} className="flex gap-2">
                       <Input
                         value={messageContent}
                         onChange={(e) => setMessageContent(e.target.value)}
                         placeholder="Type a message..."
                         className="flex-1"
                       />
                       <Button type="submit" size="icon" disabled={!messageContent.trim()}>
                          <Send className="w-4 h-4" />
                       </Button>
                   </form>
                </div>
             </>
         )}
      </Card>
    </div>
  );
}

export default function MessagesPage() {
    return (
       <Suspense fallback={<div className="p-8 text-center">Loading Messages Router...</div>}>
           <MessagesContent />
       </Suspense>
    )
}
