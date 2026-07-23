
-- Enums
CREATE TYPE public.job_status AS ENUM ('open', 'closed', 'archived');
CREATE TYPE public.budget_type AS ENUM ('fixed', 'hourly');
CREATE TYPE public.proposal_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE public.milestone_status AS ENUM ('pending', 'funded', 'released', 'cancelled');
CREATE TYPE public.contract_type AS ENUM ('fixed', 'hourly');

-- Profile extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS resume_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text;

-- Booking extensions
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS contract_type public.contract_type NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS hourly_rate numeric,
  ADD COLUMN IF NOT EXISTS job_post_id uuid;

-- =================== JOB POSTS ===================
CREATE TABLE public.job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text,
  skills text[] DEFAULT '{}',
  budget_type public.budget_type NOT NULL DEFAULT 'fixed',
  budget_min numeric,
  budget_max numeric,
  status public.job_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.job_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_posts TO authenticated;
GRANT ALL ON public.job_posts TO service_role;

ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job posts are viewable by everyone"
  ON public.job_posts FOR SELECT USING (true);
CREATE POLICY "Clients can create their own job posts"
  ON public.job_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their own job posts"
  ON public.job_posts FOR UPDATE TO authenticated
  USING (auth.uid() = client_id);
CREATE POLICY "Clients can delete their own job posts"
  ON public.job_posts FOR DELETE TO authenticated
  USING (auth.uid() = client_id);

CREATE TRIGGER trg_job_posts_updated
  BEFORE UPDATE ON public.job_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =================== PROPOSALS ===================
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id uuid NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter text NOT NULL,
  bid_amount numeric NOT NULL,
  estimated_days integer,
  status public.proposal_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_post_id, freelancer_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancer or job owner can view proposal"
  ON public.proposals FOR SELECT TO authenticated
  USING (
    auth.uid() = freelancer_id
    OR EXISTS (SELECT 1 FROM public.job_posts j WHERE j.id = proposals.job_post_id AND j.client_id = auth.uid())
  );
CREATE POLICY "Freelancers submit their own proposals"
  ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "Freelancer or job owner can update proposal"
  ON public.proposals FOR UPDATE TO authenticated
  USING (
    auth.uid() = freelancer_id
    OR EXISTS (SELECT 1 FROM public.job_posts j WHERE j.id = proposals.job_post_id AND j.client_id = auth.uid())
  );

CREATE TRIGGER trg_proposals_updated
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =================== MILESTONES ===================
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount numeric NOT NULL,
  due_date date,
  order_index integer NOT NULL DEFAULT 0,
  status public.milestone_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones TO authenticated;
GRANT ALL ON public.milestones TO service_role;

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view milestones"
  ON public.milestones FOR SELECT TO authenticated
  USING (public.is_booking_participant(booking_id, auth.uid()));
CREATE POLICY "Participants can insert milestones"
  ON public.milestones FOR INSERT TO authenticated
  WITH CHECK (public.is_booking_participant(booking_id, auth.uid()));
CREATE POLICY "Participants can update milestones"
  ON public.milestones FOR UPDATE TO authenticated
  USING (public.is_booking_participant(booking_id, auth.uid()));
CREATE POLICY "Participants can delete milestones"
  ON public.milestones FOR DELETE TO authenticated
  USING (public.is_booking_participant(booking_id, auth.uid()));

CREATE TRIGGER trg_milestones_updated
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =================== TIME LOGS ===================
CREATE TABLE public.time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hours numeric NOT NULL CHECK (hours > 0),
  notes text,
  logged_for date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_logs TO authenticated;
GRANT ALL ON public.time_logs TO service_role;

ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view time logs"
  ON public.time_logs FOR SELECT TO authenticated
  USING (public.is_booking_participant(booking_id, auth.uid()));
CREATE POLICY "Freelancer on booking can log time"
  ON public.time_logs FOR INSERT TO authenticated
  WITH CHECK (
    freelancer_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = time_logs.booking_id AND b.freelancer_id = auth.uid())
  );
CREATE POLICY "Freelancer can delete own time logs"
  ON public.time_logs FOR DELETE TO authenticated
  USING (freelancer_id = auth.uid());

-- =================== SAVED FREELANCERS ===================
CREATE TABLE public.saved_freelancers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, freelancer_id)
);

GRANT SELECT, INSERT, DELETE ON public.saved_freelancers TO authenticated;
GRANT ALL ON public.saved_freelancers TO service_role;

ALTER TABLE public.saved_freelancers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their saved list"
  ON public.saved_freelancers FOR SELECT TO authenticated
  USING (auth.uid() = client_id);
CREATE POLICY "Clients can save freelancers"
  ON public.saved_freelancers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can unsave freelancers"
  ON public.saved_freelancers FOR DELETE TO authenticated
  USING (auth.uid() = client_id);

-- Indexes
CREATE INDEX idx_job_posts_client ON public.job_posts(client_id);
CREATE INDEX idx_job_posts_status ON public.job_posts(status);
CREATE INDEX idx_proposals_job ON public.proposals(job_post_id);
CREATE INDEX idx_proposals_freelancer ON public.proposals(freelancer_id);
CREATE INDEX idx_milestones_booking ON public.milestones(booking_id);
CREATE INDEX idx_time_logs_booking ON public.time_logs(booking_id);
CREATE INDEX idx_saved_client ON public.saved_freelancers(client_id);
