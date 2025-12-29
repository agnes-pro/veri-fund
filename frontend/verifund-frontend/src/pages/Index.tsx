import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Users, Wallet, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CampaignCard from "@/components/CampaignCard";

const Index = () => {
  const featuredCampaigns = [
    {
      id: "1",
      title: "Decentralized Social Media Platform",
      description: "Building a censorship-resistant social network powered by blockchain technology.",
      goal: 50000,
      raised: 32500,
      backers: 127,
      milestonesCount: 4,
      completedMilestones: 2,
      category: "Technology",
      endDate: "30 days",
      status: "funding" as const
    },
    {
      id: "2",
      title: "Sustainable Agriculture Initiative",
      description: "Funding innovative farming techniques to reduce environmental impact.",
      goal: 25000,
      raised: 18750,
      backers: 89,
      milestonesCount: 3,
      completedMilestones: 1,
      category: "Environment",
      endDate: "45 days",
      status: "milestone-voting" as const
    },
    {
      id: "3",
      title: "Open Source Education Platform",
      description: "Creating free educational resources for underserved communities worldwide.",
      goal: 75000,
      raised: 75000,
      backers: 203,
      milestonesCount: 5,
      completedMilestones: 5,
      category: "Education",
      endDate: "Completed",
      status: "completed" as const
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-verifund-forest-dark mb-6 leading-tight">
              Funding with <span className="text-transparent bg-clip-text bg-gradient-to-r from-verifund-sage to-verifund-moss">trust</span>
            </h1>
            <p className="text-xl md:text-2xl text-verifund-forest-dark mb-4">
              Powered by Bitcoin. Built on Stacks.
            </p>
            <p className="text-lg text-verifund-earth-brown mb-12 max-w-3xl mx-auto">
              Transparent, milestone-based crowdfunding that ensures accountability and builds trust between creators and backers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/campaigns">
                <Button className="btn-primary text-lg px-8 py-4">
                  Explore Campaigns
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="outline" className="btn-secondary text-lg px-8 py-4">
                  Create Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold text-verifund-forest-dark mb-4">How VeriFund Works</h2>
            <p className="text-verifund-earth-brown text-lg max-w-2xl mx-auto">
              Our milestone-based system ensures transparency and accountability at every step
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card animate-slide-up">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-verifund-sage to-verifund-moss rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-verifund-forest-dark">1. Create & Fund</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-verifund-earth-brown">
                  Creators set up campaigns with clear milestones and funding goals. Backers contribute STX tokens to support projects they believe in.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-verifund-sage to-verifund-moss rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-verifund-forest-dark">2. Milestone Voting</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-verifund-earth-brown">
                  Backers vote on milestone completion. Funds are released progressively as creators demonstrate tangible progress toward their goals.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-verifund-sage to-verifund-moss rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-verifund-forest-dark">3. Trust & Transparency</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-verifund-earth-brown">
                  Smart contracts ensure automatic fund distribution and refunds. All transactions are recorded on the Stacks blockchain for full transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-verifund-forest-dark mb-4">Featured Campaigns</h2>
              <p className="text-verifund-earth-brown text-lg">
                Discover innovative projects making a difference
              </p>
            </div>
            <Link to="/campaigns">
              <Button variant="outline" className="btn-secondary">
                View All Campaigns
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign, index) => (
              <div key={campaign.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CampaignCard {...campaign} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <Wallet className="w-16 h-16 text-verifund-sage mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-verifund-forest-dark mb-4">Ready to Start Funding?</h2>
            <p className="text-verifund-earth-brown text-lg mb-8">
              Join the revolution of transparent, milestone-based crowdfunding on the Stacks blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button className="btn-primary">
                  Launch Your Campaign
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button variant="outline" className="btn-secondary">
                  Back a Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
