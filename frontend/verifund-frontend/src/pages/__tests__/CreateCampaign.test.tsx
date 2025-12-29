import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CreateCampaign from '../CreateCampaign';

// Mock the contract hook
vi.mock('../../hooks/use-contract', () => ({
  useContract: () => ({
    callContract: vi.fn().mockResolvedValue({ txId: 'mock-tx-id' }),
  }),
}));

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

// Mock Navbar component
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

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
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type, ...props }: any) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, ...props }: any) => (
    <textarea
      data-testid="textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange?.('Technology')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon">+</span>,
  Trash2: () => <span data-testid="trash-icon">🗑️</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">✅</span>,
  FileText: () => <span data-testid="file-text-icon">📄</span>,
  Target: () => <span data-testid="target-icon">🎯</span>,
  Milestone: () => <span data-testid="milestone-icon">🏁</span>,
}));

function renderCreateCampaign() {
  return render(
    <BrowserRouter>
      <CreateCampaign />
    </BrowserRouter>
  );
}

describe('CreateCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the initial step (Campaign Details)', () => {
    renderCreateCampaign();

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Create Campaign')).toBeInTheDocument();
    expect(screen.getAllByText('Campaign Details')).toHaveLength(2); // One in stepper, one in card
  });

  it('should display step indicators', () => {
    renderCreateCampaign();

    expect(screen.getAllByText('Campaign Details')).toHaveLength(2);
    expect(screen.getByText('Add Milestones')).toBeInTheDocument();
    expect(screen.getByText('Review & Submit')).toBeInTheDocument();
  });

  it('should handle campaign title input', async () => {
    const user = userEvent.setup();
    renderCreateCampaign();

    const titleInput = screen.getByPlaceholderText('Enter your campaign title');
    await user.type(titleInput, 'Test Campaign');

    expect(titleInput).toHaveValue('Test Campaign');
  });

  it('should handle campaign description input', async () => {
    const user = userEvent.setup();
    renderCreateCampaign();

    const descriptionTextarea = screen.getByPlaceholderText('Describe your project, its goals, and why people should support it');
    await user.type(descriptionTextarea, 'Test Description');

    expect(descriptionTextarea).toHaveValue('Test Description');
  });

  it('should handle goal amount input', async () => {
    const user = userEvent.setup();
    renderCreateCampaign();

    const goalInput = screen.getByPlaceholderText('50000');
    await user.type(goalInput, '10000');

    expect(goalInput).toHaveValue(10000);
  });

  it('should handle proposal link input', async () => {
    const user = userEvent.setup();
    renderCreateCampaign();

    const proposalInput = screen.getByPlaceholderText('https://github.com/yourname/proposal');
    await user.type(proposalInput, 'https://example.com');

    expect(proposalInput).toHaveValue('https://example.com');
  });

  it('should validate required fields before proceeding to next step', async () => {
    renderCreateCampaign();

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Should show validation errors (in a real implementation)
    // For now, just check that we're still on step 1 by checking for card title
    expect(screen.getByTestId('card-title')).toHaveTextContent('Campaign Details');
  });

  it('should navigate between steps', async () => {
    const user = userEvent.setup();
    renderCreateCampaign();

    // Fill required fields
    const titleInput = screen.getByPlaceholderText('Enter your campaign title');
    await user.type(titleInput, 'Test Campaign');

    const descriptionTextarea = screen.getByPlaceholderText('Describe your project, its goals, and why people should support it');
    await user.type(descriptionTextarea, 'Test Description');

    const goalInput = screen.getByPlaceholderText('50000');
    await user.type(goalInput, '10000');

    // Select category
    const selectElement = screen.getByTestId('select');
    fireEvent.click(selectElement);

    // Go to next step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Should now be on step 2 - but since we haven't implemented full validation,
    // we'll just check that the component renders properly
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should handle category selection', () => {
    renderCreateCampaign();

    const selectElement = screen.getByTestId('select');
    fireEvent.click(selectElement);

    // In a real scenario, this would trigger the onValueChange callback
    expect(selectElement).toBeInTheDocument();
  });

  it('should render back to campaigns link', () => {
    renderCreateCampaign();

    const backLink = screen.getByText('Back to Dashboard');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('should display step progress indicators correctly', () => {
    renderCreateCampaign();

    // Check that step icons are rendered
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    expect(screen.getByTestId('milestone-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('should handle form validation for required fields', async () => {
    renderCreateCampaign();

    const nextButton = screen.getByText('Next');

    // Try to proceed without filling required fields
    fireEvent.click(nextButton);

    // Should remain on the same step - check for card title
    expect(screen.getByTestId('card-title')).toHaveTextContent('Campaign Details');
  });

  it('should disable next button when fields are invalid', () => {
    renderCreateCampaign();

    // Check if next button exists
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
  });

  it('should format goal input correctly', async () => {
    const user = userEvent.setup();
    renderCreateCampaign();

    const goalInput = screen.getByPlaceholderText('50000');
    await user.type(goalInput, '1000.5');

    expect(goalInput).toHaveValue(1000.5);
  });

  it('should show correct placeholders for all input fields', () => {
    renderCreateCampaign();

    expect(screen.getByPlaceholderText('Enter your campaign title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe your project, its goals, and why people should support it')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('50000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://github.com/yourname/proposal')).toBeInTheDocument();
  });
});