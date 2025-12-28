
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