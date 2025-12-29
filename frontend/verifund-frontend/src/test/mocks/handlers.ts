// Mock Service Worker handlers for API mocking in tests
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Stacks API endpoints
  http.get('https://api.testnet.hiro.so/v2/info', () => {
    return HttpResponse.json({
      peer_version: 402653189,
      pox_consensus: 'bb8788cc6466c1e8a1dd8a6d01956611995c6bf8',
      burn_block_height: 2000000,
      stable_pox_consensus: 'bb8788cc6466c1e8a1dd8a6d01956611995c6bf8',
      server_version: 'stacks-node 2.5.0.0.0',
      network_id: 2147483648,
      parent_network_id: 118034699,
      stacks_tip_height: 150000,
      stacks_tip: 'abc123',
      stacks_tip_consensus_hash: 'def456',
      genesis_txt_hash: 'genesis123',
      unanchored_tip: null
    });
  }),

  // Mock contract call endpoints
  http.post('https://api.testnet.hiro.so/v2/contracts/call-read/:contractAddress/:contractName/:functionName', () => {
    return HttpResponse.json({
      okay: true,
      result: '0x0703',
      cause: null
    });
  }),

  // Mock transaction submission
  http.post('https://api.testnet.hiro.so/v2/transactions', () => {
    return HttpResponse.json({
      txid: '0x1234567890abcdef1234567890abcdef12345678',
      error: null
    });
  }),

  // Mock account info
  http.get('https://api.testnet.hiro.so/v2/accounts/:address', ({ params }) => {
    return HttpResponse.json({
      balance: '1000000000000',
      locked: '0',
      unlock_height: 0,
      nonce: 0,
      balance_proof: '',
      nonce_proof: ''
    });
  }),

  // Mock transaction status
  http.get('https://api.testnet.hiro.so/extended/v1/tx/:txId', () => {
    return HttpResponse.json({
      tx_id: '0x1234567890abcdef1234567890abcdef12345678',
      tx_status: 'success',
      tx_type: 'contract_call',
      fee_rate: '180',
      sender_address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      sponsored: false,
      post_condition_mode: 'allow',
      block_hash: '0xabcdef1234567890abcdef1234567890abcdef12',
      block_height: 150001,
      burn_block_time: 1640995200,
      burn_block_time_iso: '2022-01-01T00:00:00.000Z',
      canonical: true,
      microblock_canonical: true,
      microblock_sequence: 0,
      microblock_hash: '0x',
      parent_block_hash: '0xabcdef1234567890abcdef1234567890abcdef11',
      parent_burn_block_time: 1640995200,
      parent_burn_block_time_iso: '2022-01-01T00:00:00.000Z',
      tx_index: 0,
      tx_result: {
        hex: '0x0703',
        repr: '(ok u3)'
      },
      events: []
    });
  })
];

// Helper function to create mock campaign data
export const createMockCampaign = (id: number, overrides = {}) => ({
  name: `Test Campaign ${id}`,
  description: `Description for campaign ${id}`,
  goal: 1000000 * (id + 1), // Different goals for each campaign
  amount_raised: 500000 * id,
  balance: 500000 * id,
  owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  status: 'funding',
  category: 'Technology',
  created_at: 100000 + id,
  milestones: [
    {
      name: `Milestone 1 for Campaign ${id}`,
      description: `First milestone description for campaign ${id}`,
      amount: 250000 * (id + 1),
      status: 'pending',
      completion_date: null,
      votes_for: 0,
      votes_against: 0,
      vote_deadline: 0
    },
    {
      name: `Milestone 2 for Campaign ${id}`,
      description: `Second milestone description for campaign ${id}`,
      amount: 750000 * (id + 1),
      status: 'pending',
      completion_date: null,
      votes_for: 0,
      votes_against: 0,
      vote_deadline: 0
    }
  ],
  proposal_link: `https://example.com/campaign-${id}`,
  ...overrides
});

export default handlers;