import { Cl, ClarityValue } from '@stacks/transactions';
import type {
  Campaign,
  Milestone,
  MilestoneInput,
  CreateCampaignParams,
  CampaignProgress,
  MilestoneApprovals,
  FunderVote,
  ContractReadResponse
} from '@/types/contract';

/**
 * Convert frontend milestone data to Clarity values for contract calls
 */
export function milestoneToClarity(milestone: MilestoneInput): ClarityValue {
  return Cl.tuple({
    name: Cl.stringAscii(milestone.name),
    description: Cl.stringAscii(milestone.description),
    amount: Cl.uint(milestone.amount)
  });
}

/**
 * Convert array of milestones to Clarity list
 */
export function milestonesToClarityList(milestones: MilestoneInput[]): ClarityValue {
  return Cl.list(milestones.map(milestoneToClarity));
}

/**
 * Convert campaign creation parameters to Clarity values
 */
export function createCampaignToClarity(params: CreateCampaignParams): ClarityValue[] {
  return [
    Cl.stringAscii(params.name),
    Cl.stringAscii(params.description),
    Cl.uint(params.goal),
    Cl.stringAscii(params.category),
    milestonesToClarityList(params.milestones),
    params.proposal_link ? Cl.some(Cl.stringAscii(params.proposal_link)) : Cl.none()
  ];
}

/**
 * Convert contract response to Campaign object
 */
export function parseCampaignFromContract(contractResponse: ContractReadResponse): Campaign {
  // The contract response is wrapped: {type: 'ok', value: {type: 'tuple', value: {...}}}
  const responseValue = contractResponse.value;

  // Get the actual tuple data
  const campaignTuple = responseValue.value;

  if (!campaignTuple || typeof campaignTuple !== 'object') {
    throw new Error('Invalid campaign data received from contract');
  }

  // Extract values from Clarity tuple format (each field has a .value property)
  const extractValue = (field: any) => {
    if (field && typeof field === 'object' && 'value' in field) {
      return field.value;
    }
    return field;
  };

  const name = extractValue(campaignTuple.name);
  const description = extractValue(campaignTuple.description);
  const goal = extractValue(campaignTuple.goal);
  const amount_raised = extractValue(campaignTuple.amount_raised);
  const balance = extractValue(campaignTuple.balance);
  const owner = extractValue(campaignTuple.owner);
  const status = extractValue(campaignTuple.status);
  const category = extractValue(campaignTuple.category);
  const created_at = extractValue(campaignTuple.created_at);
  const milestones = extractValue(campaignTuple.milestones);
  const proposal_link = extractValue(campaignTuple.proposal_link);


  return {
    name: name || 'Unknown Campaign',
    description: description || 'No description available',
    goal: Number(goal) || 0,
    amount_raised: Number(amount_raised) || 0,
    balance: Number(balance) || 0,
    owner: owner || '',
    status: status || 'unknown',
    category: category || 'Other',
    created_at: Number(created_at) || Date.now(),
    milestones: Array.isArray(milestones) ? milestones.map(parseMilestoneFromContract) : [],
    proposal_link: proposal_link || null
  };
}

/**
 * Convert contract milestone data to Milestone object
 */
export function parseMilestoneFromContract(milestoneData: any): Milestone {
  // The milestone data is wrapped: {type: 'tuple', value: {...}}
  const milestoneFields = milestoneData.value;

  // Extract values from Clarity tuple format (each field has a .value property)
  const extractValue = (field: any) => {
    if (field && typeof field === 'object' && 'value' in field) {
      return field.value;
    }
    return field;
  };

  const name = extractValue(milestoneFields.name);
  const description = extractValue(milestoneFields.description);
  const amount = extractValue(milestoneFields.amount);
  const status = extractValue(milestoneFields.status);
  const completion_date = extractValue(milestoneFields.completion_date);
  const votes_for = extractValue(milestoneFields.votes_for);
  const votes_against = extractValue(milestoneFields.votes_against);
  const vote_deadline = extractValue(milestoneFields.vote_deadline);


  return {
    name: name || 'Milestone',
    description: description || 'No description',
    amount: Number(amount) || 0,
    status: status || 'pending',
    completion_date: completion_date ? Number(completion_date) : null,
    votes_for: Number(votes_for) || 0,
    votes_against: Number(votes_against) || 0,
    vote_deadline: Number(vote_deadline) || 0
  };
}

/**
 * Parse campaign progress from contract response
 */
export function parseCampaignProgress(contractResponse: ContractReadResponse): CampaignProgress {
  // The contract response is wrapped: {type: 'ok', value: {type: 'tuple', value: {...}}}
  const progressData = contractResponse.value.value;

  // Extract values from Clarity tuple format (each field has a .value property)
  const extractValue = (field: any) => {
    if (field && typeof field === 'object' && 'value' in field) {
      return field.value;
    }
    return field;
  };

  return {
    progress_percentage: Number(extractValue(progressData.progress_percentage)) || 0,
    amount_raised: Number(extractValue(progressData.amount_raised)) || 0,
    goal: Number(extractValue(progressData.goal)) || 0,
    is_funded: Boolean(extractValue(progressData.is_funded)) || false
  };
}

