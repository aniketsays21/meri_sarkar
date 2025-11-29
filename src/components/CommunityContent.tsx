import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomsContent } from "./RoomsContent";
import { PollContent } from "./PollContent";
import { Users2, Vote } from "lucide-react";

export const CommunityContent = () => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger 
            value="rooms" 
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Users2 className="w-4 h-4" />
            <span>Rooms</span>
          </TabsTrigger>
          <TabsTrigger 
            value="polls"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Vote className="w-4 h-4" />
            <span>Polls</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rooms" className="mt-4">
          <RoomsContent />
        </TabsContent>
        
        <TabsContent value="polls" className="mt-4">
          <PollContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};
