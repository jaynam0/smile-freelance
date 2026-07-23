
-- 1. Restrict public read on profiles, job_posts, reviews to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Job posts are viewable by everyone" ON public.job_posts;
CREATE POLICY "Job posts viewable by authenticated" ON public.job_posts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews viewable by authenticated" ON public.reviews
  FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.job_posts FROM anon;
REVOKE SELECT ON public.reviews FROM anon;

-- 2. Bookings: restrict updates - immutable financial fields, status transitions via trigger
CREATE OR REPLACE FUNCTION public.enforce_booking_update()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  -- Immutable identity fields
  IF NEW.client_id <> OLD.client_id OR NEW.freelancer_id <> OLD.freelancer_id
     OR NEW.contract_type <> OLD.contract_type
     OR COALESCE(NEW.job_post_id::text,'') <> COALESCE(OLD.job_post_id::text,'') THEN
    RAISE EXCEPTION 'Cannot change booking parties or contract type';
  END IF;

  -- Price/rate immutable once accepted
  IF OLD.status IN ('accepted','completed','declined','cancelled') THEN
    IF COALESCE(NEW.price,-1) <> COALESCE(OLD.price,-1)
       OR COALESCE(NEW.hourly_rate,-1) <> COALESCE(OLD.hourly_rate,-1) THEN
      RAISE EXCEPTION 'Price/hourly_rate cannot be changed after booking is %', OLD.status;
    END IF;
  END IF;

  -- Status transition rules
  IF NEW.status <> OLD.status THEN
    IF OLD.status = 'pending' AND NEW.status IN ('accepted','declined') THEN
      IF auth.uid() <> NEW.freelancer_id THEN
        RAISE EXCEPTION 'Only the freelancer can accept or decline a pending booking';
      END IF;
    ELSIF OLD.status = 'accepted' AND NEW.status = 'completed' THEN
      IF auth.uid() NOT IN (NEW.client_id, NEW.freelancer_id) THEN
        RAISE EXCEPTION 'Only participants can complete a booking';
      END IF;
    ELSIF OLD.status IN ('pending','accepted') AND NEW.status = 'cancelled' THEN
      IF auth.uid() NOT IN (NEW.client_id, NEW.freelancer_id) THEN
        RAISE EXCEPTION 'Only participants can cancel a booking';
      END IF;
    ELSE
      RAISE EXCEPTION 'Invalid booking status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_booking_update_tg ON public.bookings;
CREATE TRIGGER enforce_booking_update_tg
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_update();

-- Add WITH CHECK to the existing update policy
DROP POLICY IF EXISTS "Participants can update bookings" ON public.bookings;
CREATE POLICY "Participants can update bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- 3. Milestones: only client can transition to funded/released
CREATE OR REPLACE FUNCTION public.enforce_milestone_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_client uuid;
  v_freelancer uuid;
BEGIN
  SELECT client_id, freelancer_id INTO v_client, v_freelancer
    FROM public.bookings WHERE id = NEW.booking_id;

  IF NEW.booking_id <> OLD.booking_id THEN
    RAISE EXCEPTION 'Cannot move milestone to a different booking';
  END IF;

  IF NEW.status <> OLD.status THEN
    IF NEW.status IN ('funded','released') THEN
      IF auth.uid() <> v_client THEN
        RAISE EXCEPTION 'Only the client can fund or release a milestone';
      END IF;
    ELSIF NEW.status = 'cancelled' THEN
      IF auth.uid() NOT IN (v_client, v_freelancer) THEN
        RAISE EXCEPTION 'Only participants can cancel a milestone';
      END IF;
    ELSIF NEW.status = 'pending' THEN
      RAISE EXCEPTION 'Cannot revert milestone to pending';
    END IF;
  END IF;

  -- Amount is immutable once funded/released
  IF OLD.status IN ('funded','released') AND NEW.amount <> OLD.amount THEN
    RAISE EXCEPTION 'Cannot change amount after milestone is %', OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_milestone_update_tg ON public.milestones;
CREATE TRIGGER enforce_milestone_update_tg
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.enforce_milestone_update();

-- Also restrict insert: only client can create milestones
DROP POLICY IF EXISTS "Participants can insert milestones" ON public.milestones;
CREATE POLICY "Clients can insert milestones" ON public.milestones
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id AND b.client_id = auth.uid())
  );

-- 4. Proposals: job owner can only change status; freelancer can edit their own pending proposal
CREATE OR REPLACE FUNCTION public.enforce_proposal_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT client_id INTO v_owner FROM public.job_posts WHERE id = NEW.job_post_id;

  IF NEW.job_post_id <> OLD.job_post_id OR NEW.freelancer_id <> OLD.freelancer_id THEN
    RAISE EXCEPTION 'Cannot change proposal identity';
  END IF;

  IF auth.uid() = v_owner AND auth.uid() <> OLD.freelancer_id THEN
    -- Job owner: only status may change
    IF NEW.bid_amount <> OLD.bid_amount
       OR NEW.cover_letter <> OLD.cover_letter
       OR COALESCE(NEW.estimated_days,-1) <> COALESCE(OLD.estimated_days,-1) THEN
      RAISE EXCEPTION 'Job owner can only change proposal status';
    END IF;
  ELSIF auth.uid() = OLD.freelancer_id THEN
    -- Freelancer can only edit while pending; cannot self-accept
    IF OLD.status <> 'pending' AND (
       NEW.bid_amount <> OLD.bid_amount
       OR NEW.cover_letter <> OLD.cover_letter
       OR COALESCE(NEW.estimated_days,-1) <> COALESCE(OLD.estimated_days,-1)
    ) THEN
      RAISE EXCEPTION 'Cannot edit proposal after it is %', OLD.status;
    END IF;
    IF NEW.status <> OLD.status AND NEW.status NOT IN ('withdrawn','pending') THEN
      RAISE EXCEPTION 'Freelancer can only withdraw their proposal';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_proposal_update_tg ON public.proposals;
CREATE TRIGGER enforce_proposal_update_tg
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.enforce_proposal_update();

-- 5. Revoke EXECUTE on SECURITY DEFINER functions from authenticated where inappropriate
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
