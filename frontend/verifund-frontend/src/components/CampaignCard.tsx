
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  backers: number;
  milestonesCount: number;
  completedMilestones: number;
  category: string;
  endDate: string;
  status: "funding" | "completed" | "milestone-voting";
}

const CampaignCard = ({
  id,
  title,
  description,
  goal,
  raised,
  backers,
  milestonesCount,
  completedMilestones,
  category,
  endDate,
  status
}: CampaignCardProps) => {
  const progressPercentage = ((raised) / goal) * 100;

  const getStatusBadge = () => {
    switch (status) {
      case "funding":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Funding</Badge>;
      case "completed":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Completed</Badge>;
      case "milestone-voting":
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Voting</Badge>;
    }
  };

  return (
    <Link to={`/campaign/${id}`}>
      <Card className="glass-card hover:shadow-xl transition-all duration-300 h-full group">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="text-verifund-sage border-verifund-sage">
              {category}
            </Badge>
            {getStatusBadge()}
          </div>
          <CardTitle className="text-verifund-forest-dark group-hover:text-verifund-sage transition-colors">
            {title}
          </CardTitle>
          <p className="text-verifund-earth-brown text-sm line-clamp-2">
            {description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-verifund-earth-brown">Progress</span>
              <span className="text-verifund-forest-dark font-medium">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-verifund-forest-dark font-medium">
                ${raised.toLocaleString()} STX
              </span>
              <span className="text-verifund-earth-brown">
                of ${goal.toLocaleString()} STX
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-verifund-sage/30">
            <div className="flex items-center space-x-1 text-xs text-verifund-earth-brown">
              <Users className="w-3 h-3" />
              <span>{backers} backers</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-verifund-earth-brown">
              <CheckCircle className="w-3 h-3" />
              <span>{completedMilestones}/{milestonesCount} milestones</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-verifund-earth-brown">
              <Calendar className="w-3 h-3" />
              <span>{endDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CampaignCard;
