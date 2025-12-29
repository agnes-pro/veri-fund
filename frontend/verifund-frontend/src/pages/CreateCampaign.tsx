
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  FileText,
  Target,
  Milestone
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { useContract } from '../hooks/use-contract';
import { Cl } from '@stacks/transactions';

interface MilestoneData {
  id: string;
  title: string;
  description: string;
  amount: number;
}

const CreateCampaign = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    title: "",
    description: "",
    goal: "",
    category: "",
    proposalLink: "",
    milestones: [] as MilestoneData[]
  });

  const steps = [
    { number: 1, title: "Campaign Details", icon: FileText },
    { number: 2, title: "Add Milestones", icon: Milestone },
    { number: 3, title: "Review & Submit", icon: CheckCircle }
  ];

  const categories = [
    "Technology", "Environment", "Education", "Healthcare", 
    "Art", "Social", "Research", "Gaming", "Other"
  ];

  const { callContract } = useContract();

  const addMilestone = () => {
    const newMilestone: MilestoneData = {
      id: Date.now().toString(),
      title: "",
      description: "",
      amount: 0
    };
    setCampaignData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  const updateMilestone = (id: string, field: keyof MilestoneData, value: string | number) => {
    setCampaignData(prev => ({
      ...prev,
      milestones: prev.milestones.map(milestone =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const removeMilestone = (id: string) => {
    setCampaignData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(milestone => milestone.id !== id)
    }));
  };

  const totalMilestoneAmount = campaignData.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return campaignData.title && campaignData.description && campaignData.goal && campaignData.category;
      case 2:
        return campaignData.milestones.length > 0 && 
               campaignData.milestones.every(m => m.title && m.description && m.amount > 0) &&
               totalMilestoneAmount <= parseInt(campaignData.goal);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting campaign:", campaignData);
      const milestones = Cl.list(
        campaignData.milestones.map(milestone =>
          Cl.tuple({
            name: Cl.stringAscii(milestone.title),
            description: Cl.stringAscii(milestone.description),
            amount: Cl.uint(milestone.amount)
          })
        )
      );
      
      const response = await callContract({
        functionName: 'create_campaign',
        functionArgs: [
          Cl.stringAscii(campaignData.title),
          Cl.stringAscii(campaignData.description),
          Cl.uint(parseInt(campaignData.goal)),
          Cl.stringAscii(campaignData.category),
          milestones,
          campaignData.proposalLink ? 
            Cl.some(Cl.stringAscii(campaignData.proposalLink)) : 
            Cl.none()
        ]
      });

      console.log(`Transaction submitted:`, response);
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <div className="pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-verifund-mid-tone hover:text-verifund-light-accent transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Create Campaign</h1>
            <p className="text-verifund-neutral-gray">Launch your project with milestone-based funding</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${
                    currentStep >= step.number ? 'text-verifund-light-accent' : 'text-verifund-neutral-gray'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.number 
                        ? 'border-verifund-mid-tone bg-verifund-mid-tone text-white' 
                        : 'border-verifund-neutral-gray'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-medium hidden sm:inline">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-12 mx-4 ${
                      currentStep > step.number ? 'bg-verifund-mid-tone' : 'bg-verifund-neutral-gray'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="text-verifund-light-accent">
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Campaign Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-verifund-light-accent font-medium mb-2">
                      Campaign Title *
                    </label>
                    <Input
                      placeholder="Enter your campaign title"
                      value={campaignData.title}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-verifund-light-accent font-medium mb-2">
                      Description *
                    </label>
                    <Textarea
                      placeholder="Describe your project, its goals, and why people should support it"
                      value={campaignData.description}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-verifund-light-accent font-medium mb-2">
                        Funding Goal (STX) *
                      </label>
                      <Input
                        type="number"
                        placeholder="50000"
                        value={campaignData.goal}
                        onChange={(e) => setCampaignData(prev => ({ ...prev, goal: e.target.value }))}
                        className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-verifund-light-accent font-medium mb-2">
                        Category *
                      </label>
                      <Select 
                        value={campaignData.category} 
                        onValueChange={(value) => setCampaignData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-verifund-secondary-dark border-verifund-accent-dark">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="text-verifund-light-accent">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-verifund-light-accent font-medium mb-2">
                      Proposal Link (Optional)
                    </label>
                    <Input
                      placeholder="https://github.com/yourname/proposal"
                      value={campaignData.proposalLink}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, proposalLink: e.target.value }))}
                      className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                    />
                    <p className="text-verifund-neutral-gray text-sm mt-1">
                      Link to detailed proposal, whitepaper, or project documentation
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Milestones */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-verifund-light-accent">Project Milestones</h3>
                      <p className="text-verifund-neutral-gray text-sm">
                        Break down your project into achievable milestones with specific funding amounts
                      </p>
                    </div>
                    <Button onClick={addMilestone} className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>

                  {campaignData.milestones.length > 0 && (
                    <div className="space-y-4">
                      {campaignData.milestones.map((milestone, index) => (
                        <Card key={milestone.id} className="glass-card border-verifund-accent-dark/50">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-verifund-light-accent">
                                Milestone {index + 1}
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeMilestone(milestone.id)}
                                className="text-red-400 border-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Input
                                placeholder="Milestone title"
                                value={milestone.title}
                                onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                              />
                            </div>
                            <div>
                              <Textarea
                                placeholder="Describe what will be accomplished in this milestone"
                                value={milestone.description}
                                onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                rows={3}
                                className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                placeholder="Amount (STX)"
                                value={milestone.amount || ''}
                                onChange={(e) => updateMilestone(milestone.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {campaignData.milestones.length === 0 && (
                    <Card className="glass-card border-2 border-dashed border-verifund-accent-dark/50">
                      <CardContent className="p-12 text-center">
                        <Target className="w-16 h-16 text-verifund-neutral-gray mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-verifund-light-accent mb-2">No milestones yet</h3>
                        <p className="text-verifund-neutral-gray mb-6">
                          Add milestones to break down your project into manageable phases
                        </p>
                        <Button onClick={addMilestone} className="btn-primary">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Milestone
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {campaignData.milestones.length > 0 && (
                    <div className="bg-verifund-secondary-dark/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-verifund-neutral-gray">Total milestone funding:</span>
                        <span className={`font-medium ${
                          totalMilestoneAmount <= parseInt(campaignData.goal) 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          ${totalMilestoneAmount.toLocaleString()} STX
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-verifund-neutral-gray">Campaign goal:</span>
                        <span className="text-verifund-light-accent font-medium">
                          ${parseInt(campaignData.goal || '0').toLocaleString()} STX
                        </span>
                      </div>
                      {totalMilestoneAmount > parseInt(campaignData.goal) && (
                        <p className="text-red-400 text-xs mt-2">
                          ⚠️ Total milestone funding exceeds campaign goal
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-verifund-light-accent mb-4">Review Your Campaign</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-verifund-neutral-gray text-sm">Title</label>
                          <p className="text-verifund-light-accent font-medium">{campaignData.title}</p>
                        </div>
                        <div>
                          <label className="text-verifund-neutral-gray text-sm">Category</label>
                          <Badge className="ml-2 bg-verifund-accent-dark/30 text-verifund-light-accent">
                            {campaignData.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-verifund-neutral-gray text-sm">Description</label>
                        <p className="text-verifund-light-accent">{campaignData.description}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-verifund-neutral-gray text-sm">Funding Goal</label>
                          <p className="text-verifund-light-accent font-medium">
                            ${parseInt(campaignData.goal).toLocaleString()} STX
                          </p>
                        </div>
                        <div>
                          <label className="text-verifund-neutral-gray text-sm">Milestones</label>
                          <p className="text-verifund-light-accent font-medium">
                            {campaignData.milestones.length} milestones
                          </p>
                        </div>
                      </div>

                      {campaignData.proposalLink && (
                        <div>
                          <label className="text-verifund-neutral-gray text-sm">Proposal Link</label>
                          <p className="text-verifund-light-accent">{campaignData.proposalLink}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-verifund-light-accent mb-3">Milestones Summary</h4>
                    <div className="space-y-2">
                      {campaignData.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex justify-between items-center p-3 bg-verifund-secondary-dark/30 rounded-lg">
                          <div>
                            <p className="text-verifund-light-accent font-medium">{milestone.title}</p>
                            <p className="text-verifund-neutral-gray text-sm">{milestone.description}</p>
                          </div>
                          <span className="text-verifund-light-accent font-medium">
                            ${milestone.amount.toLocaleString()} STX
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!isStepValid()}
                className="btn-primary"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="btn-primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
