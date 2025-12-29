import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wallet, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CampaignCard from "@/components/CampaignCard";
import { useContract } from "@/hooks/use-contract";
import { microStxToStx } from "@/lib/contract-utils";

const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    totalRaised: 0,
    totalBacked: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    backedCampaigns: 0
  });
  const [createdCampaigns, setCreatedCampaigns] = useState([]);
  const [backedCampaigns, setBackedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getCampaignCount, getCampaign, getCampaignFunders, getCampaignProgress } = useContract();

  // Load dashboard data from blockchain
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Get total campaign count
        const totalCampaigns = await getCampaignCount();

        let allCreatedCampaigns = [];
        let allBackedCampaigns = [];
        let totalRaisedAmount = 0;
        let totalBackedAmount = 0;
        let activeCampaignsCount = 0;
        let completedCampaignsCount = 0;

        // Load all campaigns to categorize them
        const campaignPromises = [];
        for (let i = 0; i < totalCampaigns; i++) {
          campaignPromises.push(
            getCampaign(i)
              .then(async campaign => {
                // Get additional data
                const [funders, progress] = await Promise.all([
                  getCampaignFunders(i).catch(() => []),
                  getCampaignProgress(i).catch(() => ({ progress_percentage: 0, amount_raised: 0, goal: 0, is_funded: false }))
                ]);

                // Transform campaign data
                const transformedCampaign = {
                  id: i.toString(),
                  title: campaign.name,
                  description: campaign.description,
                  goal: campaign.goal,
                  raised: microStxToStx(campaign.amount_raised),
                  backers: Array.isArray(funders) ? funders.length : 0,
                  milestonesCount: campaign.milestones ? campaign.milestones.length : 0,
                  completedMilestones: campaign.milestones ?
                    campaign.milestones.filter((m: any) => m.status === 'completed').length : 0,
                  category: campaign.category,
                  endDate: campaign.status === 'completed' ? 'Completed' : 'Active',
                  status: campaign.status
                };

                // Update stats
                totalRaisedAmount += transformedCampaign.raised;

                if (campaign.status === 'funding' || campaign.status === 'milestone-voting') {
                  activeCampaignsCount++;
                } else if (campaign.status === 'completed') {
                  completedCampaignsCount++;
                }

                // For simplicity, we'll show all campaigns as "created" since we don't have user ownership tracking
                // In a real app, you'd check if the current user is the owner or a funder
                allCreatedCampaigns.push(transformedCampaign);

                return transformedCampaign;
              })
              .catch(err => {
                console.error(`Error loading campaign ${i}:`, err);
                return null;
              })
          );
        }

        await Promise.all(campaignPromises);

        // Update state
        setUserStats({
          totalRaised: totalRaisedAmount,
          totalBacked: totalBackedAmount, // TODO: Calculate based on user's contributions
          activeCampaigns: activeCampaignsCount,
          completedCampaigns: completedCampaignsCount,
          backedCampaigns: 0 // TODO: Calculate based on user's backed campaigns
        });

        setCreatedCampaigns(allCreatedCampaigns);
        setBackedCampaigns(allBackedCampaigns); // For now, empty - would need user-specific data

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [getCampaignCount, getCampaign, getCampaignFunders, getCampaignProgress]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <div className="pt-24 px-4 pb-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-verifund-light-accent text-xl">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <div className="pt-24 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-verifund-forest-dark mb-2">Dashboard</h1>
              <p className="text-verifund-earth-brown">Track your campaigns and contributions</p>
            </div>
            <Link to="/create">
              <Button className="btn-primary">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-verifund-earth-brown text-sm">Total Raised</p>
                    <p className="text-verifund-forest-dark text-2xl font-bold">
                      ${userStats.totalRaised.toLocaleString()} STX
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-verifund-earth-brown text-sm">Total Backed</p>
                    <p className="text-verifund-forest-dark text-2xl font-bold">
                      ${userStats.totalBacked.toLocaleString()} STX
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-verifund-earth-brown text-sm">Active Campaigns</p>
                    <p className="text-verifund-forest-dark text-2xl font-bold">
                      {userStats.activeCampaigns}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-verifund-earth-brown text-sm">Completed</p>
                    <p className="text-verifund-forest-dark text-2xl font-bold">
                      {userStats.completedCampaigns}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-verifund-earth-brown text-sm">Backed Projects</p>
                    <p className="text-verifund-forest-dark text-2xl font-bold">
                      {userStats.backedCampaigns}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Tabs */}
          <Tabs defaultValue="created" className="space-y-6">
            <TabsList className="bg-white/90 border border-verifund-sage/30">
              <TabsTrigger value="created" className="data-[state=active]:bg-verifund-sage text-verifund-forest-dark data-[state=active]:text-white">
                Created Campaigns ({createdCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="backed" className="data-[state=active]:bg-verifund-sage text-verifund-forest-dark data-[state=active]:text-white">
                Backed Campaigns ({backedCampaigns.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-verifund-forest-dark">Your Campaigns</h2>
                <Link to="/create">
                  <Button variant="outline" className="btn-secondary">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} {...campaign} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="backed" className="space-y-6">
              <h2 className="text-2xl font-bold text-verifund-forest-dark">Campaigns You've Backed</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {backedCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} {...campaign} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Recent Activity */}
          <Card className="glass-card mt-8">
            <CardHeader>
              <CardTitle className="text-verifund-forest-dark">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 py-3 border-b border-verifund-sage/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-verifund-forest-dark">Milestone approved for "AI-Powered Learning Assistant"</p>
                    <p className="text-verifund-earth-brown text-sm">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 py-3 border-b border-verifund-sage/30">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-verifund-forest-dark">New backer joined "Decentralized Social Media Platform"</p>
                    <p className="text-verifund-earth-brown text-sm">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 py-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-verifund-forest-dark">Milestone voting started for "Sustainable Agriculture Initiative"</p>
                    <p className="text-verifund-earth-brown text-sm">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
