-- Pumpline Seed Data
-- 3 counties, ~10 providers total (3-4 per county)
-- NO fake reviews -- they will come organically

-- ============================================
-- Counties
-- ============================================
INSERT INTO counties (id, name, state, state_full, slug, description, population, septic_pct, meta_title, meta_desc) VALUES
(
  'c1000000-0000-0000-0000-000000000001',
  'Travis County', 'TX', 'Texas', 'travis-county-tx',
  'Find trusted septic service providers in Travis County, Texas. Compare ratings, services, and pricing for septic pumping, repair, and installation near Austin.',
  1290188, 15.00,
  'Septic Services in Travis County, TX | Pumpline',
  'Compare top-rated septic pumping, repair, and installation services in Travis County, TX. Read reviews and get quotes from local providers.'
),
(
  'c1000000-0000-0000-0000-000000000002',
  'Wake County', 'NC', 'North Carolina', 'wake-county-nc',
  'Find trusted septic service providers in Wake County, North Carolina. Compare ratings, services, and pricing for septic pumping, repair, and installation near Raleigh.',
  1129410, 20.00,
  'Septic Services in Wake County, NC | Pumpline',
  'Compare top-rated septic pumping, repair, and installation services in Wake County, NC. Read reviews and get quotes from local providers.'
),
(
  'c1000000-0000-0000-0000-000000000003',
  'Polk County', 'FL', 'Florida', 'polk-county-fl',
  'Find trusted septic service providers in Polk County, Florida. Compare ratings, services, and pricing for septic pumping, repair, and installation near Lakeland.',
  724777, 35.00,
  'Septic Services in Polk County, FL | Pumpline',
  'Compare top-rated septic pumping, repair, and installation services in Polk County, FL. Read reviews and get quotes from local providers.'
);

-- ============================================
-- Providers: Travis County, TX (4 providers)
-- ============================================
INSERT INTO providers (county_id, name, slug, phone, email, website, address, city, state, zip, description, services, service_area, pricing_range, response_time, years_in_biz, license_number, status, is_verified, is_claimed) VALUES
(
  'c1000000-0000-0000-0000-000000000001',
  'Lone Star Septic Services',
  'lone-star-septic-services-travis-tx',
  '(512) 555-0147',
  'info@lonestarseptic.com',
  'https://lonestarseptic.com',
  '4210 Ranch Road 620 S',
  'Austin', 'TX', '78738',
  'Lone Star Septic Services has been keeping Austin-area septic systems running smoothly for over 18 years. We offer pumping, inspections, repairs, and new installations for residential and light commercial properties.',
  ARRAY['pumping','repair','installation','inspection'],
  'Travis County and surrounding areas',
  '$275-$450 for standard pumping',
  'Same-day available',
  18, 'TX-SEP-12045',
  'active', false, false
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Hill Country Pumping',
  'hill-country-pumping-travis-tx',
  '(512) 555-0283',
  NULL,
  'https://hillcountrypumping.com',
  '780 Cypress Creek Rd',
  'Cedar Park', 'TX', '78613',
  'Specializing in residential septic tank pumping and maintenance throughout the Hill Country. Known for reliable scheduling and transparent pricing with no hidden fees.',
  ARRAY['pumping','inspection'],
  'Travis and Williamson Counties',
  '$250-$400 for standard pumping',
  'Within 2 business days',
  9, 'TX-SEP-34210',
  'active', false, false
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Texas Rooter & Septic',
  'texas-rooter-septic-travis-tx',
  '(512) 555-0391',
  'service@texasrooter.com',
  NULL,
  '2200 E Riverside Dr',
  'Austin', 'TX', '78741',
  'Full-service plumbing and septic company handling everything from routine pump-outs to complete system installations and drain field repairs. Licensed master plumber on staff.',
  ARRAY['pumping','repair','installation','inspection'],
  'Austin metro area',
  '$300-$550 for standard pumping',
  'Same-day emergency available',
  22, 'TX-SEP-08867',
  'active', false, false
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Green Valley Septic',
  'green-valley-septic-travis-tx',
  '(512) 555-0514',
  'hello@greenvalleyseptic.com',
  'https://greenvalleyseptic.com',
  '1055 Bee Cave Rd',
  'Bee Cave', 'TX', '78738',
  'Eco-friendly septic services for Travis County homeowners. We use environmentally safe products and offer comprehensive system evaluations to keep your septic running efficiently.',
  ARRAY['pumping','repair','inspection'],
  'Western Travis County and Bee Cave',
  '$280-$475 for standard pumping',
  '2-4 business days',
  6, 'TX-SEP-56221',
  'active', false, false
);

