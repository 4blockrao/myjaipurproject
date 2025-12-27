-- Update Anubhav Singh Bassi event with correct image
UPDATE public.events 
SET cover_image = '/images/anubhav-singh-bassi-kisi-ko-batana-mat.jpg',
    updated_at = now()
WHERE slug = 'anubhav-singh-bassi-kisi-ko-batana-mat-jaipur';

-- Insert Zakir Khan Papa Yaar event for Jaipur
INSERT INTO public.events (
  title,
  slug,
  description,
  short_description,
  category,
  start_date,
  end_date,
  venue_name,
  venue_address,
  city,
  locality,
  cover_image,
  ticket_price,
  is_free,
  is_featured,
  status,
  organizer_name,
  tags,
  meta_title,
  meta_description
) VALUES (
  'Papa Yaar by Zakir Khan',
  'papa-yaar-zakir-khan-jaipur-2026',
  'Step into the world of laughter, love, and nostalgia with Zakir Khan''s brand-new show, Papa Yaar. Through anecdotes packed with wit, emotion, and his signature poetic flair, Zakir brings to life the most relatable yet unsaid aspects of every Indian son''s relationship with his father.

Papa Yaar isn''t just a comedy show; it''s a celebration of fatherhood and the universal experiences that tie us all together. And this time, it''s more than just a performance—it''s an invitation to share the laughs and love with your own Papa.

So bring your Papa along and let Zakir''s stories remind you of all the reasons why your bond is special. Trust us, it''s a show both of you will cherish forever.',
  'Zakir Khan''s brand-new stand-up show celebrating the father-son bond with wit, emotion, and poetic flair.',
  'Comedy',
  '2026-01-15 19:00:00+05:30',
  '2026-01-15 21:30:00+05:30',
  'Birla Auditorium',
  'Statue Circle, C Scheme, Jaipur',
  'Jaipur',
  'C Scheme',
  '/images/zakir-khan-papa-yaar.jpg',
  1499,
  false,
  true,
  'published',
  'TribeVibe',
  ARRAY['comedy', 'standup', 'zakir-khan', 'papa-yaar', 'hindi-comedy', 'live-show'],
  'Papa Yaar by Zakir Khan in Jaipur - Live Stand-up Comedy Show 2026',
  'Book tickets for Zakir Khan''s Papa Yaar comedy show in Jaipur. A heartwarming celebration of fatherhood with wit and emotion. January 2026 at Birla Auditorium.'
) ON CONFLICT (slug) DO UPDATE SET
  cover_image = EXCLUDED.cover_image,
  updated_at = now();