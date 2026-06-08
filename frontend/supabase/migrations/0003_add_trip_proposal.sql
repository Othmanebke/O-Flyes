-- Store generated multi-agent trip proposals so users don't have to regenerate them
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS proposal_json jsonb;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS proposal_generated_at timestamptz;
