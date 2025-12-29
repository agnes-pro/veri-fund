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
  default: ({ id, title }: any) => (
    <div data-testid={`campaign-card-${id}`}>
      <h3>{title}</h3>
    </div>
  ),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: any) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: any) => <button data-testid="tab-trigger">{children}</button>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button data-testid="button">{children}</button>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  PlusCircle: () => <span>+</span>,
  Wallet: () => <span>💰</span>,
  TrendingUp: () => <span>📈</span>,
  CheckCircle: () => <span>✅</span>,
  Clock: () => <span>⏰</span>,
}));

// Mock contract utils
vi.mock('@/lib/contract-utils', () => ({
  microStxToStx: (value: number) => value / 1000000
}));

// Mock the contract hook to return resolved data
vi.mock('@/hooks/use-contract', () => ({
  useContract: () => ({
    getCampaignCount: vi.fn().mockResolvedValue(2),
    getCampaign: vi.fn().mockImplementation((id: number) => {
      const campaigns = [
        {
          name: 'Test Campaign 1',
          description: 'Test Description 1',
          goal: 100000, // 100,000 STX
          amount_raised: 50000000, // 50 STX in microSTX
          status: 'funding',
          category: 'Technology',
          milestones: [{ status: 'completed' }]
        },
        {
          name: 'Test Campaign 2',
          description: 'Test Description 2',
          goal: 200000, // 200,000 STX
          amount_raised: 200000000, // 200 STX in microSTX
          status: 'completed',
          category: 'Education',
          milestones: [{ status: 'completed' }, { status: 'completed' }]
        }
      ];
      return Promise.resolve(campaigns[id] || campaigns[0]);
    }),
    getCampaignFunders: vi.fn().mockResolvedValue(['funder1']),
    getCampaignProgress: vi.fn().mockResolvedValue({
      progress_percentage: 50,
      amount_raised: 50000000, // 50 STX in microSTX
      goal: 100000, // 100,000 STX
      is_funded: false
    })
  })
}));

function renderDashboard() {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dashboard component without crashing', () => {
    renderDashboard();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    renderDashboard();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should eventually load and display content after blockchain calls resolve', async () => {
    renderDashboard();

    // Should start with loading
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

    // Wait for async operations to complete
    await waitFor(() => {
      // Once loaded, should show the main content and no longer show loading
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Should show dashboard content
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  }, 10000);

  it('should call contract functions when loading', async () => {
    const { useContract } = await import('@/hooks/use-contract');
    const mockHook = useContract();

    renderDashboard();

    // Wait a bit for useEffect to trigger
    await waitFor(() => {
      expect(mockHook.getCampaignCount).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});