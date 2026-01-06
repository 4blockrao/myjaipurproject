-- Add unique constraint on slug for car_models to enable UPSERT
ALTER TABLE public.car_models ADD CONSTRAINT car_models_slug_unique UNIQUE (slug);

-- Add unique constraint on slug for car_dealers to enable UPSERT
ALTER TABLE public.car_dealers ADD CONSTRAINT car_dealers_slug_unique UNIQUE (slug);

-- Add unique constraint on slug for ev_charging_stations to enable UPSERT
ALTER TABLE public.ev_charging_stations ADD CONSTRAINT ev_charging_stations_slug_unique UNIQUE (slug);