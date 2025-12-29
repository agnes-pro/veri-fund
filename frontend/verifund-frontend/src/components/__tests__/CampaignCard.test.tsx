import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CampaignCard from '../CampaignCard';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="card-title" className={className}>{children}</h2>
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress" data-value={value} className={className}>
      Progress: {value}%
    </div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  Users: () => <span data-testid="users-icon">👥</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">✅</span>,
}));

const defaultProps = {
  id: '1',
  title: 'Test Campaign',
  description: 'This is a test campaign description',
  goal: 10000,
  raised: 5000,
  backers: 25,
  milestonesCount: 4,
  completedMilestones: 2,
  category: 'Technology',
  endDate: '2024-12-31',
  status: 'funding' as const,
};

function renderCampaignCard(props = {}) {
  return render(
    <BrowserRouter>
      <CampaignCard {...defaultProps} {...props} />
    </BrowserRouter>
  );
}

describe('CampaignCard', () => {
  it('should render campaign information correctly', () => {
    renderCampaignCard();

    expect(screen.getByTestId('card-title')).toHaveTextContent('Test Campaign');
    expect(screen.getByText('This is a test campaign description')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('should calculate and display progress percentage correctly', () => {
    renderCampaignCard();

    const progressElement = screen.getByTestId('progress');
    expect(progressElement).toHaveAttribute('data-value', '50');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should display funding amounts correctly', () => {
    renderCampaignCard();

    expect(screen.getByText('$5,000 STX')).toBeInTheDocument();
    expect(screen.getByText('of $10,000 STX')).toBeInTheDocument();
  });

  it('should display campaign stats correctly', () => {
    renderCampaignCard();

    expect(screen.getByText('25 backers')).toBeInTheDocument();
    expect(screen.getByText('2/4 milestones')).toBeInTheDocument();
    expect(screen.getByText('2024-12-31')).toBeInTheDocument();
  });

  it('should handle edge case with zero goal', () => {
    renderCampaignCard({ goal: 0, raised: 100 });

    const progressElement = screen.getByTestId('progress');
    expect(progressElement).toHaveAttribute('data-value', 'Infinity');
  });

  it('should handle edge case with progress over 100%', () => {
    renderCampaignCard({ goal: 1000, raised: 1500 });

    const progressElement = screen.getByTestId('progress');
    expect(progressElement).toHaveAttribute('data-value', '150');
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  describe('status badges', () => {
    it('should show funding status badge', () => {
      renderCampaignCard({ status: 'funding' });

      const badges = screen.getAllByTestId('badge');
      const statusBadge = badges.find(badge => badge.textContent === 'Funding');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('bg-blue-500/20', 'text-blue-600', 'border-blue-500/30');
    });

    it('should show completed status badge', () => {
      renderCampaignCard({ status: 'completed' });

      const badges = screen.getAllByTestId('badge');
      const statusBadge = badges.find(badge => badge.textContent === 'Completed');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('bg-green-500/20', 'text-green-600', 'border-green-500/30');
    });

    it('should show milestone voting status badge', () => {
      renderCampaignCard({ status: 'milestone-voting' });

      const badges = screen.getAllByTestId('badge');
      const statusBadge = badges.find(badge => badge.textContent === 'Voting');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('bg-orange-500/20', 'text-orange-600', 'border-orange-500/30');
    });
  });

  it('should render as a link to campaign details', () => {
    renderCampaignCard({ id: '123' });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/campaign/123');
  });

  it('should display icons for stats', () => {
    renderCampaignCard();

    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('should handle long descriptions gracefully', () => {
    const longDescription = 'This is a very long description that should be truncated and handled properly by the component to ensure good UI display';

    renderCampaignCard({ description: longDescription });

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should handle large numbers correctly', () => {
    renderCampaignCard({
      goal: 1000000,
      raised: 500000,
      backers: 1000
    });

    expect(screen.getByText('$500,000 STX')).toBeInTheDocument();
    expect(screen.getByText('of $1,000,000 STX')).toBeInTheDocument();
    expect(screen.getByText('1000 backers')).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    renderCampaignCard();

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('glass-card', 'hover:shadow-xl', 'transition-all', 'duration-300', 'h-full', 'group');
  });
});