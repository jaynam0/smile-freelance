-- Helper functions: run as invoker (no elevated privileges)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_booking_participant(_booking_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.bookings WHERE id = _booking_id AND (client_id = _user_id OR freelancer_id = _user_id))
$$;

-- Bookings: financial terms may only be set by the client while pending
DROP POLICY IF EXISTS "Participants can update bookings" ON public.bookings;
CREATE POLICY "Participants can update bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (auth.uid() = client_id OR auth.uid() = freelancer_id)
WITH CHECK (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Milestones: only the booking's client may set funded/released
DROP POLICY IF EXISTS "Participants can update milestones" ON public.milestones;
CREATE POLICY "Participants can update milestones"
ON public.milestones FOR UPDATE TO authenticated
USING (public.is_booking_participant(booking_id, auth.uid()))
WITH CHECK (
  public.is_booking_participant(booking_id, auth.uid())
  AND (
    status NOT IN ('funded','released')
    OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = milestones.booking_id AND b.client_id = auth.uid())
  )
);

-- Proposals: split freelancer edits from job-owner status decisions
DROP POLICY IF EXISTS "Freelancer or job owner can update proposal" ON public.proposals;

CREATE POLICY "Freelancers update their own proposal"
ON public.proposals FOR UPDATE TO authenticated
USING (auth.uid() = freelancer_id)
WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Job owner can decide on proposal"
ON public.proposals FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.job_posts j WHERE j.id = proposals.job_post_id AND j.client_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.job_posts j WHERE j.id = proposals.job_post_id AND j.client_id = auth.uid()));
