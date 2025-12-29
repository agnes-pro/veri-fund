
// Re-export types from the contract types file for backwards compatibility
export type {
    Campaign as CampaignDetails,
    Milestone,
    CreateCampaignParams,
    CampaignStatus,
    MilestoneStatus,
    VoteType,
    CampaignProgress,
    MilestoneApprovals,
    FunderVote
} from '@/types/contract';

// Re-export utilities
export {
    formatStxAmount,
    calculateProgress,
    microStxToStx,
    stxToMicroStx,
    validateCampaignParams,
    parseContractError
} from '@/lib/contract-utils';