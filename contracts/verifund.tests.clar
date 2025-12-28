;; ============================================
;; VERIFUND RENDEZVOUS TESTS
;; Property-based and Invariant Testing
;; ============================================

(define-constant ERR_TEST_FAILED u999)

;; ============================================
;; PROPERTY-BASED TESTS
;; ============================================

;; Test 1: Campaign count is non-negative
(define-public (test-campaign-count-non-negative)
  (begin
    (asserts! (>= (get_campaign_count) u0) (err ERR_TEST_FAILED))
    (ok true)
  )
)

;; Test 2: Creating a campaign increases count
(define-public (test-create-increases-count (goal uint))
  (if (is-eq goal u0)
    (ok false)
    (let ((count-before (get_campaign_count)))
      (if (is-ok (create_campaign "T" "T" goal "Tech" (list {name: "M", description: "M", amount: goal}) none))
        (begin
          (asserts! (is-eq (get_campaign_count) (+ count-before u1)) (err ERR_TEST_FAILED))
          (ok true)
        )
        (err ERR_TEST_FAILED)
      )
    )
  )
)

;; Test 3: New campaigns have zero balance
(define-public (test-new-campaign-zero-balance (goal uint))
  (if (is-eq goal u0)
    (ok false)
    (let ((cid-result (create_campaign "Z" "Z" goal "T" (list {name: "M", description: "M", amount: goal}) none)))
      (if (is-ok cid-result)
        (let ((camp-result (get_campaign (unwrap-panic cid-result))))
          (if (is-ok camp-result)
            (begin
              (asserts! (is-eq (get balance (unwrap-panic camp-result)) u0) (err ERR_TEST_FAILED))
              (asserts! (is-eq (get amount_raised (unwrap-panic camp-result)) u0) (err ERR_TEST_FAILED))
              (ok true)
            )
            (err ERR_TEST_FAILED)
          )
        )
        (err ERR_TEST_FAILED)
      )
    )
  )
)

;; Test 4: Campaign status is "funding" initially
(define-public (test-new-campaign-funding-status (goal uint))
  (if (is-eq goal u0)
    (ok false)
    (let ((cid-result (create_campaign "S" "S" goal "T" (list {name: "M", description: "M", amount: goal}) none)))
      (if (is-ok cid-result)
        (let ((camp-result (get_campaign (unwrap-panic cid-result))))
          (if (is-ok camp-result)
            (begin
              (asserts! (is-eq (get status (unwrap-panic camp-result)) "funding") (err ERR_TEST_FAILED))
              (ok true)
            )
            (err ERR_TEST_FAILED)
          )
        )
        (err ERR_TEST_FAILED)
      )
    )
  )
)

;; Test 5: Campaign goal matches input
(define-public (test-campaign-goal-matches (goal uint))
  (if (is-eq goal u0)
    (ok false)
    (let ((cid-result (create_campaign "G" "G" goal "T" (list {name: "M", description: "M", amount: goal}) none)))
      (if (is-ok cid-result)
        (let ((camp-result (get_campaign (unwrap-panic cid-result))))
          (if (is-ok camp-result)
            (begin
              (asserts! (is-eq (get goal (unwrap-panic camp-result)) goal) (err ERR_TEST_FAILED))
              (ok true)
            )
            (err ERR_TEST_FAILED)
          )
        )
        (err ERR_TEST_FAILED)
      )
    )
  )
)

;; Test 6: Campaign owner is tx-sender
(define-public (test-campaign-owner-is-sender (goal uint))
  (if (is-eq goal u0)
    (ok false)
    (let ((cid-result (create_campaign "O" "O" goal "T" (list {name: "M", description: "M", amount: goal}) none)))
      (if (is-ok cid-result)
        (let ((camp-result (get_campaign (unwrap-panic cid-result))))
          (if (is-ok camp-result)
            (begin
              (asserts! (is-eq (get owner (unwrap-panic camp-result)) tx-sender) (err ERR_TEST_FAILED))
              (ok true)
            )
            (err ERR_TEST_FAILED)
          )
        )
        (err ERR_TEST_FAILED)
      )
    )
  )
)