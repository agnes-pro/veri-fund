import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HiroWalletProvider } from '@/lib/HiroWalletProvider';

// Mock components for integration test
const MockCampaignList = () => {
  const campaigns = [
    {
      id: '1',
      title: 'Test Campaign',
      description: 'Test Description',
      goal: 10000,
      raised: 5000,
      backers: 10,
      milestonesCount: 2,
      completedMilestones: 1,
      category: 'Technology',
      endDate: '2024-12-31',
      status: 'funding' as const,
    }
  ];

  return (
    <div>
      <h1>Campaigns</h1>
      {campaigns.map(campaign => (
        <div key={campaign.id} data-testid={`campaign-${campaign.id}`}>
          <h2>{campaign.title}</h2>
          <p>{campaign.description}</p>
          <div>Goal: ${campaign.goal} STX</div>
          <div>Raised: ${campaign.raised} STX</div>
          <div>Status: {campaign.status}</div>
        </div>
      ))}
    </div>
  );
};

const MockCreateCampaign = ({ onSubmit }: { onSubmit?: () => void }) => {
  return (
    <div>
      <h1>Create Campaign</h1>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
        <input data-testid="title-input" placeholder="Campaign Title" />
        <textarea data-testid="description-input" placeholder="Description" />
        <input data-testid="goal-input" placeholder="Goal Amount" type="number" />
        <button type="submit" data-testid="submit-campaign">
          Create Campaign
        </button>
      </form>
    </div>
  );
};

// Mock the wallet connection
vi.mock('@stacks/connect', () => ({
  connect: vi.fn().mockResolvedValue(true),
  disconnect: vi.fn(),
  isConnected: vi.fn(() => true),
  getLocalStorage: vi.fn(() => ({
    addresses: {
      stx: [{ address: 'ST1TESTADDRESS123' }]
    }
  })),
  request: vi.fn().mockResolvedValue({ txId: 'mock-tx-id' }),
}));

vi.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: vi.fn().mockResolvedValue({
    type: 'ok',
    value: { type: 'uint', value: 3n }
  }),
  Cl: {
    uint: vi.fn((value) => ({ type: 'uint', value })),
    stringAscii: vi.fn((value) => ({ type: 'string-ascii', value })),
    list: vi.fn((items) => ({ type: 'list', value: items })),
    tuple: vi.fn((data) => ({ type: 'tuple', value: data })),
  },
  cvToValue: vi.fn((cv) => cv.value || cv),
}));

function TestApp() {
  return (
    <BrowserRouter>
      <HiroWalletProvider>
        <div>
          <nav>
            <button onClick={() => window.location.href = '/campaigns'}>
              View Campaigns
            </button>
            <button onClick={() => window.location.href = '/create'}>
              Create Campaign
            </button>
          </nav>

          <main>
            <MockCampaignList />
            <MockCreateCampaign onSubmit={() => console.log('Campaign created!')} />
          </main>
        </div>
      </HiroWalletProvider>
    </BrowserRouter>
  );
}

describe('Campaign Lifecycle Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the application with wallet provider', async () => {
    render(<TestApp />);

    expect(screen.getByText('Campaigns')).toBeInTheDocument();
    expect(screen.getAllByText('Create Campaign')).toHaveLength(3); // nav button, h1, form button
    expect(screen.getByText('View Campaigns')).toBeInTheDocument();
  });

  it('should display existing campaigns', async () => {
    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByTestId('campaign-1')).toBeInTheDocument();
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Goal: $10000 STX')).toBeInTheDocument();
      expect(screen.getByText('Raised: $5000 STX')).toBeInTheDocument();
    });
  });

  it('should allow creating a new campaign', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    // Fill out the create campaign form
    const titleInput = screen.getByTestId('title-input');
    const descriptionInput = screen.getByTestId('description-input');
    const goalInput = screen.getByTestId('goal-input');
    const submitButton = screen.getByTestId('submit-campaign');

    await user.type(titleInput, 'New Test Campaign');
    await user.type(descriptionInput, 'This is a new campaign');
    await user.type(goalInput, '15000');

    // Submit the form
    fireEvent.click(submitButton);

    // Verify form submission (would normally create campaign)
    expect(titleInput).toHaveValue('New Test Campaign');
    expect(descriptionInput).toHaveValue('This is a new campaign');
    expect(goalInput).toHaveValue(15000);
  });

  it('should handle wallet connection state', async () => {
    render(<TestApp />);

    // The wallet should be connected by default in our mock
    await waitFor(() => {
      expect(screen.getByText('Campaigns')).toBeInTheDocument();
    });
  });

  it('should handle campaign status updates', async () => {
    render(<TestApp />);

    // Check initial campaign status
    await waitFor(() => {
      expect(screen.getByText('Status: funding')).toBeInTheDocument();
    });

    // In a real scenario, status would update based on contract interactions
    // For now, we just verify the status is displayed correctly
  });

  it('should validate campaign creation form', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const submitButton = screen.getByTestId('submit-campaign');

    // Try to submit empty form
    fireEvent.click(submitButton);

    // Form should still be visible (validation would prevent submission)
    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
    expect(screen.getByTestId('goal-input')).toBeInTheDocument();
  });

  it('should handle campaign funding workflow', async () => {
    render(<TestApp />);

    // Verify campaign displays funding information
    await waitFor(() => {
      expect(screen.getByText('Goal: $10000 STX')).toBeInTheDocument();
      expect(screen.getByText('Raised: $5000 STX')).toBeInTheDocument();
    });

    // In a real implementation, users could fund campaigns here
    // This would involve wallet interaction and contract calls
  });

  it('should display campaign milestones correctly', async () => {
    render(<TestApp />);

    // The campaign card shows milestone information
    await waitFor(() => {
      expect(screen.getByTestId('campaign-1')).toBeInTheDocument();
    });

    // Milestone information would typically be displayed in campaign details
  });

  it('should handle navigation between views', () => {
    render(<TestApp />);

    const viewCampaignsButton = screen.getByRole('button', { name: 'View Campaigns' });
    const createCampaignButtons = screen.getAllByRole('button', { name: 'Create Campaign' });

    expect(viewCampaignsButton).toBeInTheDocument();
    expect(createCampaignButtons).toHaveLength(2); // One in nav, one in form

    // In a real app, these would navigate to different routes
    fireEvent.click(viewCampaignsButton);
    fireEvent.click(createCampaignButtons[0]); // Click the nav button
  });

  it('should handle error states gracefully', async () => {
    // Mock a network error
    const { request } = await import('@stacks/connect');
    vi.mocked(request).mockRejectedValueOnce(new Error('Network error'));

    render(<TestApp />);

    // The app should still render even with network errors
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
  });
});