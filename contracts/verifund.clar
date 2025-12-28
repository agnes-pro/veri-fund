
;; title: VeriFund
;; version: 1.0.0
;; summary: VeriFund is a decentralized crowdfunding platform built on the Stacks blockchain, designed to make fundraising transparent, trackable, and truly accountable.
;; description:

;; traits
;;

;; token definitions
;;

;; constants
(define-constant ERR-CAMPAIGN-NOT-FOUND u0)
(define-constant ERR-MILESTONE-DOES-NOT-EXIST u1)
(define-constant ERR-MILESTONE-ALREADY-COMPLETED u2)
(define-constant ERR-MILESTONE-ALREADY-APPROVED u3)
(define-constant ERR-NOT-A-FUNDER u4)
(define-constant ERR-NOT-OWNER u5)
(define-constant ERR-CANNOT-ADD-FUNDER u6)
(define-constant ERR-NOT-ENOUGH-APPROVALS u7)
(define-constant ERR-MILESTONE-ALREADY-CLAIMED u8)
(define-constant ERR-INSUFFICIENT-BALANCE u9)
(define-constant ERR-CAMPAIGN-EXPIRED u10)
(define-constant ERR-ALREADY-VOTED u11)
(define-constant ERR-VOTE-DEADLINE-PASSED u12)
(define-constant ERR-MILESTONE-NOT-IN-VOTING u13)
(define-constant ERR-CAMPAIGN-NOT-ACTIVE u14)
(define-constant ERR-REFUND-NOT-AVAILABLE u16)
(define-constant ERR-INVALID-VOTE u17)
;;


;; data vars
(define-data-var campaign_count uint u0)
(define-constant VOTING_PERIOD_BLOCKS u2160) ;; 15 days * 24 hours * 6 blocks/hour = 2160 blocks
;;

;; data maps
(define-map campaigns uint {
    name: (string-ascii 100),
    description: (string-ascii 500),
    goal: uint,
    amount_raised: uint,
    balance: uint,
    owner: principal,
    status: (string-ascii 20),
    category: (string-ascii 50),
    created_at: uint,
    milestones: (list 10 {
        name: (string-ascii 100),
        description: (string-ascii 500),
        amount: uint,
        status: (string-ascii 20),
        completion_date: (optional uint),
        votes_for: uint,
        votes_against: uint,
        vote_deadline: uint
        }),
    proposal_link: (optional (string-ascii 200)),
    })

    (define-map funders {campaign_id: uint, funder: principal} uint)
(define-map funders_by_campaign uint (list 50 principal))
(define-map milestone_approvals {campaign_id: uint, milestone_index: uint} {approvals: uint, voters: (list 50 principal)})
(define-map funder_votes {campaign_id: uint, milestone_index: uint, funder: principal} {vote: (string-ascii 10), timestamp: uint})
;;

;; private functions
;;

;; Data vars for milestone updates
(define-data-var milestone_update_index uint u0)
(define-data-var milestone_target_index uint u0)
(define-data-var milestone_new_milestone {name: (string-ascii 100), description: (string-ascii 500), amount: uint, status: (string-ascii 20), completion_date: (optional uint), votes_for: uint, votes_against: uint, vote_deadline: uint} {name: "", description: "", amount: u0, status: "", completion_date: none, votes_for: u0, votes_against: u0, vote_deadline: u0})

(define-private (add-milestone-defaults (milestone {name: (string-ascii 100), description: (string-ascii 500), amount: uint}))
    {
        name: (get name milestone),
        description: (get description milestone),
        amount: (get amount milestone),
        status: "pending",
        completion_date: none,
        votes_for: u0,
        votes_against: u0,
        vote_deadline: u0
    }
)

(define-private (update-milestone-helper
    (milestone {name: (string-ascii 100), description: (string-ascii 500), amount: uint, status: (string-ascii 20), completion_date: (optional uint), votes_for: uint, votes_against: uint, vote_deadline: uint})
)
    (let (
        (target_index (var-get milestone_target_index))
        (current_index (var-get milestone_update_index))
        (new_milestone (var-get milestone_new_milestone))
    )
        (var-set milestone_update_index (+ current_index u1))
        (if (is-eq current_index target_index)
            new_milestone
            milestone
        )
    )
)

(define-private (update-milestone-at-index
    (milestones (list 10 {name: (string-ascii 100), description: (string-ascii 500), amount: uint, status: (string-ascii 20), completion_date: (optional uint), votes_for: uint, votes_against: uint, vote_deadline: uint}))
    (target_index uint)
    (new_milestone {name: (string-ascii 100), description: (string-ascii 500), amount: uint, status: (string-ascii 20), completion_date: (optional uint), votes_for: uint, votes_against: uint, vote_deadline: uint})
)
    (begin
        (var-set milestone_update_index u0)
        (var-set milestone_target_index target_index)
        (var-set milestone_new_milestone new_milestone)
        (map update-milestone-helper milestones)
    )
)

(define-private (count-completed-helper
    (milestone {name: (string-ascii 100), description: (string-ascii 500), amount: uint, status: (string-ascii 20), completion_date: (optional uint), votes_for: uint, votes_against: uint, vote_deadline: uint})
    (count uint)
)
    (if (is-eq (get status milestone) "completed")
        (+ count u1)
        count
    )
)

(define-private (count-completed-milestones
    (milestones (list 10 {name: (string-ascii 100), description: (string-ascii 500), amount: uint, status: (string-ascii 20), completion_date: (optional uint), votes_for: uint, votes_against: uint, vote_deadline: uint}))
)
    (fold count-completed-helper milestones u0)
)

;; public functions
;;
(define-public (create_campaign 
    (name (string-ascii 100)) 
    (description (string-ascii 500)) 
    (goal uint) 
    (category (string-ascii 50))
    (milestones (list 10 {name: (string-ascii 100), description: (string-ascii 500), amount: uint})) 
    (proposal_link (optional (string-ascii 200))))
    (let ((campaign_id (var-get campaign_count)))
        (begin
            (map-set campaigns campaign_id {
                name: name,
                description: description,
                goal: goal,
                amount_raised: u0,
                balance: u0,
                owner: tx-sender,
                status: "funding",
                category: category,
                created_at: block-height,
                milestones: (map add-milestone-defaults milestones),
                proposal_link: proposal_link
            })
            (var-set campaign_count (+ campaign_id u1))
            (ok campaign_id)
        )
    )
)

(define-public (fund_campaign (campaign_id uint) (amount uint))
    (let (
        (campaign (unwrap! (map-get? campaigns campaign_id) (err ERR-CAMPAIGN-NOT-FOUND)))
        (campaign_status (get status campaign))
        (amount_raised (get amount_raised campaign))
        (balance (get balance campaign))
        (funded_amount (default-to u0 (map-get? funders {campaign_id: campaign_id, funder: tx-sender})))
        (campaign_funders (default-to (list ) (map-get? funders_by_campaign campaign_id)))
    )
    (asserts! (is-eq campaign_status "funding") (err ERR-CAMPAIGN-NOT-ACTIVE))
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (map-set funders {campaign_id: campaign_id, funder: tx-sender} (+ funded_amount amount))
        (if (is-none (index-of? campaign_funders tx-sender))
            (map-set funders_by_campaign campaign_id (unwrap! (as-max-len? (append campaign_funders tx-sender) u50) (err ERR-CANNOT-ADD-FUNDER)))
            true
        )
        (ok (map-set campaigns campaign_id (merge campaign {
            amount_raised: (+ amount_raised amount),
            balance: (+ balance amount)
        })))
    )
)

(define-public (approve-milestone (campaign_id uint) (milestone_index uint) (vote (string-ascii 10)))
    (let (
        (campaign (unwrap! (map-get? campaigns campaign_id) (err ERR-CAMPAIGN-NOT-FOUND)))
        (milestones (get milestones campaign))
        (milestone (unwrap! (element-at? milestones milestone_index) (err ERR-MILESTONE-DOES-NOT-EXIST)))
        (milestone_status (get status milestone))
        (vote_deadline (get vote_deadline milestone))
        (approvals (default-to {approvals: u0, voters: (list )} (map-get? milestone_approvals {campaign_id: campaign_id, milestone_index: milestone_index})))
        (campaign_funders (default-to (list ) (map-get? funders_by_campaign campaign_id)))
        (amount_funded (default-to u0 (map-get? funders {campaign_id: campaign_id, funder: tx-sender})))
        (voters (get voters approvals))
        (existing_vote (map-get? funder_votes {campaign_id: campaign_id, milestone_index: milestone_index, funder: tx-sender}))
    )   
        (asserts! (is-eq milestone_status "voting") (err ERR-MILESTONE-NOT-IN-VOTING))
        (asserts! (< block-height vote_deadline) (err ERR-VOTE-DEADLINE-PASSED))
        (asserts! (is-some (index-of? campaign_funders tx-sender)) (err ERR-NOT-A-FUNDER))
        (asserts! (is-none existing_vote) (err ERR-ALREADY-VOTED))
        (asserts! (or (is-eq vote "for") (is-eq vote "against")) (err ERR-INVALID-VOTE))
        
        ;; Record individual vote
        (map-set funder_votes {campaign_id: campaign_id, milestone_index: milestone_index, funder: tx-sender} {
            vote: vote,
            timestamp: block-height
        })

        ;; Update milestone votes and campaign
        (var-set milestone_target_index milestone_index)
        (let ((updated_milestones (update-milestone-at-index milestones milestone_index
            (if (is-eq vote "for")
                (merge milestone {votes_for: (+ (get votes_for milestone) amount_funded)})
                (merge milestone {votes_against: (+ (get votes_against milestone) amount_funded)})
            )
        )))
            (map-set campaigns campaign_id (merge campaign {milestones: updated_milestones}))
        )

        ;; Update approval tracking
        (map-set milestone_approvals {campaign_id: campaign_id, milestone_index: milestone_index} {
            approvals: (if (is-eq vote "for")
                (+ (get approvals approvals) amount_funded)
                (get approvals approvals)),
            voters: (unwrap! (as-max-len? (append voters tx-sender) u50) (err ERR-MILESTONE-ALREADY-APPROVED))
        })
        (ok true)
    )
)

(define-public (withdraw-milestone-reward (campaign_id uint) (milestone_index uint))
    (let (
        (campaign (unwrap! (map-get? campaigns campaign_id) (err ERR-CAMPAIGN-NOT-FOUND)))
        (milestones (get milestones campaign))
        (milestone (unwrap! (element-at? milestones milestone_index) (err ERR-MILESTONE-DOES-NOT-EXIST)))
        (milestone_status (get status milestone))
        (votes_for (get votes_for milestone))
        (votes_against (get votes_against milestone))
        (milestone_amount (get amount milestone))
        (balance (get balance campaign))
        (campaign_owner (get owner campaign))
        (amount_raised (get amount_raised campaign))
        (amount_to_withdraw (if (or (is-eq milestone_index (- (len milestones) u1)) (< balance milestone_amount)) balance milestone_amount))
        (total_votes (+ votes_for votes_against))
    )
        (asserts! (is-eq campaign_owner tx-sender) (err ERR-NOT-OWNER))
        (asserts! (is-eq milestone_status "voting") (err ERR-MILESTONE-NOT-IN-VOTING))
        (asserts! (> amount_to_withdraw u0) (err ERR-INSUFFICIENT-BALANCE))
        (asserts! (>= votes_for (/ amount_raised u2)) (err ERR-NOT-ENOUGH-APPROVALS))
        (asserts! (> votes_for votes_against) (err ERR-NOT-ENOUGH-APPROVALS))
        
        ;; Mark milestone as completed
        (var-set milestone_target_index milestone_index)
        (let (
            (completed_milestone {
                name: (get name milestone),
                description: (get description milestone),
                amount: (get amount milestone),
                status: "completed",
                completion_date: (some block-height),
                votes_for: votes_for,
                votes_against: votes_against,
                vote_deadline: (get vote_deadline milestone)
            })
            (updated_milestones (update-milestone-at-index milestones milestone_index completed_milestone))
            (completed_count (count-completed-milestones updated_milestones))
            (total_milestones (len milestones))
            (new_campaign_status (if (is-eq completed_count total_milestones) "completed" "funding"))
        )
            ;; Update campaign with completed milestone and new status
            (map-set campaigns campaign_id (merge campaign {
                milestones: updated_milestones,
                balance: (- balance amount_to_withdraw),
                status: new_campaign_status
            }))

            (try! (as-contract (stx-transfer? amount_to_withdraw tx-sender campaign_owner)))
            (ok true)
        )
    )
)