-- Mini Freds Collection Tracker: Seed Data
-- 50+ Austin A35 van models across 7 manufacturers

INSERT INTO items (name, manufacturer, range_name, reference_number, scale, livery, rarity, status, notes)
VALUES
  -- Vanguards/Lledo (14 models)
  (''RAC Road Service'', ''Vanguards'', ''VA'', ''VA17000'', ''1:43'', ''Blue/White'', ''rare'', ''confirmed'', ''Original release''),
  (''Austin Sales & Service'', ''Vanguards'', ''VA'', ''VA17001'', ''1:43'', ''Blue/White'', ''common'', ''confirmed'', ''''),
  (''Barkers of Kensington'', ''Vanguards'', ''VA'', ''VA17002'', ''1:43'', ''Cream'', ''uncommon'', ''confirmed'', ''''),
  (''Mackeson'', ''Vanguards'', ''VA'', ''VA17003'', ''1:43'', ''Dark Blue/White'', ''rare'', ''confirmed'', ''''),
  (''Securicor Radio Patrol'', ''Vanguards'', ''VA'', ''VA17004'', ''1:43'', ''Dark Blue/White'', ''uncommon'', ''confirmed'', ''''),
  (''Wiltshire Constabulary'', ''Vanguards'', ''VA'', ''VA17005'', ''1:43'', ''White/Blue'', ''epic'', ''confirmed'', ''Police van''),
  (''Midlands Electricity Board'', ''Vanguards'', ''VA'', ''VA01706'', ''1:43'', ''Yellow/Black'', ''uncommon'', ''confirmed'', ''''),
  (''British Railways'', ''Vanguards'', ''VA'', ''VA01707'', ''1:43'', ''Red/Cream'', ''rare'', ''confirmed'', ''''),
  (''Hidden Treasures'', ''Vanguards'', ''VA'', ''VA01708'', ''1:43'', ''Dark Blue'', ''uncommon'', ''confirmed'', ''''),
  (''Post Office Telephones'', ''Vanguards'', ''VA'', ''VA01709'', ''1:43'', ''Yellow/Black'', ''rare'', ''confirmed'', ''''),
  (''Drive Time Collectors Club 2007'', ''Vanguards'', ''VA'', ''VA01710'', ''1:43'', ''Blue'', ''epic'', ''confirmed'', ''Collectors club exclusive''),
  (''AA Technical Services'', ''Vanguards'', ''VA'', ''VATC1'', ''1:43'', ''Yellow'', ''uncommon'', ''confirmed'', ''AA Roadside''),
  (''Shell Petrol'', ''Vanguards'', ''VA'', ''VASH1'', ''1:43'', ''Red/Yellow'', ''uncommon'', ''confirmed'', ''''),
  (''Pickfords Removals'', ''Vanguards'', ''VA'', ''VAPK1'', ''1:43'', ''Brown/Cream'', ''rare'', ''confirmed'', ''''),

  -- Corgi Classics (6 models)
  (''Cadbury'\''s Dairy Milk'', ''Corgi Classics'', ''CC'', ''61209'', ''1:43'', ''Purple/Yellow'', ''uncommon'', ''confirmed'', ''''),
  (''Austin Service'', ''Corgi Classics'', ''CC'', ''67301'', ''1:43'', ''Blue/White'', ''common'', ''confirmed'', ''''),
  (''Guinness Collectors Club 1999'', ''Corgi Classics'', ''CC'', ''67303'', ''1:43'', ''Black/Cream'', ''epic'', ''confirmed'', ''''),
  (''LHE Finance Ltd - Norman'', ''Corgi Classics'', ''CC'', ''67305'', ''1:43'', ''Cream'', ''rare'', ''confirmed'', ''''),
  (''Southdown Motor Services'', ''Corgi'', ''CC'', ''CC80501'', ''1:43'', ''Green/Cream'', ''uncommon'', ''confirmed'', ''2001 Collectors club''),
  (''Wallace & Gromit - Curse of the Were-Rabbit'', ''Corgi'', ''W&G'', ''CC80502'', ''1:43'', ''Yellow/Black'', ''epic'', ''confirmed'', ''''),

  -- Days Gone / Lledo (11 models)
  (''AA Technical Services'', ''Days Gone'', ''DG'', ''DG197000'', ''1:43'', ''Yellow'', ''uncommon'', ''confirmed'', ''''),
  (''Eddie Stobart Express'', ''Days Gone'', ''DG'', ''DG197001'', ''1:43'', ''Maroon/White'', ''uncommon'', ''confirmed'', ''''),
  (''Royal Mail'', ''Days Gone'', ''DG'', ''DG197002'', ''1:43'', ''Red'', ''common'', ''confirmed'', ''''),
  (''RAC Road Service'', ''Days Gone'', ''DG'', ''DG197003'', ''1:43'', ''Yellow/Blue'', ''uncommon'', ''confirmed'', ''''),
  (''Smarties - Rowntree'', ''Days Gone'', ''DG'', ''DG197004'', ''1:43'', ''Red/Yellow'', ''rare'', ''confirmed'', ''''),
  (''Gale'\''s Honey'', ''Days Gone'', ''DG'', ''DG197005'', ''1:43'', ''Gold/Blue'', ''rare'', ''confirmed'', ''''),
  (''Midlands Electricity'', ''Days Gone'', ''DG'', ''DG197007'', ''1:43'', ''Yellow/Black'', ''uncommon'', ''confirmed'', ''''),
  (''MacFisheries'', ''Days Gone'', ''DG'', ''DG197008'', ''1:43'', ''White/Red'', ''uncommon'', ''confirmed'', ''''),
  (''National Grid'', ''Days Gone'', ''DG'', ''DG197009'', ''1:43'', ''Orange'', ''uncommon'', ''confirmed'', ''''),
  (''Castrol Motor Oil'', ''Days Gone'', ''DG'', ''DG197010'', ''1:43'', ''Green/Yellow'', ''uncommon'', ''confirmed'', ''''),
  (''BT Telephones'', ''Days Gone'', ''DG'', ''DG197011'', ''1:43'', ''Blue/Yellow'', ''uncommon'', ''confirmed'', ''''),

  -- Lledo Promotional (4 models)
  (''St Kew Dairy Farm'', ''Lledo'', ''LP'', ''LP197-1001'', ''1:43'', ''White/Red'', ''epic'', ''confirmed'', ''Promotional''),
  (''Chiltern Hills Vintage Rally 2004'', ''Lledo'', ''LP'', ''LP197-1002'', ''1:43'', ''Cream/Red'', ''legendary'', ''confirmed'', ''Limited edition event''),
  (''RNLI - Royal National Lifeboat'', ''Lledo'', ''LP'', ''LP197-1004'', ''1:43'', ''Orange/White'', ''rare'', ''confirmed'', ''''),
  (''Enfield Pageant 2007'', ''Lledo'', ''LP'', ''LP197-1005'', ''1:43'', ''Cream'', ''epic'', ''confirmed'', ''Veteran Vehicle Trust''),

  -- Magazine Issues (1 model)
  (''Hoover'', ''Lledo'', ''Magazine'', ''Issue 65'', ''1:43'', ''Beige/Blue'', ''epic'', ''confirmed'', ''Magazine issue 65 exclusive''),

  -- SRC Models (4 models)
  (''RAC Blue/White'', ''SRC Models'', ''SRC'', ''SRCM1'', ''1:43'', ''Blue/White'', ''legendary'', ''confirmed'', ''White metal specialist model''),
  (''Coventry Climax Yellow'', ''SRC Models'', ''SRC'', ''SRCC1'', ''1:43'', ''Yellow/Black'', ''legendary'', ''confirmed'', ''Specialist casting''),
  (''AEC Yellow'', ''SRC Models'', ''SRC'', ''SRCA1'', ''1:43'', ''Yellow'', ''legendary'', ''confirmed'', ''Rare specialist model''),
  (''Pickfords Brown'', ''SRC Models'', ''SRC'', ''SRCP1'', ''1:43'', ''Brown/Cream'', ''legendary'', ''confirmed'', ''Specialist model''),

  -- Promod Kits (3 models)
  (''White Metal Kit - Generic'', ''Promod'', ''Kit'', ''PRO-A35-01'', ''1:43'', ''Unpainted'', ''legendary'', ''kit'', ''White metal resin kit''),
  (''White Metal Kit - Commercial'', ''Promod'', ''Kit'', ''PRO-A35-02'', ''1:43'', ''Unpainted'', ''legendary'', ''kit'', ''Requires assembly''),
  (''White Metal Kit - Special'', ''Promod'', ''Kit'', ''PRO-A35-03'', ''1:43'', ''Unpainted'', ''legendary'', ''kit'', ''Premium kit''),

  -- Pocketbond Classix 1:76 (9 models)
  (''RAC Radio Rescue'', ''Pocketbond'', ''Classix'', ''EM76663'', ''1:76'', ''Yellow/Blue'', ''common'', ''non-1:43'', '1:76 scale''),
  (''British Railways'', ''Pocketbond'', ''Classix'', ''EM76664'', ''1:76'', ''Red/Cream'', ''common'', ''non-1:43'', ''1:76 scale''),
  (''Plain Green'', ''Pocketbond'', ''Classix'', ''EM76665'', ''1:76'', ''Green'', ''uncommon'', ''non-1:43'', ''1:76 scale''),
  (''Securicor Radio'', ''Pocketbond'', ''Classix'', ''EM76666'', ''1:76'', ''Dark Blue/White'', ''common'', ''non-1:43'', ''1:76 scale''),
  (''Royal Mail'', ''Pocketbond'', ''Classix'', ''EM76667'', ''1:76'', ''Red'', ''common'', ''non-1:43'', ''1:76 scale''),
  (''Telephone Engineer'', ''Pocketbond'', ''Classix'', ''EM76668'', ''1:76'', ''Orange/Yellow'', ''uncommon'', ''non-1:43'', ''1:76 scale''),
  (''Milk Float'', ''Pocketbond'', ''Classix'', ''EM76669'', ''1:76'', ''White'', ''uncommon'', ''non-1:43'', ''1:76 scale''),
  (''Gas Supply'', ''Pocketbond'', ''Classix'', ''EM76670'', ''1:76'', ''Yellow/Blue'', ''uncommon'', ''non-1:43'', ''1:76 scale''),
  (''Electricity Board'', ''Pocketbond'', ''Classix'', ''EM76671'', ''1:76'', ''Orange/Yellow'', ''uncommon'', ''non-1:43'', ''1:76 scale'');
