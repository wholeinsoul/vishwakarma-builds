-- Partypop Seed Data: 10 Theme Templates
-- Run this after schema.sql

INSERT INTO theme_templates (slug, name, emoji, description, color_primary, color_secondary, prompt_context, age_min, age_max, sort_order) VALUES

('dinosaurs', 'Dinosaur Adventure', '🦕', 'A prehistoric adventure party! Fossil digs, dino eggs, and jungle decorations.', '#22c55e', '#15803d',
'Theme: Dinosaur Adventure 🦕
Context: A prehistoric adventure party! Think fossil digs, dino eggs, lush jungle decorations with green/brown palette.
Iconic elements: fossil excavation activity, dino egg hunt, volcano cake, pterodactyl toss game.
Color scheme: forest green, brown, tan.
Music suggestions: Jurassic Park theme, jungle sounds.
Popular decorations: inflatable dinosaurs, jungle vines, fossil prints, dino footprint trail.',
2, 10, 10),

('princess', 'Royal Princess Ball', '👑', 'A magical royal celebration with tiaras, castles, and enchanted fun.', '#ec4899', '#be185d',
'Theme: Royal Princess Ball 👑
Context: A magical royal celebration! Think tiaras, castle decorations, tulle, and glitter.
Iconic elements: crown decorating station, royal decree scroll, princess dress-up, magic wand craft.
Color scheme: pink, gold, lavender, white.
Music suggestions: Disney princess soundtrack, classical waltz music.
Popular decorations: castle backdrop, tulle draping, gold balloons, tiara centerpieces.',
3, 10, 20),

('superhero', 'Superhero Training Camp', '🦸', 'An action-packed hero training adventure with obstacles and missions.', '#3b82f6', '#1d4ed8',
'Theme: Superhero Training Camp 🦸
Context: An action-packed hero training adventure! Think obstacle courses, cape making, and villain challenges.
Iconic elements: cape and mask making station, obstacle course, superhero training certificates, villain target practice.
Color scheme: bold red, blue, yellow with comic-style accents.
Music suggestions: superhero movie themes, upbeat action music.
Popular decorations: comic book panels, POW/BAM signs, cityscape backdrop, star bursts.',
4, 12, 30),

('sports', 'All-Star Sports Day', '⚽', 'An active sports tournament with mini-games and team spirit.', '#f97316', '#ea580c',
'Theme: All-Star Sports Day ⚽
Context: An energetic sports party! Think mini tournaments, team jerseys, and victory celebrations.
Iconic elements: mini tournament bracket, medal ceremony, sports trivia, relay races.
Color scheme: team colors - green field, white lines, bright accents.
Music suggestions: stadium anthems, We Will Rock You, eye of the tiger.
Popular decorations: pennant banners, sports ball centerpieces, scoreboard, trophy display.',
5, 14, 40),

('unicorn', 'Magical Unicorn Party', '🦄', 'A rainbow-filled magical celebration with sparkles and enchantment.', '#a855f7', '#7c3aed',
'Theme: Magical Unicorn Party 🦄
Context: A rainbow-filled magical celebration! Think pastel colors, sparkles, and enchanted activities.
Iconic elements: unicorn horn headband craft, rainbow ring toss, magical potion making (colored drinks), glitter slime station.
Color scheme: pastel rainbow - pink, purple, blue, mint with gold accents.
Music suggestions: magical fairy music, upbeat pop songs.
Popular decorations: rainbow arch balloon display, iridescent streamers, unicorn centerpieces, cloud cotton candy station.',
3, 9, 50),

('minecraft', 'Minecraft World', '⛏️', 'A pixelated block-building adventure with crafting and exploration.', '#65a30d', '#4d7c0f',
'Theme: Minecraft World ⛏️
Context: A pixelated block-building adventure! Think pixel art, TNT, and crafting tables.
Iconic elements: pixel art craft station, creeper target practice, block building challenge, treasure chest hunt.
Color scheme: Minecraft green, brown (dirt), grey (stone), blue (diamond).
Music suggestions: Minecraft soundtrack, C418 ambient music.
Popular decorations: pixel block props, creeper faces, torch lights, crafting table centerpiece, cardboard sword/pickaxe props.',
6, 14, 60),

('space', 'Outer Space Explorer', '🚀', 'A cosmic journey through the stars with rockets, planets, and alien encounters.', '#6366f1', '#4f46e5',
'Theme: Outer Space Explorer 🚀
Context: A cosmic adventure through the galaxy! Think rockets, planets, stars, and astronaut training.
Iconic elements: rocket ship craft, planet painting station, astronaut training obstacle course, alien slime making.
Color scheme: deep navy, silver, purple with star accents.
Music suggestions: Space Oddity, Star Wars theme, cosmic ambient sounds.
Popular decorations: hanging planets, star garlands, rocket ship centerpiece, glow-in-the-dark stars, astronaut photo cutout.',
4, 12, 70),

('ocean', 'Under the Sea', '🐠', 'A deep-sea underwater adventure with marine life and ocean treasures.', '#06b6d4', '#0891b2',
'Theme: Under the Sea 🐠
Context: A deep-sea underwater adventure! Think coral reefs, sea creatures, and buried treasure.
Iconic elements: fish craft station, treasure chest hunt, ocean sensory bins, bubble station, seashell decorating.
Color scheme: ocean blue, teal, coral, sandy gold.
Music suggestions: Under the Sea (Little Mermaid), ocean wave sounds, beach music.
Popular decorations: blue streamers (water), hanging fish and jellyfish, seashell garlands, fishing net draping, bubble machine.',
2, 8, 80),

('construction', 'Construction Zone', '🏗️', 'A building and digging adventure with hard hats and heavy equipment.', '#eab308', '#ca8a04',
'Theme: Construction Zone 🏗️
Context: A building and digging adventure! Think hard hats, dump trucks, and construction sites.
Iconic elements: building block challenge, sandbox digging station, hard hat decorating, dump truck relay race.
Color scheme: construction yellow, orange, black stripes.
Music suggestions: upbeat work songs, Bob the Builder theme.
Popular decorations: caution tape, traffic cones, construction signs, cardboard bulldozer, dirt/gravel table centerpiece.',
3, 8, 90),

('safari', 'Wild Safari Adventure', '🦁', 'An exciting jungle safari expedition with wild animals and exploration.', '#84cc16', '#65a30d',
'Theme: Wild Safari Adventure 🦁
Context: An exciting jungle safari expedition! Think binoculars, animal prints, and jeep rides.
Iconic elements: animal track identification game, binocular craft, safari scavenger hunt, face painting station.
Color scheme: safari tan, jungle green, animal prints (leopard, zebra).
Music suggestions: The Lion King soundtrack, African drum music, jungle sounds.
Popular decorations: animal print tablecloths, stuffed animals, palm leaves, binocular props, jeep photo backdrop.',
3, 10, 100);