/**
 * Parse milestone approvals from contract response
 */
export function parseMilestoneApprovals(contractResponse: ContractReadResponse): MilestoneApprovals {
  const approvalsData = contractResponse.value;

  return {
    approvals: Number(approvalsData.approvals),
    voters: approvalsData.voters || []
  };
}

/**
 * Parse funder vote from contract response
 */
export function parseFunderVote(contractResponse: ContractReadResponse): FunderVote | null {
  if (!contractResponse.value) return null;

  const voteData = contractResponse.value;

  return {
    vote: voteData.vote as any,
    timestamp: Number(voteData.timestamp)
  };
}

/**
 * Convert STX amount from microSTX to STX (dividing by 1,000,000)
 */
export function microStxToStx(microStx: number): number {
  return microStx / 1_000_000;
}

/**
 * Convert STX amount to microSTX (multiplying by 1,000,000)
 */
export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1_000_000);
}

/**
 * Format STX amount for display
 */
export function formatStxAmount(microStx: number): string {
  const stx = microStxToStx(microStx);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6
  }).format(stx);
}

/**
 * Calculate percentage progress
 */
export function calculateProgress(raised: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
}

/**
 * Check if milestone voting has expired
 */
export function isMilestoneVotingExpired(milestone: Milestone, currentBlockHeight: number): boolean {
  return milestone.status === 'voting' && currentBlockHeight >= milestone.vote_deadline;
}

/**
 * Calculate total milestone cost
 */
export function calculateTotalMilestoneCost(milestones: MilestoneInput[]): number {
  return milestones.reduce((total, milestone) => total + milestone.amount, 0);
}

/**
 * Validate milestone amounts against campaign goal
 */
export function validateMilestoneAmounts(milestones: MilestoneInput[], goal: number): boolean {
  const totalCost = calculateTotalMilestoneCost(milestones);
  return totalCost <= goal;
}

/**
 * Extract error message from contract error
 */
export function parseContractError(error: any): string {
  if (typeof error === 'string') return error;

  // Extract error code if it's a contract error
  if (error?.value !== undefined && typeof error.value === 'number') {
    const errorCode = error.value;

    const errorMessages: { [key: number]: string } = {
      0: 'Campaign not found',
      1: 'Milestone does not exist',
      2: 'Milestone already completed',
      3: 'Milestone already approved',
      4: 'Not a funder',
      5: 'Not the campaign owner',
      6: 'Cannot add funder',
      7: 'Not enough approvals',
      8: 'Milestone already claimed',
      9: 'Insufficient balance',
      10: 'Campaign expired',
      11: 'Already voted',
      12: 'Vote deadline passed',
      13: 'Milestone not in voting',
      14: 'Campaign not active',
      16: 'Refund not available',
      17: 'Invalid vote'
    };

    return errorMessages[errorCode] || `Contract error: ${errorCode}`;
  }

  return error?.message || 'Unknown contract error';
}

/**
 * Validate campaign creation parameters
 */
export function validateCampaignParams(params: CreateCampaignParams): string[] {
  const errors: string[] = [];

  if (!params.name || params.name.length === 0) {
    errors.push('Campaign name is required');
  } else if (params.name.length > 100) {
    errors.push('Campaign name must be 100 characters or less');
  }

  if (!params.description || params.description.length === 0) {
    errors.push('Campaign description is required');
  } else if (params.description.length > 500) {
    errors.push('Campaign description must be 500 characters or less');
  }

  if (!params.goal || params.goal <= 0) {
    errors.push('Campaign goal must be greater than 0');
  }

  if (!params.category || params.category.length === 0) {
    errors.push('Campaign category is required');
  } else if (params.category.length > 50) {
    errors.push('Campaign category must be 50 characters or less');
  }

  if (!params.milestones || params.milestones.length === 0) {
    errors.push('At least one milestone is required');
  } else if (params.milestones.length > 10) {
    errors.push('Maximum 10 milestones allowed');
  } else {
    // Validate individual milestones
    params.milestones.forEach((milestone, index) => {
      if (!milestone.name || milestone.name.length === 0) {
        errors.push(`Milestone ${index + 1} name is required`);
      } else if (milestone.name.length > 100) {
        errors.push(`Milestone ${index + 1} name must be 100 characters or less`);
      }

      if (!milestone.description || milestone.description.length === 0) {
        errors.push(`Milestone ${index + 1} description is required`);
      } else if (milestone.description.length > 500) {
        errors.push(`Milestone ${index + 1} description must be 500 characters or less`);
      }

      if (!milestone.amount || milestone.amount <= 0) {
        errors.push(`Milestone ${index + 1} amount must be greater than 0`);
      }
    });

    // Validate total milestone cost
    if (!validateMilestoneAmounts(params.milestones, params.goal)) {
      errors.push('Total milestone amounts cannot exceed campaign goal');
    }
  }

  if (params.proposal_link && params.proposal_link.length > 200) {
    errors.push('Proposal link must be 200 characters or less');
  }

  return errors;
}