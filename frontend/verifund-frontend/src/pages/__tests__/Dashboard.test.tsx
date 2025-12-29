import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock Navbar component
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock CampaignCard component
vi.mock('@/components/CampaignCard', () => ({
  default: ({ id, title, description, status }: any) => (
    <div data-testid={`campaign-card-${id}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      <span data-status={status}>{status}</span>
    </div>
  ),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  PlusCircle: () => <span data-testid="plus-circle-icon">+</span>,
  Wallet: () => <span data-testid="wallet-icon">💰</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">📈</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">✅</span>,
  Clock: () => <span data-testid="clock-icon">⏰</span>,
}));

// Mock the contract hook with immediate resolution
const mockCampaigns = [
  {
    name: 'Decentralized Social Media Platform',
    description: 'Building a censorship-resistant social network',
    goal: 100000, // 100,000 STX
    amount_raised: 80000000, // 80 STX in microSTX
    status: 'funding',
    category: 'Technology',
    milestones: [{ status: 'completed' }, { status: 'pending' }]
  },
  {
    name: 'AI-Powered Learning Assistant',
    description: 'Personalized education through artificial intelligence',
    goal: 50000, // 50,000 STX
    amount_raised: 45000000, // 45 STX in microSTX
    status: 'milestone-voting',
    category: 'Technology',
    milestones: [{ status: 'completed' }, { status: 'voting' }]
  },
  {
    name: 'Sustainable Agriculture Initiative',
    description: 'Funding innovative farming techniques',
    goal: 30000, // 30,000 STX
    amount_raised: 30000000, // 30 STX in microSTX
    status: 'funding',
    category: 'Environment',
    milestones: [{ status: 'completed' }]
  },
  {
    name: 'Open Source Education Platform',
    description: 'Creating free educational resources',
    goal: 20000, // 20,000 STX
    amount_raised: 20000000, // 20 STX in microSTX
    status: 'completed',
    category: 'Education',
    milestones: [{ status: 'completed' }, { status: 'completed' }]
  }
];

vi.mock('@/hooks/use-contract', () => ({
  useContract: () => ({
    getCampaignCount: vi.fn(() => Promise.resolve(4)),
    getCampaign: vi.fn((id: number) => Promise.resolve(mockCampaigns[id] || mockCampaigns[0])),
    getCampaignFunders: vi.fn(() => Promise.resolve(['funder1', 'funder2'])),
    getCampaignProgress: vi.fn(() => Promise.resolve({
      progress_percentage: 80,
      amount_raised: 80000000, // 80 STX in microSTX
      goal: 100000, // 100,000 STX
      is_funded: false
    }))
  })
}));

// Mock contract utils
vi.mock('@/lib/contract-utils', () => ({
  microStxToStx: (value: number) => value / 1000000
}));

function renderDashboard() {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}

describe('Dashboard page functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user loads the dashboard', () => {
    it('should display the main dashboard heading and description', () => {
      renderDashboard();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Track your campaigns and contributions')).toBeInTheDocument();
    });

    it('should render the navigation bar', () => {
      renderDashboard();

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('should show create campaign button in header', () => {
      renderDashboard();

      const createButtons = screen.getAllByText('Create Campaign');
      expect(createButtons.length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('plus-circle-icon').length).toBeGreaterThan(0);
    });
  });

  describe('when displaying user statistics', () => {
    it('should show all five stat cards with correct values', async () => {
      renderDashboard();

      // Wait for async data loading
      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });

      expect(screen.getByText('Total Raised')).toBeInTheDocument();
      expect(screen.getByText('$175 STX')).toBeInTheDocument(); // 80+45+30+20 = 175 STX

      expect(screen.getByText('Total Backed')).toBeInTheDocument();
      expect(screen.getByText('$0 STX')).toBeInTheDocument(); // TODO: Calculate based on user's contributions

      expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // funding + milestone-voting count

      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // completed campaigns

      expect(screen.getByText('Backed Projects')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // TODO: Calculate based on user's backed campaigns
    }, 10000);

    it('should display appropriate icons for each statistic', () => {
      renderDashboard();

      expect(screen.getAllByTestId('trending-up-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('wallet-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('clock-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('check-circle-icon').length).toBeGreaterThan(0);
    });
  });

  describe('when viewing campaign tabs', () => {
    it('should render tabs with correct default value', () => {
      renderDashboard();

      expect(screen.getByTestId('tabs')).toHaveAttribute('data-default-value', 'created');
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });

    it('should show created campaigns tab with correct count', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });
      expect(screen.getByTestId('tab-trigger-created')).toHaveTextContent('Created Campaigns (4)');
    }, 10000);

    it('should show backed campaigns tab with correct count', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });
      expect(screen.getByTestId('tab-trigger-backed')).toHaveTextContent('Backed Campaigns (0)');
    }, 10000);

    it('should display created campaigns in the created tab', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });
      expect(screen.getByTestId('campaign-card-0')).toBeInTheDocument();
      expect(screen.getByText('Decentralized Social Media Platform')).toBeInTheDocument();
      expect(screen.getByText('Building a censorship-resistant social network')).toBeInTheDocument();

      expect(screen.getByTestId('campaign-card-1')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Learning Assistant')).toBeInTheDocument();
      expect(screen.getByText('Personalized education through artificial intelligence')).toBeInTheDocument();
    }, 10000);

    it('should show campaigns with correct status indicators', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });

      const fundingCampaign = screen.getByTestId('campaign-card-0');
      expect(fundingCampaign.querySelector('[data-status="funding"]')).toBeInTheDocument();

      const votingCampaign = screen.getByTestId('campaign-card-1');
      expect(votingCampaign.querySelector('[data-status="milestone-voting"]')).toBeInTheDocument();

      const completedCampaign = screen.getByTestId('campaign-card-3');
      expect(completedCampaign.querySelector('[data-status="completed"]')).toBeInTheDocument();
    }, 10000);
  });

  describe('when viewing recent activity section', () => {
    it('should display recent activity card with title', () => {
      renderDashboard();

      expect(screen.getByTestId('card-title')).toHaveTextContent('Recent Activity');
    });

    it('should show three recent activity items', () => {
      renderDashboard();

      expect(screen.getByText('Milestone approved for "AI-Powered Learning Assistant"')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();

      expect(screen.getByText('New backer joined "Decentralized Social Media Platform"')).toBeInTheDocument();
      expect(screen.getByText('5 hours ago')).toBeInTheDocument();

      expect(screen.getByText('Milestone voting started for "Sustainable Agriculture Initiative"')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
    });
  });

  describe('when user wants to create new campaign', () => {
    it('should have create campaign link in header', () => {
      renderDashboard();

      const headerCreateButton = screen.getAllByText('Create Campaign')[0];
      expect(headerCreateButton.closest('a')).toHaveAttribute('href', '/create');
    });

    it('should have new campaign button in created campaigns section', () => {
      renderDashboard();

      const newCampaignButton = screen.getByText('New Campaign');
      expect(newCampaignButton.closest('a')).toHaveAttribute('href', '/create');
    });
  });

  describe('when checking accessibility and usability', () => {
    it('should have proper semantic structure with headings', async () => {
      renderDashboard();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });
      expect(screen.getByText('Your Campaigns')).toBeInTheDocument();
      expect(screen.getByText("Campaigns You've Backed")).toBeInTheDocument();
    }, 10000);

    it('should format currency values correctly', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });
      // Check that numbers are formatted correctly
      expect(screen.getByText('$175 STX')).toBeInTheDocument();
      expect(screen.getByText('$0 STX')).toBeInTheDocument();
    }, 10000);

    it('should display campaign counts in tab labels', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });
      // Verify that tab labels include the count of campaigns
      expect(screen.getByText(/Created Campaigns \(4\)/)).toBeInTheDocument();
      expect(screen.getByText(/Backed Campaigns \(0\)/)).toBeInTheDocument();
    }, 10000);
  });

  describe('when testing component responsiveness', () => {
    it('should apply responsive grid classes for statistics', () => {
      renderDashboard();

      const statsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-5');
      expect(statsContainer).toBeInTheDocument();
    });

    it('should apply responsive grid classes for campaigns', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Raised')).toBeInTheDocument();
      }, { timeout: 5000 });
      const campaignGrids = document.querySelectorAll('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(campaignGrids.length).toBeGreaterThan(0);
    }, 10000);
  });
});