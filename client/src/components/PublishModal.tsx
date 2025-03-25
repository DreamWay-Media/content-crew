import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SiWordpress, SiShopify, SiAirtable, SiNotion, SiTrello } from "react-icons/si";
import { MdOutlineWorkspaces } from "react-icons/md";
import { BsCalendarWeek } from "react-icons/bs";
import AIResearchTooltip from "@/components/AIResearchTooltip";
import { AI_RESEARCH_TOOLTIPS } from "@/lib/tooltipContent";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
}

export default function PublishModal({ isOpen, onClose, articleTitle }: PublishModalProps) {
  const platforms = [
    { name: "WordPress", icon: SiWordpress, color: "#21759b" },
    { name: "Shopify", icon: SiShopify, color: "#7ab55c" },
    { name: "WebFlow", icon: MdOutlineWorkspaces, color: "#4353ff" },
    { name: "Notion", icon: SiNotion, color: "#000000" },
    { name: "Airtable", icon: SiAirtable, color: "#f82b60" },
    { name: "Monday", icon: BsCalendarWeek, color: "#ff3d57" },
    { name: "Trello", icon: SiTrello, color: "#0079bf" },
  ];

  const handlePublish = (platform: string) => {
    // This would normally connect to the platform's API
    console.log(`Publishing "${articleTitle}" to ${platform}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            Publish Article
            <AIResearchTooltip 
              content={AI_RESEARCH_TOOLTIPS.publishOption.content}
              title={AI_RESEARCH_TOOLTIPS.publishOption.title}
              className="ml-2"
            />
          </DialogTitle>
          <DialogDescription className="flex items-center justify-center">
            Choose a platform to publish your article
            <AIResearchTooltip 
              content="This premium feature allows you to publish directly to your favorite content platforms with a single click."
              title="Premium Feature"
              className="ml-1"
              iconSize={14}
            />
          </DialogDescription>
        </DialogHeader>
        <div className="relative grid grid-cols-2 gap-4 py-4">
          <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
            <div className="bg-white p-5 rounded-lg shadow-md text-center max-w-xs">
              <h3 className="text-lg font-semibold mb-2 flex items-center justify-center">
                Premium Feature
                <AIResearchTooltip 
                  content="Publishing is available in our premium subscription tier, giving you access to direct publishing to multiple platforms."
                  title="Upgrade to Premium"
                  className="ml-1"
                  iconSize={14}
                />
              </h3>
              <p className="text-gray-600 mb-4">Upgrade to our premium plan to unlock direct publishing to your favorite platforms.</p>
              <Button className="w-full">Upgrade Now</Button>
            </div>
          </div>
          
          {platforms.map((platform) => (
            <Button
              key={platform.name}
              variant="outline"
              className="flex items-center justify-center gap-2 p-4 h-auto"
              onClick={() => handlePublish(platform.name)}
              disabled
            >
              <platform.icon style={{ color: platform.color }} className="h-6 w-6" />
              <span>{platform.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}