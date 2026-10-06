-- ============================================================
-- VICEVERSE - OPERATIONS DASHBOARD
-- Team Member: Biddappa
-- ============================================================

-- Overall operations summary
CREATE OR REPLACE VIEW public.operations_summary
WITH (security_invoker = true)
AS
SELECT
    -- Total approved teams
    (
        SELECT COUNT(*)
        FROM public.teams
        WHERE payment_status = 'approved'
    ) AS total_teams,

    -- Total members in approved teams
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
    ) AS total_members,

    -- Registration
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
          AND m.registration_status = TRUE
    ) AS registered,

    -- Goodies
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
          AND m.goodies_status = TRUE
    ) AS goodies,

    -- Lunch
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
          AND m.lunch_status = TRUE
    ) AS lunch,

    -- Snacks
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
          AND m.snacks_status = TRUE
    ) AS snacks,

    -- Pending registration
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
          AND m.registration_status = FALSE
    ) AS pending_registration,

    -- Pending goodies
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
          AND m.goodies_status = FALSE
    ) AS pending_goodies,

    -- Pending lunch
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
          AND m.lunch_status = FALSE
    ) AS pending_lunch,

    -- Pending snacks
    (
        SELECT COUNT(*)
        FROM public.members m
        INNER JOIN public.teams t
            ON m.team_id = t.id
        WHERE t.payment_status = 'approved'
          AND m.snacks_status = FALSE
    ) AS pending_snacks;


-- ============================================================
-- PENDING MEMBER ACTIVITIES
-- Shows exactly what is still pending for each member
-- ============================================================

CREATE OR REPLACE VIEW public.pending_operations
WITH (security_invoker = true)
AS
SELECT
    t.team_id,
    t.team_name,
    m.id AS member_id,
    m.name AS member_name,

    m.registration_status,
    m.goodies_status,
    m.lunch_status,
    m.snacks_status

FROM public.members m
INNER JOIN public.teams t
    ON m.team_id = t.id

WHERE t.payment_status = 'approved'
  AND (
        m.registration_status = FALSE
        OR m.goodies_status = FALSE
        OR m.lunch_status = FALSE
        OR m.snacks_status = FALSE
      );


-- ============================================================
-- RECENT OPERATIONS / AUDIT INFORMATION
-- ============================================================

CREATE OR REPLACE VIEW public.operations_audit
WITH (security_invoker = true)
AS
SELECT
    a.id,
    a.performed_by_name,
    t.team_id,
    t.team_name,
    m.name AS member_name,
    a.activity,
    a.action,
    a.timestamp

FROM public.audit_logs a

LEFT JOIN public.teams t
    ON a.team_id = t.id

LEFT JOIN public.members m
    ON a.member_id = m.id

ORDER BY a.timestamp DESC;