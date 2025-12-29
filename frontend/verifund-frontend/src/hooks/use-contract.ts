import { useCallback } from 'react';
import { request } from '@stacks/connect';
import {
    fetchCallReadOnlyFunction,
    type ClarityValue,
    Cl
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import type {
    Campaign,
    Milestone,
    CreateCampaignParams,
    FundCampaignParams,
    ApproveMilestoneParams,
    WithdrawMilestoneParams,
    StartMilestoneVotingParams,
    GetCampaignMilestoneParams,
    GetMilestoneVotesParams,
    GetFunderContributionParams,
    GetFunderVoteParams,
    CampaignProgress,
    MilestoneApprovals,
    FunderVote,
    ContractCallResponse,
    ContractReadResponse
} from '@/types/contract';
import {
    createCampaignToClarity,
    parseCampaignFromContract,
    parseMilestoneFromContract,
    parseCampaignProgress,
    parseMilestoneApprovals,
    parseFunderVote,
    parseContractError,
    stxToMicroStx
} from '@/lib/contract-utils';

interface CallContractParams {
    functionName: string;
    functionArgs?: ClarityValue[];
    postConditions?: any[];
}

// Updated contract details - using the devnet deployment
const contractAddress = 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX';
const contractName = 'verif1';
const contract = `${contractAddress}.${contractName}`;
const network = STACKS_TESTNET;

export function useContract() {
    // Generic contract call function
    const callContract = useCallback(
        async ({ functionName, functionArgs, postConditions }: CallContractParams): Promise<ContractCallResponse> => {
            try {
                const response = await request('stx_callContract', {
                    contract,
                    functionName,
                    functionArgs,
                    postConditions,
                    network: "testnet",
                    postConditionMode: postConditions ? "deny" : "allow"
                });

                return { txId: response.txid };
            } catch (error) {
                console.error('Contract call failed:', error);
                throw new Error(parseContractError(error));
            }
        },
        []
    );

    // Generic read-only contract function
    const readContract = useCallback(
        async (
            functionName: string,
            functionArgs: ClarityValue[] = [],
            senderAddress = 'ST2A2DJN1S6CPYDR5T00RBNNQKV6XZDKQDFJTYW1V'
        ): Promise<ContractReadResponse> => {
            try {
                const options = {
                    contractAddress,
                    contractName,
                    functionName,
                    functionArgs,
                    network,
                    senderAddress,
                };

                const result = await fetchCallReadOnlyFunction(options);
                return result as ContractReadResponse;
            } catch (error) {
                console.error('Contract read failed:', error);
                throw new Error(parseContractError(error));
            }
        },
        []
    );

    // Specific contract functions
    const createCampaign = useCallback(
        async (params: CreateCampaignParams): Promise<ContractCallResponse> => {
            const functionArgs = createCampaignToClarity(params);
            return callContract({
                functionName: 'create_campaign',
                functionArgs
            });
        },
        [callContract]
    );

    const fundCampaign = useCallback(
        async ({ campaign_id, amount }: FundCampaignParams): Promise<ContractCallResponse> => {
            const microStxAmount = stxToMicroStx(amount);
            return callContract({
                functionName: 'fund_campaign',
                functionArgs: [
                    Cl.uint(campaign_id),
                    Cl.uint(microStxAmount)
                ]
            });
        },
        [callContract]
    );

    const approveMilestone = useCallback(
        async ({ campaign_id, milestone_index, vote }: ApproveMilestoneParams): Promise<ContractCallResponse> => {
            return callContract({
                functionName: 'approve-milestone',
                functionArgs: [
                    Cl.uint(campaign_id),
                    Cl.uint(milestone_index),
                    Cl.stringAscii(vote)
                ]
            });
        },
        [callContract]
    );

    const withdrawMilestoneReward = useCallback(
        async ({ campaign_id, milestone_index }: WithdrawMilestoneParams): Promise<ContractCallResponse> => {
            return callContract({
                functionName: 'withdraw-milestone-reward',
                functionArgs: [
                    Cl.uint(campaign_id),
                    Cl.uint(milestone_index)
                ]
            });
        },
        [callContract]
    );

    const startMilestoneVoting = useCallback(
        async ({ campaign_id, milestone_index }: StartMilestoneVotingParams): Promise<ContractCallResponse> => {
            return callContract({
                functionName: 'start_milestone_voting',
                functionArgs: [
                    Cl.uint(campaign_id),
                    Cl.uint(milestone_index)
                ]
            });
        },
        [callContract]
    );

    const cancelCampaign = useCallback(
        async (campaign_id: number): Promise<ContractCallResponse> => {
            return callContract({
                functionName: 'cancel_campaign',
                functionArgs: [Cl.uint(campaign_id)]
            });
        },
        [callContract]
    );

    const requestRefund = useCallback(
        async (campaign_id: number): Promise<ContractCallResponse> => {
            return callContract({
                functionName: 'request_refund',
                functionArgs: [Cl.uint(campaign_id)]
            });
        },
        [callContract]
    );

    // Read-only functions
    const getCampaign = useCallback(
        async (campaign_id: number): Promise<Campaign> => {
            const result = await readContract('get_campaign', [Cl.uint(campaign_id)]);
            return parseCampaignFromContract(result);
        },
        [readContract]
    );

    const getCampaignMilestone = useCallback(
        async ({ campaign_id, milestone_index }: GetCampaignMilestoneParams): Promise<Milestone> => {
            const result = await readContract('get_campaign_milestone', [
                Cl.uint(campaign_id),
                Cl.uint(milestone_index)
            ]);
            return parseMilestoneFromContract(result.value);
        },
        [readContract]
    );

    const getCampaignFunders = useCallback(
        async (campaign_id: number): Promise<string[]> => {
            const result = await readContract('get_campaign_funders', [Cl.uint(campaign_id)]);
            return result.value || [];
        },
        [readContract]
    );

    const getMilestoneVotes = useCallback(
        async ({ campaign_id, milestone_index }: GetMilestoneVotesParams): Promise<MilestoneApprovals> => {
            const result = await readContract('get_milestone_votes', [
                Cl.uint(campaign_id),
                Cl.uint(milestone_index)
            ]);
            return parseMilestoneApprovals(result);
        },
        [readContract]
    );

    const getCampaignCount = useCallback(
        async (): Promise<number> => {
            const result = await readContract('get_campaign_count');
            return Number(result.value || 0);
        },
        [readContract]
    );

    const getFunderContribution = useCallback(
        async ({ campaign_id, funder }: GetFunderContributionParams): Promise<number> => {
            const result = await readContract('get_funder_contribution', [
                Cl.uint(campaign_id),
                Cl.principal(funder)
            ]);
            return Number(result.value);
        },
        [readContract]
    );

    const getFunderVote = useCallback(
        async ({ campaign_id, milestone_index, funder }: GetFunderVoteParams): Promise<FunderVote | null> => {
            const result = await readContract('get_funder_vote', [
                Cl.uint(campaign_id),
                Cl.uint(milestone_index),
                Cl.principal(funder)
            ]);
            return parseFunderVote(result);
        },
        [readContract]
    );

    const isMilestoneVotingExpired = useCallback(
        async (campaign_id: number, milestone_index: number): Promise<boolean> => {
            const result = await readContract('is_milestone_voting_expired', [
                Cl.uint(campaign_id),
                Cl.uint(milestone_index)
            ]);
            return Boolean(result.value);
        },
        [readContract]
    );

    const getCampaignProgress = useCallback(
        async (campaign_id: number): Promise<CampaignProgress> => {
            const result = await readContract('get_campaign_progress', [Cl.uint(campaign_id)]);
            return parseCampaignProgress(result);
        },
        [readContract]
    );

    return {
        // Generic functions
        callContract,
        readContract,

        // Write functions
        createCampaign,
        fundCampaign,
        approveMilestone,
        withdrawMilestoneReward,
        startMilestoneVoting,
        cancelCampaign,
        requestRefund,

        // Read functions
        getCampaign,
        getCampaignMilestone,
        getCampaignFunders,
        getMilestoneVotes,
        getCampaignCount,
        getFunderContribution,
        getFunderVote,
        isMilestoneVotingExpired,
        getCampaignProgress,
    };
}