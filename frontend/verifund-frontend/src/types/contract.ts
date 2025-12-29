import type { ClarityValue } from '@stacks/transactions';

// Contract error constants matching the Clarity contract
export const CONTRACT_ERRORS = {
  ERR_CAMPAIGN_NOT_FOUND: 0,
  ERR_MILESTONE_DOES_NOT_EXIST: 1,
  ERR_MILESTONE_ALREADY_COMPLETED: 2,
  ERR_MILESTONE_ALREADY_APPROVED: 3,
  ERR_NOT_A_FUNDER: 4,
  ERR_NOT_OWNER: 5,
  ERR_CANNOT_ADD_FUNDER: 6,
  ERR_NOT_ENOUGH_APPROVALS: 7,
  ERR_MILESTONE_ALREADY_CLAIMED: 8,
  ERR_INSUFFICIENT_BALANCE: 9,
  ERR_CAMPAIGN_EXPIRED: 10,
  ERR_ALREADY_VOTED: 11,
  ERR_VOTE_DEADLINE_PASSED: 12,
  ERR_MILESTONE_NOT_IN_VOTING: 13,
  ERR_CAMPAIGN_NOT_ACTIVE: 14,
  ERR_REFUND_NOT_AVAILABLE: 16,
  ERR_INVALID_VOTE: 17,
} as const;

// Campaign status types
export type CampaignStatus = 'funding' | 'completed' | 'cancelled';

// Milestone status types
export type MilestoneStatus = 'pending' | 'voting' | 'completed';

// Vote types
export type VoteType = 'for' | 'against';

// Milestone input structure (for creating campaigns)
export interface MilestoneInput {
  name: string;
  description: string;
  amount: number;
}

// Full milestone structure (from contract)
export interface Milestone {
  name: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  completion_date: number | null;
  votes_for: number;
  votes_against: number;
  vote_deadline: number;
}

// Campaign structure matching the contract
export interface Campaign {
  name: string;
  description: string;
  goal: number;
  amount_raised: number;
  balance: number;
  owner: string;
  status: CampaignStatus;
  category: string;
  created_at: number;
  milestones: Milestone[];
  proposal_link: string | null;
}

// Campaign creation parameters
export interface CreateCampaignParams {
  name: string;
  description: string;
  goal: number;
  category: string;
  milestones: MilestoneInput[];
  proposal_link?: string;
}

// Campaign progress information
export interface CampaignProgress {
  progress_percentage: number;
  amount_raised: number;
  goal: number;
  is_funded: boolean;
}

// Milestone approval information
export interface MilestoneApprovals {
  approvals: number;
  voters: string[];
}

// Funder vote information
export interface FunderVote {
  vote: VoteType;
  timestamp: number;
}

// Contract function parameters
export interface FundCampaignParams {
  campaign_id: number;
  amount: number;
}

export interface ApproveMilestoneParams {
  campaign_id: number;
  milestone_index: number;
  vote: VoteType;
}

export interface WithdrawMilestoneParams {
  campaign_id: number;
  milestone_index: number;
}

export interface StartMilestoneVotingParams {
  campaign_id: number;
  milestone_index: number;
}

export interface GetCampaignMilestoneParams {
  campaign_id: number;
  milestone_index: number;
}

export interface GetMilestoneVotesParams {
  campaign_id: number;
  milestone_index: number;
}

export interface GetFunderContributionParams {
  campaign_id: number;
  funder: string;
}

export interface GetFunderVoteParams {
  campaign_id: number;
  milestone_index: number;
  funder: string;
}

// Contract response types
export interface ContractCallResponse {
  txId: string;
}

export interface ContractReadResponse<T = any> {
  type: string;
  value: T;
}

// Contract function call interface
export interface ContractCall {
  functionName: string;
  functionArgs?: ClarityValue[];
  postConditions?: any[];
}

// Network configuration
export interface NetworkConfig {
  coreApiUrl: string;
  networkId: string;
}

// Contract configuration
export interface ContractConfig {
  contractAddress: string;
  contractName: string;
  network: NetworkConfig;
}