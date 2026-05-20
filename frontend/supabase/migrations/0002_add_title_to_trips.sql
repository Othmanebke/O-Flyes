-- Add missing title column to trips table
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS title text;
