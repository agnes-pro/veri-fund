import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HiroWalletProvider } from '@/lib/HiroWalletProvider';

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <HiroWalletProvider>
          {children}
        </HiroWalletProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock data helpers
export const mockCampaignData = {
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

export const mockMilestone = {
  name: 'Test Milestone',
  description: 'Test milestone description',
  amount: 2500,
  status: 'pending' as const,
  completion_date: null,
  votes_for: 0,
  votes_against: 0,
  vote_deadline: 0,
};

export const mockWalletData = {
  isWalletConnected: true,
  isWalletOpen: false,
  testnetAddress: 'ST1TESTADDRESS123',
  mainnetAddress: null,
  network: 'testnet' as const,
};

// Contract interaction mocks
export const createMockContractResponse = (data: any) => ({
  type: 'ok',
  value: data,
});

export const createMockContractError = (message: string) => ({
  type: 'error',
  value: { message },
});

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };