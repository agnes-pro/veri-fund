
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