-- ============================================
-- Providers: Wake County, NC (3 providers)
-- ============================================
INSERT INTO providers (county_id, name, slug, phone, email, website, address, city, state, zip, description, services, service_area, pricing_range, response_time, years_in_biz, license_number, status, is_verified, is_claimed) VALUES
(
  'c1000000-0000-0000-0000-000000000002',
  'Carolina Septic Services',
  'carolina-septic-services-wake-nc',
  '(919) 555-0178',
  'info@carolinaseptic.com',
  'https://carolinaseptic.com',
  '456 Falls of Neuse Rd',
  'Raleigh', 'NC', '27609',
  'Carolina Septic Services is Wake County''s trusted provider for residential septic care. We offer pumping, repairs, installations, and 24/7 emergency service with over 20 years of experience.',
  ARRAY['pumping','repair','installation','inspection'],
  'Wake County and surrounding areas',
  '$300-$500 for standard pumping',
  'Same-day available',
  20, 'NC-WW-11348',
  'active', false, false
),
(
  'c1000000-0000-0000-0000-000000000002',
  'Triangle Pumping Co',
  'triangle-pumping-co-wake-nc',
  '(919) 555-0264',
  'service@trianglepumping.com',
  'https://trianglepumping.com',
  '789 Capital Blvd',
  'Raleigh', 'NC', '27604',
  'Fast, affordable septic pumping for the Research Triangle area. We specialize in residential septic maintenance and have served over 5,000 homes across Wake, Durham, and Orange Counties.',
  ARRAY['pumping','inspection'],
  'Raleigh, Durham, Chapel Hill',
  '$275-$425 for standard pumping',
  '24-48 hours',
  12, 'NC-WW-22571',
  'active', false, false
),
(
  'c1000000-0000-0000-0000-000000000002',
  'Tar Heel Septic',
  'tar-heel-septic-wake-nc',
  '(919) 555-0342',
  NULL,
  'https://tarheelseptic.com',
  '567 Holly Springs Rd',
  'Holly Springs', 'NC', '27540',
  'Serving southern Wake County with dependable septic pumping and inspection services. Competitive pricing, straightforward estimates, and friendly technicians you can trust.',
  ARRAY['pumping','repair','inspection'],
  'Holly Springs, Fuquay-Varina, Apex',
  '$250-$400 for standard pumping',
  '2-4 business days',
  7, 'NC-WW-33982',
  'active', false, false
);

-- ============================================
-- Providers: Polk County, FL (3 providers)
-- ============================================
INSERT INTO providers (county_id, name, slug, phone, email, website, address, city, state, zip, description, services, service_area, pricing_range, response_time, years_in_biz, license_number, status, is_verified, is_claimed) VALUES
(
  'c1000000-0000-0000-0000-000000000003',
  'Lakeland Septic Services',
  'lakeland-septic-services-polk-fl',
  '(863) 555-0193',
  'info@lakelandseptic.com',
  'https://lakelandseptic.com',
  '1500 S Florida Ave',
  'Lakeland', 'FL', '33803',
  'Lakeland Septic Services has been the trusted name in Polk County septic care for over 25 years. We offer pumping, repairs, drain field restoration, and new system installations for residential and commercial properties.',
  ARRAY['pumping','repair','installation','inspection'],
  'All of Polk County',
  '$250-$400 for standard pumping',
  'Same-day available',
  25, 'FL-SR-10487',
  'active', false, false
),
(
  'c1000000-0000-0000-0000-000000000003',
  'Sunshine State Septic',
  'sunshine-state-septic-polk-fl',
  '(863) 555-0271',
  'hello@sunshineseptic.com',
  'https://sunshineseptic.com',
  '2800 Hwy 98 N',
  'Bartow', 'FL', '33830',
  'Professional septic services at affordable prices. We serve all of Polk County with fast turnaround times and a commitment to customer satisfaction on every job.',
  ARRAY['pumping','repair','inspection'],
  'Bartow, Winter Haven, Lake Wales',
  '$225-$375 for standard pumping',
  '24-48 hours',
  10, 'FL-SR-20155',
  'active', false, false
),
(
  'c1000000-0000-0000-0000-000000000003',
  'Gator Septic & Plumbing',
  'gator-septic-plumbing-polk-fl',
  '(863) 555-0358',
  'service@gatorseptic.com',
  'https://gatorseptic.com',
  '3200 Cypress Gardens Blvd',
  'Winter Haven', 'FL', '33884',
  'Full-service septic and plumbing company serving Polk County since 2008. We handle residential and commercial septic systems from routine maintenance to emergency repairs and complete installations.',
  ARRAY['pumping','repair','installation','inspection'],
  'Winter Haven, Haines City, Davenport',
  '$275-$450 for standard pumping',
  'Same-day emergency available',
  18, 'FL-SR-30629',
  'active', false, false
);

-- ============================================
-- Default admin user
-- ============================================
INSERT INTO admin_users (email, role) VALUES
('admin@pumpline.com', 'admin');
