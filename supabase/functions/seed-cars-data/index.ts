import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Comprehensive car brands data based on Indian market
const brandsData = [
  { name: 'Maruti Suzuki', slug: 'maruti-suzuki', country: 'Japan/India', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/10/brands/logos/maruti-suzuki1647009823420.jpg', is_popular: true, display_order: 1 },
  { name: 'Tata', slug: 'tata', country: 'India', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/16/brands/logos/tata.jpg', is_popular: true, display_order: 2 },
  { name: 'Mahindra', slug: 'mahindra', country: 'India', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/9/brands/logos/mahindra.jpg', is_popular: true, display_order: 3 },
  { name: 'Hyundai', slug: 'hyundai', country: 'South Korea', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/8/brands/logos/hyundai.jpg', is_popular: true, display_order: 4 },
  { name: 'Kia', slug: 'kia', country: 'South Korea', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/70/brands/logos/kia.jpg', is_popular: true, display_order: 5 },
  { name: 'Toyota', slug: 'toyota', country: 'Japan', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/17/brands/logos/toyota.jpg', is_popular: true, display_order: 6 },
  { name: 'Honda', slug: 'honda', country: 'Japan', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/7/brands/logos/honda.jpg', is_popular: true, display_order: 7 },
  { name: 'MG', slug: 'mg', country: 'UK/China', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/72/brands/logos/mg.jpg', is_popular: true, display_order: 8 },
  { name: 'Skoda', slug: 'skoda', country: 'Czech Republic', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/15/brands/logos/skoda1681982956420.jpg', is_popular: true, display_order: 9 },
  { name: 'Volkswagen', slug: 'volkswagen', country: 'Germany', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/19/brands/logos/volkswagen1630403498tried.jpg', is_popular: true, display_order: 10 },
  { name: 'Renault', slug: 'renault', country: 'France', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/45/brands/logos/renault.jpg', is_popular: false, display_order: 11 },
  { name: 'Nissan', slug: 'nissan', country: 'Japan', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/12/brands/logos/nissan.jpg', is_popular: false, display_order: 12 },
  { name: 'BMW', slug: 'bmw', country: 'Germany', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/1/brands/logos/bmw.jpg', is_popular: true, display_order: 13 },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', country: 'Germany', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/11/brands/logos/mercedes-benz.jpg', is_popular: true, display_order: 14 },
  { name: 'Audi', slug: 'audi', country: 'Germany', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/21/brands/logos/audi.jpg', is_popular: true, display_order: 15 },
  { name: 'Jeep', slug: 'jeep', country: 'USA', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/41/brands/logos/jeep.jpg', is_popular: false, display_order: 16 },
  { name: 'Citroen', slug: 'citroen', country: 'France', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/108/brands/logos/citroen.jpg', is_popular: false, display_order: 17 },
  { name: 'BYD', slug: 'byd', country: 'China', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/144/brands/logos/byd.jpg', is_popular: false, display_order: 18 },
  { name: 'Volvo', slug: 'volvo', country: 'Sweden', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/18/brands/logos/volvo.jpg', is_popular: false, display_order: 19 },
  { name: 'Lexus', slug: 'lexus', country: 'Japan', logo_url: 'https://imgd.aeplcdn.com/0X0/n/cw/ec/46/brands/logos/lexus.jpg', is_popular: false, display_order: 20 },
];

// Body type mapper to match database constraint: hatchback, sedan, suv, muv, compact-suv, coupe, convertible, pickup, van
const mapBodyType = (type: string): string => {
  const normalizedType = type?.toLowerCase().trim() || 'suv';
  const map: Record<string, string> = {
    'hatchback': 'hatchback',
    'sedan': 'sedan',
    'suv': 'suv',
    'muv': 'muv',
    'mpv': 'muv',
    'compact suv': 'compact-suv',
    'compact-suv': 'compact-suv',
    'micro suv': 'compact-suv',
    'suv coupe': 'suv',
    'electric suv': 'suv',
    'electric crossover': 'suv',
    'coupe': 'coupe',
    'convertible': 'convertible',
    'pickup': 'pickup',
    'van': 'van',
  };
  return map[normalizedType] || 'suv';
};

// Fuel type mapper to match database constraint: petrol, diesel, cng, electric, hybrid, plug-in-hybrid
const mapFuelType = (type: string): string => {
  const normalizedType = type?.toLowerCase().trim() || 'petrol';
  const map: Record<string, string> = {
    'petrol': 'petrol',
    'diesel': 'diesel',
    'cng': 'cng',
    'electric': 'electric',
    'hybrid': 'hybrid',
    'plug-in-hybrid': 'plug-in-hybrid',
    'plug-in hybrid': 'plug-in-hybrid',
  };
  return map[normalizedType] || 'petrol';
};

// Transmission mapper to match database constraint: manual, automatic, amt, cvt, dct
const mapTransmission = (type: string): string => {
  const normalizedType = type?.toLowerCase().trim() || 'manual';
  const map: Record<string, string> = {
    'manual': 'manual',
    'automatic': 'automatic',
    'amt': 'amt',
    'cvt': 'cvt',
    'dct': 'dct',
  };
  return map[normalizedType] || 'manual';
};

// Comprehensive models data with Jaipur-specific pricing
const modelsData = [
  // Maruti Suzuki Models
  { brand_slug: 'maruti-suzuki', name: 'Swift', slug: 'swift', body_type: 'hatchback', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 579000, ex_showroom_price_max: 914000, on_road_price_jaipur_min: 680000, on_road_price_jaipur_max: 1050000, mileage_city: 20, mileage_highway: 25, engine_cc: 1197, power_bhp: 82, torque_nm: 112, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/102849/swift-exterior-right-front-three-quarter-2.png', pros: ['Fuel efficient', 'Low maintenance cost', 'Great resale value', 'Peppy engine'], cons: ['Limited rear space', 'Basic features in lower variants'], best_for: ['City commute', 'First-time buyers', 'Daily use'] },
  { brand_slug: 'maruti-suzuki', name: 'Baleno', slug: 'baleno', body_type: 'hatchback', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 678000, ex_showroom_price_max: 1053000, on_road_price_jaipur_min: 790000, on_road_price_jaipur_max: 1200000, mileage_city: 19, mileage_highway: 24, engine_cc: 1197, power_bhp: 90, torque_nm: 113, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/135663/baleno-exterior-right-front-three-quarter-3.png', pros: ['Premium interiors', 'Feature loaded', 'Spacious cabin', 'Good mileage'], cons: ['No diesel option', 'CVT not very responsive'], best_for: ['Premium hatchback buyers', 'Tech enthusiasts'] },
  { brand_slug: 'maruti-suzuki', name: 'Fronx', slug: 'fronx', body_type: 'compact-suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 685000, ex_showroom_price_max: 1350000, on_road_price_jaipur_min: 800000, on_road_price_jaipur_max: 1550000, mileage_city: 18, mileage_highway: 23, engine_cc: 1197, power_bhp: 100, torque_nm: 136, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/130591/fronx-exterior-right-front-three-quarter-109.png', pros: ['Turbo petrol option', 'Good ground clearance', 'SUV stance', 'Feature rich'], cons: ['No sunroof in base', 'Only petrol'], best_for: ['First SUV buyers', 'Young professionals'] },
  { brand_slug: 'maruti-suzuki', name: 'Brezza', slug: 'brezza', body_type: 'compact-suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 884000, ex_showroom_price_max: 1479000, on_road_price_jaipur_min: 1020000, on_road_price_jaipur_max: 1680000, mileage_city: 17, mileage_highway: 22, engine_cc: 1462, power_bhp: 103, torque_nm: 137, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/145563/brezza-exterior-right-front-three-quarter-2.png', pros: ['Sunroof', 'Best in class mileage', 'SUV presence', 'Great service network'], cons: ['No diesel', 'Average interior quality'], best_for: ['Compact SUV buyers', 'Family use'] },
  { brand_slug: 'maruti-suzuki', name: 'Grand Vitara', slug: 'grand-vitara', body_type: 'suv', fuel_type: 'Hybrid', transmission: 'Automatic', ex_showroom_price_min: 1099000, ex_showroom_price_max: 2020000, on_road_price_jaipur_min: 1280000, on_road_price_jaipur_max: 2320000, mileage_city: 20, mileage_highway: 27, engine_cc: 1490, power_bhp: 116, torque_nm: 122, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/139139/grand-vitara-exterior-right-front-three-quarter-4.png', pros: ['Strong hybrid option', 'AWD available', 'Premium cabin', 'Great mileage'], cons: ['Expensive top variants', 'Hybrid has weak power'], best_for: ['Highway users', 'Eco-conscious buyers'] },
  { brand_slug: 'maruti-suzuki', name: 'Ertiga', slug: 'ertiga', body_type: 'muv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 876000, ex_showroom_price_max: 1320000, on_road_price_jaipur_min: 1020000, on_road_price_jaipur_max: 1520000, mileage_city: 16, mileage_highway: 20, engine_cc: 1462, power_bhp: 105, torque_nm: 138, seating_capacity: 7, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/115025/ertiga-exterior-right-front-three-quarter-3.png', pros: ['7 seater', 'Great mileage', 'CNG option', 'Comfortable ride'], cons: ['Basic interiors', 'Underpowered for hills'], best_for: ['Large families', 'Taxi/commercial use'] },
  { brand_slug: 'maruti-suzuki', name: 'Dzire', slug: 'dzire', body_type: 'sedan', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 699000, ex_showroom_price_max: 1029000, on_road_price_jaipur_min: 820000, on_road_price_jaipur_max: 1180000, mileage_city: 20, mileage_highway: 25, engine_cc: 1197, power_bhp: 82, torque_nm: 112, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/161683/dzire-2024-exterior-right-front-three-quarter-5.png', pros: ['Best selling sedan', 'Great boot space', 'Low running cost', 'AMT option'], cons: ['Underpowered', 'Basic cabin'], best_for: ['Sedan lovers', 'Commercial use', 'First car'] },
  { brand_slug: 'maruti-suzuki', name: 'Invicto', slug: 'invicto', body_type: 'muv', fuel_type: 'Hybrid', transmission: 'Automatic', ex_showroom_price_min: 2510000, ex_showroom_price_max: 2850000, on_road_price_jaipur_min: 2890000, on_road_price_jaipur_max: 3280000, mileage_city: 18, mileage_highway: 23, engine_cc: 1987, power_bhp: 186, torque_nm: 188, seating_capacity: 8, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/141491/invicto-exterior-right-front-three-quarter-3.png', pros: ['Hybrid tech', 'Premium cabin', 'Toyota reliability', 'Great mileage'], cons: ['Very expensive', 'No diesel'], best_for: ['Premium MPV buyers', 'Luxury seekers'] },
  
  // Tata Models
  { brand_slug: 'tata', name: 'Nexon', slug: 'nexon', body_type: 'compact-suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 800000, ex_showroom_price_max: 1485000, on_road_price_jaipur_min: 940000, on_road_price_jaipur_max: 1700000, mileage_city: 14, mileage_highway: 18, engine_cc: 1199, power_bhp: 120, torque_nm: 170, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/141867/nexon-exterior-right-front-three-quarter-79.png', pros: ['5 star safety', 'Turbo petrol', 'Sunroof', 'Great build quality'], cons: ['Diesel is noisy', 'AMT not smooth'], best_for: ['Safety conscious', 'Young buyers'] },
  { brand_slug: 'tata', name: 'Punch', slug: 'punch', body_type: 'compact-suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 600000, ex_showroom_price_max: 1020000, on_road_price_jaipur_min: 710000, on_road_price_jaipur_max: 1180000, mileage_city: 17, mileage_highway: 20, engine_cc: 1199, power_bhp: 86, torque_nm: 113, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/107541/punch-exterior-right-front-three-quarter-62.png', pros: ['5 star safety', 'High ground clearance', 'Affordable', 'Cute design'], cons: ['Only petrol', 'No diesel'], best_for: ['City dwellers', 'Budget buyers'] },
  { brand_slug: 'tata', name: 'Harrier', slug: 'harrier', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Manual', ex_showroom_price_min: 1549000, ex_showroom_price_max: 2655000, on_road_price_jaipur_min: 1800000, on_road_price_jaipur_max: 3050000, mileage_city: 12, mileage_highway: 16, engine_cc: 1956, power_bhp: 170, torque_nm: 350, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/138893/harrier-exterior-right-front-three-quarter-79.png', pros: ['Stunning looks', 'Powerful diesel', 'Premium cabin', '5 star safety'], cons: ['No petrol option', 'Heavy'], best_for: ['Premium SUV buyers', 'Highway travelers'] },
  { brand_slug: 'tata', name: 'Safari', slug: 'safari', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Manual', ex_showroom_price_min: 1649000, ex_showroom_price_max: 2740000, on_road_price_jaipur_min: 1920000, on_road_price_jaipur_max: 3150000, mileage_city: 11, mileage_highway: 15, engine_cc: 1956, power_bhp: 170, torque_nm: 350, seating_capacity: 7, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/138895/safari-exterior-right-front-three-quarter-69.png', pros: ['Iconic brand', '7 seater', 'Captain seats', 'Premium feel'], cons: ['Expensive', 'Only diesel'], best_for: ['Families', 'Safari loyalists'] },
  { brand_slug: 'tata', name: 'Sierra', slug: 'sierra', body_type: 'suv', fuel_type: 'Petrol', transmission: 'Automatic', ex_showroom_price_min: 1149000, ex_showroom_price_max: 1849000, on_road_price_jaipur_min: 1340000, on_road_price_jaipur_max: 2130000, mileage_city: 14, mileage_highway: 18, engine_cc: 1497, power_bhp: 150, torque_nm: 250, seating_capacity: 5, is_trending: true, is_new_launch: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/191639/sierra-exterior-right-front-three-quarter-5.png', pros: ['Iconic nameplate', 'Modern design', 'Feature loaded', 'Good value'], cons: ['New model', 'Untested reliability'], best_for: ['Design lovers', 'Brand enthusiasts'] },
  { brand_slug: 'tata', name: 'Curvv', slug: 'curvv', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price_min: 1000000, ex_showroom_price_max: 1850000, on_road_price_jaipur_min: 1170000, on_road_price_jaipur_max: 2130000, mileage_city: 15, mileage_highway: 19, engine_cc: 1497, power_bhp: 118, torque_nm: 260, seating_capacity: 5, is_trending: true, is_new_launch: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/153603/curvv-exterior-right-front-three-quarter-5.png', pros: ['Unique coupe design', 'Diesel & EV options', 'Panoramic sunroof', 'ADAS'], cons: ['Rear headroom', 'Boot access'], best_for: ['Style seekers', 'Early adopters'] },
  { brand_slug: 'tata', name: 'Nexon EV', slug: 'nexon-ev', body_type: 'suv', fuel_type: 'Electric', transmission: 'Automatic', ex_showroom_price_min: 1349900, ex_showroom_price_max: 1699000, on_road_price_jaipur_min: 1449900, on_road_price_jaipur_max: 1820000, mileage_city: null, mileage_highway: null, engine_cc: null, power_bhp: 143, torque_nm: 215, seating_capacity: 5, is_ev: true, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/137273/nexon-ev-exterior-right-front-three-quarter-4.png', pros: ['Best selling EV', 'Good range', 'Fast charging', 'Low running cost'], cons: ['Range anxiety', 'Charging infra'], best_for: ['EV enthusiasts', 'City commuters'], waiting_period_weeks: 4 },
  
  // Hyundai Models
  { brand_slug: 'hyundai', name: 'Venue', slug: 'venue', body_type: 'compact-suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 790000, ex_showroom_price_max: 1460000, on_road_price_jaipur_min: 920000, on_road_price_jaipur_max: 1680000, mileage_city: 15, mileage_highway: 19, engine_cc: 1197, power_bhp: 120, torque_nm: 172, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/197163/venue-exterior-right-front-three-quarter-38.png', pros: ['Feature rich', 'Turbo petrol', 'DCT gearbox', 'Compact size'], cons: ['Tight rear seat', 'No diesel DCT'], best_for: ['Urban professionals', 'Tech lovers'] },
  { brand_slug: 'hyundai', name: 'Creta', slug: 'creta', body_type: 'suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1099000, ex_showroom_price_max: 2030000, on_road_price_jaipur_min: 1280000, on_road_price_jaipur_max: 2350000, mileage_city: 14, mileage_highway: 18, engine_cc: 1497, power_bhp: 160, torque_nm: 253, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/106815/creta-exterior-right-front-three-quarter-6.png', pros: ['Best selling SUV', 'Premium interiors', 'ADAS features', 'Multiple powertrains'], cons: ['Expensive top variants', 'Waiting period'], best_for: ['Premium SUV buyers', 'Feature seekers'], waiting_period_weeks: 6 },
  { brand_slug: 'hyundai', name: 'i20', slug: 'i20', body_type: 'hatchback', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 739000, ex_showroom_price_max: 1180000, on_road_price_jaipur_min: 870000, on_road_price_jaipur_max: 1370000, mileage_city: 17, mileage_highway: 22, engine_cc: 1197, power_bhp: 88, torque_nm: 115, seating_capacity: 5, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/171035/i20-exterior-right-front-three-quarter-3.png', pros: ['Premium looks', 'Feature loaded', 'Sunroof', 'Great handling'], cons: ['Only petrol', 'Expensive maintenance'], best_for: ['Premium hatch buyers', 'Design conscious'] },
  { brand_slug: 'hyundai', name: 'Verna', slug: 'verna', body_type: 'sedan', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1109000, ex_showroom_price_max: 1768000, on_road_price_jaipur_min: 1290000, on_road_price_jaipur_max: 2040000, mileage_city: 14, mileage_highway: 18, engine_cc: 1497, power_bhp: 160, torque_nm: 253, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/144169/verna-exterior-right-front-three-quarter-57.png', pros: ['Turbo petrol', 'Premium cabin', 'ADAS', 'Great looks'], cons: ['No diesel', 'Expensive'], best_for: ['Sedan lovers', 'Highway travelers'] },
  { brand_slug: 'hyundai', name: 'Alcazar', slug: 'alcazar', body_type: 'suv', fuel_type: 'Petrol', transmission: 'Automatic', ex_showroom_price_min: 1499000, ex_showroom_price_max: 2150000, on_road_price_jaipur_min: 1740000, on_road_price_jaipur_max: 2480000, mileage_city: 12, mileage_highway: 16, engine_cc: 1497, power_bhp: 160, torque_nm: 253, seating_capacity: 7, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/171531/alcazar-exterior-right-front-three-quarter-2.png', pros: ['7 seater Creta', 'Captain seats', 'ADAS', 'Panoramic sunroof'], cons: ['Third row tight', 'Expensive'], best_for: ['Large families', '6-7 seater needs'] },
  
  // Mahindra Models
  { brand_slug: 'mahindra', name: 'Thar', slug: 'thar', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Manual', ex_showroom_price_min: 1095000, ex_showroom_price_max: 1875000, on_road_price_jaipur_min: 1280000, on_road_price_jaipur_max: 2160000, mileage_city: 12, mileage_highway: 15, engine_cc: 2184, power_bhp: 152, torque_nm: 320, seating_capacity: 4, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/179459/thar-roxx-exterior-right-front-three-quarter-17.png', pros: ['True off-roader', 'Iconic design', '4x4', 'Powerful diesel'], cons: ['Stiff ride', 'Limited boot'], best_for: ['Adventure seekers', 'Off-road enthusiasts'] },
  { brand_slug: 'mahindra', name: 'Thar Roxx', slug: 'thar-roxx', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price_min: 1269000, ex_showroom_price_max: 2290000, on_road_price_jaipur_min: 1480000, on_road_price_jaipur_max: 2640000, mileage_city: 12, mileage_highway: 15, engine_cc: 2184, power_bhp: 175, torque_nm: 370, seating_capacity: 5, is_trending: true, is_new_launch: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/179459/thar-roxx-exterior-right-front-three-quarter-17.png', pros: ['5 door Thar', 'More practical', 'Feature loaded', '4x4 available'], cons: ['Premium pricing', 'Long waiting'], best_for: ['Thar fans with family', 'Adventure lovers'], waiting_period_weeks: 20 },
  { brand_slug: 'mahindra', name: 'Scorpio N', slug: 'scorpio-n', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Manual', ex_showroom_price_min: 1399000, ex_showroom_price_max: 2490000, on_road_price_jaipur_min: 1630000, on_road_price_jaipur_max: 2870000, mileage_city: 11, mileage_highway: 14, engine_cc: 2184, power_bhp: 175, torque_nm: 400, seating_capacity: 7, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/116977/scorpio-n-exterior-right-front-three-quarter-3.png', pros: ['Powerful engine', 'Road presence', '4x4', 'Value for money'], cons: ['Heavy', 'Stiff suspension'], best_for: ['SUV enthusiasts', 'Scorpio loyalists'], waiting_period_weeks: 12 },
  { brand_slug: 'mahindra', name: 'XUV700', slug: 'xuv700', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price_min: 1499000, ex_showroom_price_max: 2795000, on_road_price_jaipur_min: 1740000, on_road_price_jaipur_max: 3220000, mileage_city: 12, mileage_highway: 15, engine_cc: 2184, power_bhp: 185, torque_nm: 450, seating_capacity: 7, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/124003/xuv700-exterior-right-front-three-quarter-2.png', pros: ['Powerful engines', 'ADAS', 'Premium cabin', 'Great value'], cons: ['Long waiting period', 'Heavy'], best_for: ['Tech enthusiasts', 'Premium SUV seekers'], waiting_period_weeks: 16 },
  { brand_slug: 'mahindra', name: 'XUV 3XO', slug: 'xuv-3xo', body_type: 'compact-suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 799000, ex_showroom_price_max: 1559000, on_road_price_jaipur_min: 930000, on_road_price_jaipur_max: 1800000, mileage_city: 15, mileage_highway: 18, engine_cc: 1197, power_bhp: 130, torque_nm: 230, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/161435/xuv-3xo-exterior-right-front-three-quarter-6.png', pros: ['Panoramic sunroof', 'Turbo petrol', 'Feature loaded', 'Good value'], cons: ['Cramped rear', 'AMT only'], best_for: ['Feature seekers', 'Young professionals'] },
  { brand_slug: 'mahindra', name: 'BE 6', slug: 'be-6', body_type: 'suv', fuel_type: 'Electric', transmission: 'Automatic', ex_showroom_price_min: 1899000, ex_showroom_price_max: 2649000, on_road_price_jaipur_min: 2050000, on_road_price_jaipur_max: 2850000, engine_cc: null, power_bhp: 286, torque_nm: 380, seating_capacity: 5, is_ev: true, is_new_launch: true, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/184475/be-6-exterior-right-front-three-quarter-3.png', pros: ['535km range', 'Fast charging', 'Premium design', 'Made in India'], cons: ['New brand', 'Limited service'], best_for: ['EV early adopters', 'Tech enthusiasts'], waiting_period_weeks: 8 },
  
  // Kia Models
  { brand_slug: 'kia', name: 'Seltos', slug: 'seltos', body_type: 'suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1099000, ex_showroom_price_max: 2095000, on_road_price_jaipur_min: 1280000, on_road_price_jaipur_max: 2420000, mileage_city: 14, mileage_highway: 18, engine_cc: 1497, power_bhp: 160, torque_nm: 253, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/174315/seltos-exterior-right-front-three-quarter-3.png', pros: ['Feature rich', 'Multiple powertrains', 'Premium cabin', 'Brand value'], cons: ['After sales cost', 'Diesel lacks punch'], best_for: ['Feature seekers', 'Compact SUV buyers'] },
  { brand_slug: 'kia', name: 'Sonet', slug: 'sonet', body_type: 'compact-suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 799000, ex_showroom_price_max: 1575000, on_road_price_jaipur_min: 930000, on_road_price_jaipur_max: 1820000, mileage_city: 15, mileage_highway: 19, engine_cc: 1197, power_bhp: 120, torque_nm: 172, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/174323/sonet-exterior-right-front-three-quarter-2.png', pros: ['Feature loaded', 'IMT gearbox', 'Turbo engines', 'Value for money'], cons: ['Tight rear', 'Boot space'], best_for: ['Young buyers', 'Feature enthusiasts'] },
  { brand_slug: 'kia', name: 'Carens', slug: 'carens', body_type: 'muv', fuel_type: 'Diesel', transmission: 'Manual', ex_showroom_price_min: 1099000, ex_showroom_price_max: 1969000, on_road_price_jaipur_min: 1280000, on_road_price_jaipur_max: 2270000, mileage_city: 14, mileage_highway: 18, engine_cc: 1493, power_bhp: 115, torque_nm: 250, seating_capacity: 7, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/143863/carens-exterior-right-front-three-quarter-30.png', pros: ['Practical 7 seater', 'Feature loaded', 'Diesel option', 'Good value'], cons: ['Basic 3rd row', 'Not an SUV'], best_for: ['Large families', 'Practical buyers'] },
  { brand_slug: 'kia', name: 'EV6', slug: 'ev6', body_type: 'suv', fuel_type: 'Electric', transmission: 'Automatic', ex_showroom_price_min: 6095000, ex_showroom_price_max: 6595000, on_road_price_jaipur_min: 6500000, on_road_price_jaipur_max: 7100000, engine_cc: null, power_bhp: 325, torque_nm: 605, seating_capacity: 5, is_ev: true, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/142393/ev6-exterior-right-front-three-quarter-5.png', pros: ['Ultra fast charging', 'Performance', 'Premium cabin', 'Long range'], cons: ['Very expensive', 'Limited service'], best_for: ['EV enthusiasts', 'Premium buyers'] },
  
  // Toyota Models
  { brand_slug: 'toyota', name: 'Fortuner', slug: 'fortuner', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price_min: 3427000, ex_showroom_price_max: 5193000, on_road_price_jaipur_min: 3950000, on_road_price_jaipur_max: 5980000, mileage_city: 10, mileage_highway: 13, engine_cc: 2755, power_bhp: 204, torque_nm: 500, seating_capacity: 7, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/108021/fortuner-exterior-right-front-three-quarter.png', pros: ['Legendary reliability', 'Powerful diesel', '4x4', 'Best resale'], cons: ['Expensive', 'Old design'], best_for: ['Premium SUV buyers', 'Off-road travelers'] },
  { brand_slug: 'toyota', name: 'Urban Cruiser Hyryder', slug: 'urban-cruiser-hyryder', body_type: 'suv', fuel_type: 'Hybrid', transmission: 'Automatic', ex_showroom_price_min: 1099000, ex_showroom_price_max: 1980000, on_road_price_jaipur_min: 1280000, on_road_price_jaipur_max: 2280000, mileage_city: 20, mileage_highway: 27, engine_cc: 1490, power_bhp: 116, torque_nm: 122, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/110043/urban-cruiser-hyryder-exterior-right-front-three-quarter.png', pros: ['Hybrid technology', 'Great mileage', 'Toyota reliability', 'AWD option'], cons: ['Weak hybrid power', 'Premium pricing'], best_for: ['Eco-conscious buyers', 'Highway users'] },
  { brand_slug: 'toyota', name: 'Innova Crysta', slug: 'innova-crysta', body_type: 'muv', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price_min: 1972000, ex_showroom_price_max: 2686000, on_road_price_jaipur_min: 2280000, on_road_price_jaipur_max: 3100000, mileage_city: 11, mileage_highway: 14, engine_cc: 2393, power_bhp: 150, torque_nm: 360, seating_capacity: 8, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/51435/innova-crysta-exterior-right-front-three-quarter-2.png', pros: ['Unmatched reliability', 'Captain seats', 'Diesel power', 'Best resale'], cons: ['Very expensive', 'Old design'], best_for: ['Business class travelers', 'Large families'] },
  { brand_slug: 'toyota', name: 'Innova Hycross', slug: 'innova-hycross', body_type: 'muv', fuel_type: 'Hybrid', transmission: 'Automatic', ex_showroom_price_min: 1994000, ex_showroom_price_max: 3030000, on_road_price_jaipur_min: 2300000, on_road_price_jaipur_max: 3490000, mileage_city: 18, mileage_highway: 23, engine_cc: 1987, power_bhp: 186, torque_nm: 188, seating_capacity: 8, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/140809/innova-hycross-exterior-right-front-three-quarter-78.png', pros: ['Hybrid technology', 'Monocoque chassis', 'Premium cabin', 'Great mileage'], cons: ['No diesel', 'FWD only'], best_for: ['Premium MPV buyers', 'Eco-conscious families'], waiting_period_weeks: 10 },
  
  // Honda Models  
  { brand_slug: 'honda', name: 'City', slug: 'city', body_type: 'sedan', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1220000, ex_showroom_price_max: 1645000, on_road_price_jaipur_min: 1420000, on_road_price_jaipur_max: 1900000, mileage_city: 15, mileage_highway: 19, engine_cc: 1498, power_bhp: 121, torque_nm: 145, seating_capacity: 5, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/134287/city-exterior-right-front-three-quarter-2.png', pros: ['Refined engine', 'Spacious cabin', 'ADAS', 'Honda reliability'], cons: ['Expensive', 'Only CVT auto'], best_for: ['Sedan lovers', 'Brand conscious'] },
  { brand_slug: 'honda', name: 'Amaze', slug: 'amaze', body_type: 'sedan', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 799000, ex_showroom_price_max: 1089000, on_road_price_jaipur_min: 930000, on_road_price_jaipur_max: 1260000, mileage_city: 16, mileage_highway: 20, engine_cc: 1199, power_bhp: 90, torque_nm: 110, seating_capacity: 5, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/188597/amaze-exterior-right-front-three-quarter-4.png', pros: ['Good boot space', 'Reliable engine', 'Good mileage', 'CVT option'], cons: ['Basic features', 'Dated design'], best_for: ['Compact sedan buyers', 'First car'] },
  { brand_slug: 'honda', name: 'Elevate', slug: 'elevate', body_type: 'suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1110000, ex_showroom_price_max: 1636000, on_road_price_jaipur_min: 1290000, on_road_price_jaipur_max: 1890000, mileage_city: 14, mileage_highway: 18, engine_cc: 1498, power_bhp: 121, torque_nm: 145, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/150557/elevate-exterior-right-front-three-quarter-4.png', pros: ['Spacious cabin', 'Honda reliability', 'ADAS', 'Good ride quality'], cons: ['Only petrol', 'CVT only auto'], best_for: ['Honda loyalists', 'SUV seekers'] },
  
  // MG Models
  { brand_slug: 'mg', name: 'Hector', slug: 'hector', body_type: 'suv', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price_min: 1398000, ex_showroom_price_max: 2260000, on_road_price_jaipur_min: 1630000, on_road_price_jaipur_max: 2610000, mileage_city: 12, mileage_highway: 15, engine_cc: 1956, power_bhp: 170, torque_nm: 350, seating_capacity: 5, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/136139/hector-exterior-right-front-three-quarter-5.png', pros: ['Big size', 'Connected car tech', 'Panoramic sunroof', 'Value for money'], cons: ['Heavy', 'CVT is slow'], best_for: ['Tech enthusiasts', 'Space seekers'] },
  { brand_slug: 'mg', name: 'ZS EV', slug: 'zs-ev', body_type: 'suv', fuel_type: 'Electric', transmission: 'Automatic', ex_showroom_price_min: 1888000, ex_showroom_price_max: 2588000, on_road_price_jaipur_min: 2000000, on_road_price_jaipur_max: 2750000, engine_cc: null, power_bhp: 176, torque_nm: 280, seating_capacity: 5, is_ev: true, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/133535/zs-ev-exterior-right-front-three-quarter-3.png', pros: ['Good range', 'Premium features', 'Fast charging', 'Good value EV'], cons: ['Expensive', 'Service network'], best_for: ['EV buyers', 'Premium SUV seekers'] },
  { brand_slug: 'mg', name: 'Astor', slug: 'astor', body_type: 'suv', fuel_type: 'Petrol', transmission: 'Automatic', ex_showroom_price_min: 998000, ex_showroom_price_max: 1838000, on_road_price_jaipur_min: 1160000, on_road_price_jaipur_max: 2120000, mileage_city: 13, mileage_highway: 17, engine_cc: 1349, power_bhp: 140, torque_nm: 220, seating_capacity: 5, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/100113/astor-exterior-right-front-three-quarter-3.png', pros: ['AI assistant', 'ADAS level 2', 'Good value', 'Premium cabin'], cons: ['Only petrol', 'CVT is slow'], best_for: ['Tech lovers', 'City commuters'] },
  
  // Skoda Models
  { brand_slug: 'skoda', name: 'Kushaq', slug: 'kushaq', body_type: 'suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1114900, ex_showroom_price_max: 1924900, on_road_price_jaipur_min: 1300000, on_road_price_jaipur_max: 2220000, mileage_city: 14, mileage_highway: 18, engine_cc: 1498, power_bhp: 150, torque_nm: 250, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/177607/kushaq-exterior-right-front-three-quarter-4.png', pros: ['Solid build', 'TSI engines', 'Fun to drive', 'German engineering'], cons: ['Expensive service', 'No diesel'], best_for: ['Enthusiast drivers', 'Build quality seekers'] },
  { brand_slug: 'skoda', name: 'Slavia', slug: 'slavia', body_type: 'sedan', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1099000, ex_showroom_price_max: 1879000, on_road_price_jaipur_min: 1280000, on_road_price_jaipur_max: 2170000, mileage_city: 14, mileage_highway: 18, engine_cc: 1498, power_bhp: 150, torque_nm: 250, seating_capacity: 5, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/127277/slavia-exterior-right-front-three-quarter-4.png', pros: ['Best in class handling', 'TSI engines', 'Spacious cabin', 'Boot space'], cons: ['Expensive service', 'Only petrol'], best_for: ['Driving enthusiasts', 'Sedan lovers'] },
  { brand_slug: 'skoda', name: 'Superb', slug: 'superb', body_type: 'sedan', fuel_type: 'Petrol', transmission: 'Automatic', ex_showroom_price_min: 3499000, ex_showroom_price_max: 3899000, on_road_price_jaipur_min: 4030000, on_road_price_jaipur_max: 4490000, mileage_city: 11, mileage_highway: 14, engine_cc: 1984, power_bhp: 190, torque_nm: 320, seating_capacity: 5, is_trending: false, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/179449/superb-exterior-right-front-three-quarter-5.png', pros: ['Massive space', 'TSI power', 'Premium cabin', 'Simply clever features'], cons: ['Very expensive', 'No diesel'], best_for: ['Executive sedan buyers', 'Space seekers'] },
  
  // Volkswagen Models
  { brand_slug: 'volkswagen', name: 'Taigun', slug: 'taigun', body_type: 'suv', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1114900, ex_showroom_price_max: 1904900, on_road_price_jaipur_min: 1300000, on_road_price_jaipur_max: 2200000, mileage_city: 14, mileage_highway: 18, engine_cc: 1498, power_bhp: 150, torque_nm: 250, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/144681/taigun-exterior-right-front-three-quarter-5.png', pros: ['Solid build', 'TSI engines', 'Fun to drive', 'German engineering'], cons: ['Expensive service', 'No diesel'], best_for: ['Enthusiast drivers', 'German car fans'] },
  { brand_slug: 'volkswagen', name: 'Virtus', slug: 'virtus', body_type: 'sedan', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price_min: 1129000, ex_showroom_price_max: 1915000, on_road_price_jaipur_min: 1310000, on_road_price_jaipur_max: 2210000, mileage_city: 14, mileage_highway: 18, engine_cc: 1498, power_bhp: 150, torque_nm: 250, seating_capacity: 5, is_trending: true, cover_image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/127261/virtus-exterior-right-front-three-quarter-3.png', pros: ['Best handling sedan', 'TSI engines', 'Spacious', 'Great boot'], cons: ['Expensive service', 'Only petrol'], best_for: ['Driving enthusiasts', 'Sedan lovers'] },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting car data seeding...');

    // Step 1: Insert brands
    const { data: insertedBrands, error: brandsError } = await supabase
      .from('car_brands')
      .upsert(
        brandsData.map(b => ({
          name: b.name,
          slug: b.slug,
          country: b.country,
          logo_url: b.logo_url,
          is_popular: b.is_popular,
          display_order: b.display_order,
          description: `${b.name} cars available in Jaipur with on-road prices, specifications, and dealer information.`
        })),
        { onConflict: 'slug' }
      )
      .select();

    if (brandsError) {
      console.error('Error inserting brands:', brandsError);
      throw brandsError;
    }

    console.log(`Inserted/updated ${insertedBrands?.length || 0} brands`);

    // Step 2: Get all brands to map slugs to IDs
    const { data: allBrands } = await supabase
      .from('car_brands')
      .select('id, slug');

    const brandMap = new Map(allBrands?.map(b => [b.slug, b.id]) || []);

    // Step 3: Insert models with mapped values for constraints
    const modelsToInsert = modelsData.map(m => ({
      brand_id: brandMap.get(m.brand_slug),
      name: m.name,
      slug: m.slug,
      body_type: mapBodyType(m.body_type),
      fuel_type: mapFuelType(m.fuel_type),
      transmission: mapTransmission(m.transmission),
      ex_showroom_price_min: m.ex_showroom_price_min,
      ex_showroom_price_max: m.ex_showroom_price_max,
      on_road_price_jaipur_min: m.on_road_price_jaipur_min,
      on_road_price_jaipur_max: m.on_road_price_jaipur_max,
      mileage_city: m.mileage_city,
      mileage_highway: m.mileage_highway,
      engine_cc: m.engine_cc,
      power_bhp: m.power_bhp,
      torque_nm: m.torque_nm,
      seating_capacity: m.seating_capacity,
      is_ev: m.is_ev || false,
      is_new_launch: m.is_new_launch || false,
      is_trending: m.is_trending || false,
      cover_image: m.cover_image,
      pros: m.pros,
      cons: m.cons,
      best_for: m.best_for,
      waiting_period_weeks: m.waiting_period_weeks,
      meta_title: `${m.name} Price in Jaipur 2025 | On-Road Price, Specs, Mileage`,
      meta_description: `${m.name} price starts at ₹${(m.on_road_price_jaipur_min / 100000).toFixed(2)} Lakh in Jaipur. Check on-road price, variants, specifications, mileage, colors, and dealer offers.`
    })).filter(m => m.brand_id);

    const { data: insertedModels, error: modelsError } = await supabase
      .from('car_models')
      .upsert(modelsToInsert, { onConflict: 'slug' })
      .select();

    if (modelsError) {
      console.error('Error inserting models:', modelsError);
      throw modelsError;
    }

    console.log(`Inserted/updated ${insertedModels?.length || 0} models`);

    // Seed dealers
    const dealersData = [
      { name: 'Maruti Suzuki Arena - Mansarovar', slug: 'maruti-arena-mansarovar', brand_slug: 'maruti-suzuki', locality: 'Mansarovar', address: 'Sector 7, Mansarovar, Jaipur', phone: '0141-2780101', dealer_type: 'Authorized', is_verified: true, rating: 4.2 },
      { name: 'Maruti Nexa - Malviya Nagar', slug: 'maruti-nexa-malviya-nagar', brand_slug: 'maruti-suzuki', locality: 'Malviya Nagar', address: 'D-15, Malviya Nagar, Jaipur', phone: '0141-2521234', dealer_type: 'Authorized', is_verified: true, rating: 4.5 },
      { name: 'Tata Motors - Tonk Road', slug: 'tata-motors-tonk-road', brand_slug: 'tata', locality: 'Lalkothi', address: 'Tonk Road, Near Lalkothi, Jaipur', phone: '0141-2741010', dealer_type: 'Authorized', is_verified: true, rating: 4.3 },
      { name: 'Hyundai - C-Scheme', slug: 'hyundai-c-scheme', brand_slug: 'hyundai', locality: 'C-Scheme', address: 'Ashok Marg, C-Scheme, Jaipur', phone: '0141-2362525', dealer_type: 'Authorized', is_verified: true, rating: 4.4 },
      { name: 'Mahindra - Vaishali Nagar', slug: 'mahindra-vaishali-nagar', brand_slug: 'mahindra', locality: 'Vaishali Nagar', address: 'Main Road, Vaishali Nagar, Jaipur', phone: '0141-2351515', dealer_type: 'Authorized', is_verified: true, rating: 4.1 },
      { name: 'Kia - Ajmer Road', slug: 'kia-ajmer-road', brand_slug: 'kia', locality: 'Ajmer Road', address: 'Ajmer Road, Near Vidyadhar Nagar, Jaipur', phone: '0141-2345678', dealer_type: 'Authorized', is_verified: true, rating: 4.6 },
      { name: 'Toyota - MI Road', slug: 'toyota-mi-road', brand_slug: 'toyota', locality: 'MI Road', address: 'MI Road, Jaipur', phone: '0141-2369898', dealer_type: 'Authorized', is_verified: true, rating: 4.3 },
      { name: 'Honda - Gopalpura', slug: 'honda-gopalpura', brand_slug: 'honda', locality: 'Gopalpura', address: 'Gopalpura Bypass, Jaipur', phone: '0141-2501234', dealer_type: 'Authorized', is_verified: true, rating: 4.2 },
      { name: 'MG Motor - Jagatpura', slug: 'mg-motor-jagatpura', brand_slug: 'mg', locality: 'Jagatpura', address: 'Jagatpura Road, Jaipur', phone: '0141-2987654', dealer_type: 'Authorized', is_verified: true, rating: 4.4 },
      { name: 'Skoda - Raja Park', slug: 'skoda-raja-park', brand_slug: 'skoda', locality: 'Raja Park', address: 'Raja Park, Jaipur', phone: '0141-2654321', dealer_type: 'Authorized', is_verified: true, rating: 4.0 },
    ];

    const dealersToInsert = dealersData.map(d => ({
      ...d,
      brand_id: brandMap.get(d.brand_slug),
      city: 'Jaipur'
    })).filter(d => d.brand_id);

    const { data: insertedDealers, error: dealersError } = await supabase
      .from('car_dealers')
      .upsert(dealersToInsert, { onConflict: 'slug' })
      .select();

    if (dealersError) {
      console.error('Error inserting dealers:', dealersError);
    }

    console.log(`Inserted/updated ${insertedDealers?.length || 0} dealers`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          brands: insertedBrands?.length || 0,
          models: insertedModels?.length || 0,
          dealers: insertedDealers?.length || 0
        },
        message: 'Car data seeded/updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding car data:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
