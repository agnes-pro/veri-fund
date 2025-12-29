import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import CampaignCard from "@/components/CampaignCard";
import { useContract } from "../hooks/use-contract";
import { microStxToStx } from "@/lib/contract-utils";

const CampaignList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getCampaignCount, getCampaign, getCampaignFunders, getCampaignProgress } = useContract();

  // Load campaigns from blockchain
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        
        // Get total campaign count first
        const totalCampaigns = await getCampaignCount();

        console.log('Total campaigns:', totalCampaigns);

        // Load each campaign using our hook's helper functions
        const campaignPromises = [];
        for (let i = 0; i < totalCampaigns; i++) {
          campaignPromises.push(
            getCampaign(i)
              .then(async campaign => {
                console.log(`Campaign ${i} data:`, campaign);

                // Get additional data for display
                const [funders, progress] = await Promise.all([
                  getCampaignFunders(i).catch(() => []),
                  getCampaignProgress(i).catch(() => ({ progress_percentage: 0, amount_raised: 0, goal: 0, is_funded: false }))
                ]);

                // Transform contract data to match frontend expectations
                return {
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
              })
              .catch(err => {
                console.error(`Error loading campaign ${i}:`, err);
                return null;
              })
          );
        }
        
        const loadedCampaigns = await Promise.all(campaignPromises);
        const validCampaigns = loadedCampaigns.filter(campaign => campaign !== null);
        
        console.log('Loaded campaigns:', validCampaigns);
        setCampaigns(validCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        // Display empty state instead of mock data
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [getCampaignCount, getCampaign, getCampaignFunders, getCampaignProgress]);

  // Use only blockchain data - no mock data fallback
  const displayCampaigns = campaigns;

  const categories = ["all", "Technology", "Environment", "Education", "Healthcare", "Art", "Social"];
  const statuses = ["all", "funding", "milestone-voting", "completed"];

  const filteredCampaigns = displayCampaigns.filter(campaign => {
    const title = typeof campaign.title === 'string' ? campaign.title : '';
    const description = typeof campaign.description === 'string' ? campaign.description : '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <div className="pt-24 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">All Campaigns</h1>
            <p className="text-verifund-neutral-gray">Discover and support innovative projects</p>
          </div>

          {/* Filters */}
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-verifund-neutral-gray" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-verifund-secondary-dark border-verifund-accent-dark">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-verifund-light-accent">
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-verifund-secondary-dark border-verifund-accent-dark">
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status} className="text-verifund-light-accent">
                        {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-verifund-secondary-dark border-verifund-accent-dark">
                    <SelectItem value="newest" className="text-verifund-light-accent">Newest</SelectItem>
                    <SelectItem value="oldest" className="text-verifund-light-accent">Oldest</SelectItem>
                    <SelectItem value="most-funded" className="text-verifund-light-accent">Most Funded</SelectItem>
                    <SelectItem value="ending-soon" className="text-verifund-light-accent">Ending Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-verifund-accent-dark/30">
                <p className="text-verifund-neutral-gray">
                  Showing {filteredCampaigns.length} of {displayCampaigns.length} campaigns
                  {loading && ' (Loading...)'}
                </p>
                <Button variant="outline" size="sm" className="btn-secondary">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-verifund-light-accent text-xl">Loading campaigns...</div>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CampaignCard {...campaign} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Filter className="w-16 h-16 text-verifund-neutral-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-verifund-light-accent mb-2">No campaigns found</h3>
                <p className="text-verifund-neutral-gray">
                  Try adjusting your search criteria or browse all campaigns
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                  }}
                  className="btn-primary mt-4"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Load More */}
          {filteredCampaigns.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" className="btn-secondary">
                Load More Campaigns
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignList;