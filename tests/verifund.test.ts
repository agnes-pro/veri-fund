
import {
  Cl,
  cvToValue,
} from "@stacks/transactions";
import { beforeEach, describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;
const address4 = accounts.get("wallet_4")!;


/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk
*/

describe("verifund tests", () => {
  let campaignId: number;

  beforeEach(() => {
    const result = simnet.callPublicFn(
      "verifund",
      "create_campaign",
      [
        Cl.stringAscii("Feed-A-Child"),
        Cl.stringAscii("A campaign dedicated to providing meals to underprivileged children, ensuring they have access to nutritious food for a healthier future."),
        Cl.uint(100000),
        Cl.stringAscii("Education"),
        Cl.list([
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_1"),
            description: Cl.stringAscii("First milestone description"),
            amount: Cl.uint(20000),
          }),
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_2"),
            description: Cl.stringAscii("Second milestone description"),
            amount: Cl.uint(30000),
          }),
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_3"),
            description: Cl.stringAscii("Third milestone description"),
            amount: Cl.uint(50000),
          }),
        ]),
        Cl.none(),
      ],
      deployer
    );

    campaignId = parseInt((result.result as any).value.value);
    expect(result.result).toBeOk(Cl.uint(campaignId));

    const campaign = simnet.getMapEntry("verifund", "campaigns", Cl.uint(campaignId));
    expect(campaign).toBeSome(
      Cl.tuple({
        owner: Cl.principal(deployer),
        name: Cl.stringAscii("Feed-A-Child"),
        description: Cl.stringAscii(
          "A campaign dedicated to providing meals to underprivileged children, ensuring they have access to nutritious food for a healthier future."
        ),
        goal: Cl.uint(100000),
        amount_raised: Cl.uint(0),
        balance: Cl.uint(0),
        status: Cl.stringAscii("funding"),
        category: Cl.stringAscii("Education"),
        created_at: Cl.uint(simnet.blockHeight),
        proposal_link: Cl.none(),
        milestones: Cl.list([
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_1"),
            description: Cl.stringAscii("First milestone description"),
            amount: Cl.uint(20000),
            status: Cl.stringAscii("pending"),
            completion_date: Cl.none(),
            votes_for: Cl.uint(0),
            votes_against: Cl.uint(0),
            vote_deadline: Cl.uint(0)
          }),
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_2"),
            description: Cl.stringAscii("Second milestone description"),
            amount: Cl.uint(30000),
            status: Cl.stringAscii("pending"),
            completion_date: Cl.none(),
            votes_for: Cl.uint(0),
            votes_against: Cl.uint(0),
            vote_deadline: Cl.uint(0)
          }),
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_3"),
            description: Cl.stringAscii("Third milestone description"),
            amount: Cl.uint(50000),
            status: Cl.stringAscii("pending"),
            completion_date: Cl.none(),
            votes_for: Cl.uint(0),
            votes_against: Cl.uint(0),
            vote_deadline: Cl.uint(0)
          }),
        ]),
      })
    );
  });

  it("ensures simnet is well initalised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("should allow contributors to fund a campaign", () => {
    const fund = simnet.callPublicFn(
      "verifund",
      "fund_campaign",
      [Cl.uint(campaignId), Cl.uint(20000)],
      address2
    );

    expect(fund.events[0].event).toBe("stx_transfer_event");
    expect(fund.events[0].data.amount).toBe("20000");

    const campaign = simnet.getMapEntry("verifund", "campaigns", Cl.uint(campaignId));
    expect(campaign).toBeSome(
      Cl.tuple({
        owner: Cl.principal(deployer),
        name: Cl.stringAscii("Feed-A-Child"),
        description: Cl.stringAscii(
          "A campaign dedicated to providing meals to underprivileged children, ensuring they have access to nutritious food for a healthier future."
        ),
        goal: Cl.uint(100000),
        amount_raised: Cl.uint(20000),
        balance: Cl.uint(20000),
        status: Cl.stringAscii("funding"),
        category: Cl.stringAscii("Education"),
        created_at: Cl.uint(simnet.blockHeight - 1),
        proposal_link: Cl.none(),
        milestones: Cl.list([
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_1"),
            description: Cl.stringAscii("First milestone description"),
            amount: Cl.uint(20000),
            status: Cl.stringAscii("pending"),
            completion_date: Cl.none(),
            votes_for: Cl.uint(0),
            votes_against: Cl.uint(0),
            vote_deadline: Cl.uint(0)
          }),
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_2"),
            description: Cl.stringAscii("Second milestone description"),
            amount: Cl.uint(30000),
            status: Cl.stringAscii("pending"),
            completion_date: Cl.none(),
            votes_for: Cl.uint(0),
            votes_against: Cl.uint(0),
            vote_deadline: Cl.uint(0)
          }),
          Cl.tuple({
            name: Cl.stringAscii("MILESTONE_3"),
            description: Cl.stringAscii("Third milestone description"),
            amount: Cl.uint(50000),
            status: Cl.stringAscii("pending"),
            completion_date: Cl.none(),
            votes_for: Cl.uint(0),
            votes_against: Cl.uint(0),
            vote_deadline: Cl.uint(0)
          }),
        ]),
      })
    );
  });

  it("should not allow contributions to non-existent campaigns", () => {
    const result = simnet.callPublicFn(
      "verifund",
      "fund_campaign",
      [Cl.uint(999), Cl.uint(20000)], // Non-existent campaign ID
      address3
    );

    expect(result.result).toBeErr(Cl.uint(0));
  });

  it("should allow funders to approve milestones", () => {
    const fund = simnet.callPublicFn(
      "verifund",
      "fund_campaign",
      [Cl.uint(campaignId), Cl.uint(20000)],
      address2
    );

    expect(fund.events[0].event).toBe("stx_transfer_event");
    expect(fund.events[0].data.amount).toBe("20000");

    const startVoting = simnet.callPublicFn(
      "verifund",
      "start_milestone_voting",
      [Cl.uint(campaignId), Cl.uint(0)],
      deployer
    );

    expect(startVoting.result).toBeOk(Cl.bool(true));

    const approve = simnet.callPublicFn(
      "verifund",
      "approve-milestone",
      [Cl.uint(campaignId), Cl.uint(0), Cl.stringAscii("for")],
      address2
    );

    expect(approve.result).toBeOk(Cl.bool(true));

    const milestone = simnet.getMapEntry("verifund", "milestone_approvals", Cl.tuple({campaign_id: Cl.uint(campaignId), milestone_index: Cl.uint(0)}));
    expect(milestone).toBeSome(
      Cl.tuple({
        approvals: Cl.uint(20000),
        voters: Cl.list([Cl.principal(address2)])
      })
    );

    const vote = simnet.getMapEntry("verifund", "funder_votes", Cl.tuple({
      campaign_id: Cl.uint(campaignId),
      milestone_index: Cl.uint(0),
      funder: Cl.principal(address2)
    }));
    expect(vote).toBeSome(
      Cl.tuple({
        vote: Cl.stringAscii("for"),
        timestamp: Cl.uint(simnet.blockHeight)
      })
    );
  });

  it("should allow campaign owner to start milestone voting", () => {
    const startVoting = simnet.callPublicFn(
      "verifund",
      "start_milestone_voting",
      [Cl.uint(campaignId), Cl.uint(0)],
      deployer
    );

    expect(startVoting.result).toBeOk(Cl.bool(true));

    // Use the read-only function to get milestone data
    const milestone = simnet.callReadOnlyFn(
      "verifund",
      "get_campaign_milestone",
      [Cl.uint(campaignId), Cl.uint(0)],
      deployer
    );

    const milestoneData = cvToValue(milestone.result);
    expect(milestoneData.value.status.value).toBe("voting");
    expect(parseInt(milestoneData.value.vote_deadline.value)).toBeGreaterThan(0);
  });

  it("should allow funders to vote on milestones", () => {
    const fund = simnet.callPublicFn(
      "verifund",
      "fund_campaign",
      [Cl.uint(campaignId), Cl.uint(20000)],
      address2
    );

    expect(fund.events[0].event).toBe("stx_transfer_event");
    expect(fund.events[0].data.amount).toBe("20000");

    const startVoting = simnet.callPublicFn(
      "verifund",
      "start_milestone_voting",
      [Cl.uint(campaignId), Cl.uint(0)],
      deployer
    );

    expect(startVoting.result).toBeOk(Cl.bool(true));

    const approve = simnet.callPublicFn(
      "verifund",
      "approve-milestone",
      [Cl.uint(campaignId), Cl.uint(0), Cl.stringAscii("for")],
      address2
    );

    expect(approve.result).toBeOk(Cl.bool(true));

    const milestone = simnet.getMapEntry("verifund", "milestone_approvals", Cl.tuple({campaign_id: Cl.uint(campaignId), milestone_index: Cl.uint(0)}));
    expect(milestone).toBeSome(
      Cl.tuple({
        approvals: Cl.uint(20000),
        voters: Cl.list([Cl.principal(address2)])
      })
    );

    const vote = simnet.getMapEntry("verifund", "funder_votes", Cl.tuple({
      campaign_id: Cl.uint(campaignId),
      milestone_index: Cl.uint(0),
      funder: Cl.principal(address2)
    }));
    expect(vote).toBeSome(
      Cl.tuple({
        vote: Cl.stringAscii("for"),
        timestamp: Cl.uint(simnet.blockHeight)
      })
    );
  });

  it("should allow campaign owner to cancel campaign", () => {
    const cancel = simnet.callPublicFn(
      "verifund",
      "cancel_campaign",
      [Cl.uint(campaignId)],
      deployer
    );

    expect(cancel.result).toBeOk(Cl.bool(true));

    // Use the read-only function to get campaign data
    const campaign = simnet.callReadOnlyFn(
      "verifund",
      "get_campaign",
      [Cl.uint(campaignId)],
      deployer
    );

    const campaignData = cvToValue(campaign.result);
    expect(campaignData.value.status.value).toBe("cancelled");
  });