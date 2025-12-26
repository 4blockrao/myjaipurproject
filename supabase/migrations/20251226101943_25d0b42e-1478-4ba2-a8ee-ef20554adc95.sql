-- Update AP Dhillon event with proper BMS image
UPDATE events 
SET cover_image = 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00458409-lrcntszrla-portrait.jpg'
WHERE id = 'efd3c5b0-41c1-4b08-b605-86d615ddb2f4';

-- Update Papa Yaar by Zakir Khan
UPDATE events 
SET cover_image = 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00434989-cklgeulaay-portrait.jpg'
WHERE title ILIKE '%Zakir Khan%' AND cover_image LIKE '%unsplash%';

-- Update Samay Raina event
UPDATE events 
SET cover_image = 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00454335-dcnwzqdmlh-portrait.jpg'
WHERE title ILIKE '%Samay Raina%' AND cover_image LIKE '%unsplash%';

-- Update Raaga Taala Retreat
UPDATE events 
SET cover_image = 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00465708-portrait.jpg'
WHERE title ILIKE '%Raaga Taala%' AND cover_image LIKE '%unsplash%';

-- Update Ab Hai Aapki Bari / Inder Sahani
UPDATE events 
SET cover_image = 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00355585-bzqrmxkvuw-portrait.jpg'
WHERE title ILIKE '%Inder Sahani%' AND cover_image LIKE '%unsplash%';

-- Update Dhun aur Dastaan
UPDATE events 
SET cover_image = 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00477091-qlduslrjuy-portrait.jpg'
WHERE title ILIKE '%Dhun aur Dastaan%' AND cover_image LIKE '%unsplash%';