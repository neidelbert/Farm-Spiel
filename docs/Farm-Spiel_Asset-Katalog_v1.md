# Farm-Spiel – Asset-Katalog v1

**Mastervorlage:** Küsten-Farmtal-Karte  
**Gesamt:** 200 geplante Basisassets

## Größenstandard

- **1500 px:** Gelände, Straßen und große Untergründe
- **1200 px:** Gebäude, Felder, Ställe/Gehege, Tiere, Fahrzeuge und Maschinen
- **600–800 px:** mittlere Natur-, Wasser-, Brücken- und Hafenobjekte
- **200–300 px:** Kleindeko

## Produktionsregel

Jedes Asset wird als eigene Datei geführt. Wiederholbare Natur- und Straßenobjekte werden als Varianten mehrfach auf der Karte platziert. Interaktive Objekte erhalten zusätzlich separate Hitbox-/Gameplay-Daten.

| Nr. | ID | Bezeichnung | Kategorie | Breite | Pack | Hitbox | Zustände/Animation | Status |
|---:|---|---|---|---:|---|:---:|:---:|---|
| 001 | `ground_meadow_light_01` | Wiese hell – Basis | ground | 1500 px | `01_ground` | – | – | PLAN |
| 002 | `ground_meadow_dark_01` | Wiese dunkel – Basis | ground | 1500 px | `01_ground` | – | – | PLAN |
| 003 | `ground_meadow_flowers_01` | Blumenwiese | ground | 1500 px | `01_ground` | – | – | PLAN |
| 004 | `ground_forest_floor_01` | Waldboden | ground | 1500 px | `01_ground` | – | – | PLAN |
| 005 | `ground_farmyard_dirt_01` | Hofboden Erde | ground | 1500 px | `01_ground` | – | – | PLAN |
| 006 | `ground_dirt_open_01` | Offene Erde | ground | 1500 px | `01_ground` | – | – | PLAN |
| 007 | `ground_mountain_grass_01` | Bergwiese | ground | 1500 px | `01_ground` | – | – | PLAN |
| 008 | `ground_rocky_01` | Felsiger Boden | ground | 1500 px | `01_ground` | – | – | PLAN |
| 009 | `ground_village_paving_01` | Dorfpflaster | ground | 1500 px | `01_ground` | – | – | PLAN |
| 010 | `ground_harbor_wood_01` | Hafen-Holzboden | ground | 1500 px | `01_ground` | – | – | PLAN |
| 011 | `ground_sand_beach_01` | Sandstrand | ground | 1500 px | `01_ground` | – | – | PLAN |
| 012 | `ground_coast_rock_01` | Felsige Küste | ground | 1500 px | `01_ground` | – | – | PLAN |
| 013 | `road_dirt_straight_01` | Erdstraße gerade A | road | 1500 px | `02_roads` | – | – | PLAN |
| 014 | `road_dirt_straight_02` | Erdstraße gerade B | road | 1500 px | `02_roads` | – | – | PLAN |
| 015 | `road_dirt_wide_01` | Breite Hauptstraße | road | 1500 px | `02_roads` | – | – | PLAN |
| 016 | `road_farm_straight_01` | Hofweg gerade | road | 1500 px | `02_roads` | – | – | PLAN |
| 017 | `road_forest_straight_01` | Waldweg gerade | road | 1500 px | `02_roads` | – | – | PLAN |
| 018 | `road_mine_straight_01` | Minenweg gerade | road | 1500 px | `02_roads` | – | – | PLAN |
| 019 | `road_village_straight_01` | Dorfstraße gerade | road | 1500 px | `02_roads` | – | – | PLAN |
| 020 | `road_curve_left_large_01` | Große Linkskurve | road | 1500 px | `02_roads` | – | – | PLAN |
| 021 | `road_curve_right_large_01` | Große Rechtskurve | road | 1500 px | `02_roads` | – | – | PLAN |
| 022 | `road_curve_left_small_01` | Kleine Linkskurve | road | 1500 px | `02_roads` | – | – | PLAN |
| 023 | `road_curve_right_small_01` | Kleine Rechtskurve | road | 1500 px | `02_roads` | – | – | PLAN |
| 024 | `road_s_curve_01` | S-Kurve | road | 1500 px | `02_roads` | – | – | PLAN |
| 025 | `road_t_junction_01` | T-Kreuzung | road | 1500 px | `02_roads` | – | – | PLAN |
| 026 | `road_y_junction_01` | Y-Kreuzung | road | 1500 px | `02_roads` | – | – | PLAN |
| 027 | `road_cross_junction_01` | Vierwege-Kreuzung | road | 1500 px | `02_roads` | – | – | PLAN |
| 028 | `road_farm_entry_01` | Hofeinfahrt | road | 1500 px | `02_roads` | – | – | PLAN |
| 029 | `road_mine_entry_01` | Mineneinfahrt | road | 1500 px | `02_roads` | – | – | PLAN |
| 030 | `road_village_entry_01` | Dorfeinfahrt | road | 1500 px | `02_roads` | – | – | PLAN |
| 031 | `road_harbor_entry_01` | Hafeneinfahrt | road | 1500 px | `02_roads` | – | – | PLAN |
| 032 | `road_edge_left_01` | Straßenrand links | road | 1500 px | `02_roads` | – | – | PLAN |
| 033 | `road_edge_right_01` | Straßenrand rechts | road | 1500 px | `02_roads` | – | – | PLAN |
| 034 | `road_turnaround_01` | Wende-/Ladeplatz | road | 1500 px | `02_roads` | – | – | PLAN |
| 035 | `water_stream_straight_01` | Schmaler Bach gerade | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 036 | `water_stream_curve_01` | Schmaler Bach Kurve | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 037 | `water_river_straight_01` | Fluss gerade | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 038 | `water_river_curve_left_01` | Fluss Linkskurve | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 039 | `water_river_curve_right_01` | Fluss Rechtskurve | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 040 | `water_river_wide_01` | Breiter Fluss | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 041 | `water_river_fork_01` | Flussgabelung | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 042 | `water_pool_mountain_01` | Bergpool | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 043 | `water_pool_mill_01` | Mühlenbecken | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 044 | `water_waterfall_large_01` | Großer Wasserfall | water | 800 px | `03_water` | – | ✓ | PLAN |
| 045 | `water_waterfall_medium_01` | Mittlerer Wasserfall | water | 800 px | `03_water` | – | ✓ | PLAN |
| 046 | `water_waterfall_small_01` | Kleine Kaskade | water | 800 px | `03_water` | – | ✓ | PLAN |
| 047 | `water_rapids_01` | Stromschnellen | water | 800 px | `03_water` | – | ✓ | PLAN |
| 048 | `water_sea_base_01` | Meer – Basis | water | 1500 px | `03_water` | – | ✓ | PLAN |
| 049 | `bridge_stone_large_01` | Große Steinbrücke | bridge_rock | 1200 px | `04_bridges_rocks` | ✓ | – | PLAN |
| 050 | `bridge_stone_small_01` | Kleine Steinbrücke | bridge_rock | 1200 px | `04_bridges_rocks` | ✓ | – | PLAN |
| 051 | `bridge_wood_01` | Holzbrücke | bridge_rock | 1200 px | `04_bridges_rocks` | ✓ | – | PLAN |
| 052 | `bridge_farm_01` | Hof-/Feldbrücke | bridge_rock | 1200 px | `04_bridges_rocks` | ✓ | – | PLAN |
| 053 | `cliff_mountain_large_01` | Große Bergwand | bridge_rock | 800 px | `04_bridges_rocks` | – | – | PLAN |
| 054 | `cliff_mountain_medium_01` | Mittlere Bergwand | bridge_rock | 800 px | `04_bridges_rocks` | – | – | PLAN |
| 055 | `cliff_river_bank_01` | Felsiges Flussufer | bridge_rock | 800 px | `04_bridges_rocks` | – | – | PLAN |
| 056 | `cliff_coast_01` | Küstenklippe | bridge_rock | 800 px | `04_bridges_rocks` | – | – | PLAN |
| 057 | `rock_cluster_large_01` | Große Felsgruppe | bridge_rock | 800 px | `04_bridges_rocks` | – | – | PLAN |
| 058 | `rock_cluster_medium_01` | Mittlere Felsgruppe | bridge_rock | 600 px | `04_bridges_rocks` | – | – | PLAN |
| 059 | `rock_single_large_01` | Großer Einzelstein | bridge_rock | 600 px | `04_bridges_rocks` | – | – | PLAN |
| 060 | `rock_single_small_01` | Kleiner Einzelstein | bridge_rock | 300 px | `04_bridges_rocks` | – | – | PLAN |
| 061 | `tree_pine_tall_01` | Tanne hoch | vegetation | 800 px | `05_vegetation` | – | – | PLAN |
| 062 | `tree_pine_tall_02` | Tanne hoch Variante | vegetation | 800 px | `05_vegetation` | – | – | PLAN |
| 063 | `tree_pine_medium_01` | Tanne mittel | vegetation | 700 px | `05_vegetation` | – | – | PLAN |
| 064 | `tree_pine_small_01` | Tanne klein | vegetation | 600 px | `05_vegetation` | – | – | PLAN |
| 065 | `tree_pine_wide_01` | Tanne breit | vegetation | 800 px | `05_vegetation` | – | – | PLAN |
| 066 | `tree_deciduous_large_01` | Laubbaum groß | vegetation | 800 px | `05_vegetation` | – | – | PLAN |
| 067 | `tree_deciduous_medium_01` | Laubbaum mittel | vegetation | 700 px | `05_vegetation` | – | – | PLAN |
| 068 | `tree_orchard_apple_01` | Apfelbaum | vegetation | 700 px | `05_vegetation` | – | – | PLAN |
| 069 | `tree_orchard_apple_02` | Apfelbaum Variante | vegetation | 700 px | `05_vegetation` | – | – | PLAN |
| 070 | `bush_green_01` | Busch grün | vegetation | 400 px | `05_vegetation` | – | – | PLAN |
| 071 | `bush_flower_pink_01` | Blütenbusch rosa | vegetation | 400 px | `05_vegetation` | – | – | PLAN |
| 072 | `bush_flower_white_01` | Blütenbusch weiß | vegetation | 400 px | `05_vegetation` | – | – | PLAN |
| 073 | `grass_tuft_01` | Grasbüschel A | vegetation | 250 px | `05_vegetation` | – | – | PLAN |
| 074 | `grass_tuft_02` | Grasbüschel B | vegetation | 250 px | `05_vegetation` | – | – | PLAN |
| 075 | `flowers_wild_01` | Wildblumen A | vegetation | 250 px | `05_vegetation` | – | – | PLAN |
| 076 | `flowers_wild_02` | Wildblumen B | vegetation | 250 px | `05_vegetation` | – | – | PLAN |
| 077 | `flowers_sunflower_01` | Sonnenblumen-Gruppe | vegetation | 300 px | `05_vegetation` | – | – | PLAN |
| 078 | `reeds_01` | Schilf | vegetation | 300 px | `05_vegetation` | – | – | PLAN |
| 079 | `tree_stump_01` | Baumstumpf | vegetation | 300 px | `05_vegetation` | – | – | PLAN |
| 080 | `fallen_log_01` | Gefallener Stamm | vegetation | 600 px | `05_vegetation` | – | – | PLAN |
| 081 | `building_farmhouse_lv1` | Hofhaus Level 1 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 082 | `building_farmhouse_lv2` | Hofhaus Level 2 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 083 | `building_barn_lv1` | Scheune Level 1 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 084 | `building_barn_lv2` | Scheune Level 2 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 085 | `building_barn_lv3` | Scheune Level 3 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 086 | `building_silo_lv1` | Silo Level 1 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 087 | `building_silo_lv2` | Silo Level 2 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 088 | `building_silo_lv3` | Silo Level 3 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 089 | `building_garage_lv1` | Garage/Werkstatt Level 1 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 090 | `building_garage_lv2` | Garage/Werkstatt Level 2 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 091 | `building_garage_lv3` | Garage/Werkstatt Level 3 | building_farm | 1200 px | `06_farm_buildings` | ✓ | ✓ | PLAN |
| 092 | `building_loading_shed_01` | Lade-Unterstand | building_farm | 1200 px | `06_farm_buildings` | ✓ | – | PLAN |
| 093 | `building_small_shed_01` | Kleiner Hofschuppen | building_farm | 1200 px | `06_farm_buildings` | ✓ | – | PLAN |
| 094 | `building_machine_shelter_01` | Maschinenunterstand | building_farm | 1200 px | `06_farm_buildings` | ✓ | – | PLAN |
| 095 | `building_storage_small_01` | Kleines Lagerhaus | building_farm | 1200 px | `06_farm_buildings` | ✓ | – | PLAN |
| 096 | `building_farm_mailbox_01` | Hofbriefkasten/Katalog | building_farm | 1200 px | `06_farm_buildings` | ✓ | – | PLAN |
| 097 | `building_mine_01` | Mine | building_industry | 1200 px | `07_industry` | ✓ | – | PLAN |
| 098 | `building_sawmill_01` | Sägewerk | building_industry | 1200 px | `07_industry` | ✓ | – | PLAN |
| 099 | `building_mill_01` | Alte Mühle | building_industry | 1200 px | `07_industry` | ✓ | – | PLAN |
| 100 | `building_mill_wheel_01` | Mühlenrad | building_industry | 800 px | `07_industry` | ✓ | ✓ | PLAN |
| 101 | `building_mine_scaffold_01` | Minen-Holzgerüst | building_industry | 800 px | `07_industry` | ✓ | – | PLAN |
| 102 | `building_mine_tracks_01` | Minen-Schienenbereich | building_industry | 800 px | `07_industry` | ✓ | – | PLAN |
| 103 | `building_sawmill_open_shed_01` | Sägewerk Holzhalle | building_industry | 800 px | `07_industry` | ✓ | – | PLAN |
| 104 | `building_mill_dock_01` | Mühlen-Arbeitssteg | building_industry | 800 px | `07_industry` | ✓ | – | PLAN |
| 105 | `building_mine_cart_station_01` | Lorenstation | building_industry | 800 px | `07_industry` | ✓ | – | PLAN |
| 106 | `building_church_01` | Kirche | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 107 | `building_bakery_01` | Bäckerei | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 108 | `building_market_house_01` | Markthaus | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 109 | `building_shop_01` | Dorfladen | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 110 | `building_tavern_01` | Gasthaus | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 111 | `building_house_01` | Wohnhaus A | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 112 | `building_house_02` | Wohnhaus B | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 113 | `building_house_03` | Wohnhaus C | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 114 | `building_house_04` | Wohnhaus D | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 115 | `building_house_05` | Wohnhaus E | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 116 | `building_market_stall_red_01` | Marktstand rot/weiß | building_village | 800 px | `08_village` | ✓ | – | PLAN |
| 117 | `building_market_stall_green_01` | Marktstand grün/weiß | building_village | 800 px | `08_village` | ✓ | – | PLAN |
| 118 | `building_village_fountain_01` | Dorfbrunnen | building_village | 800 px | `08_village` | ✓ | – | PLAN |
| 119 | `building_village_small_house_01` | Kleines Dorfhaus | building_village | 1200 px | `08_village` | ✓ | – | PLAN |
| 120 | `building_harbor_warehouse_01` | Hafenlager | harbor | 1200 px | `09_harbor` | ✓ | – | PLAN |
| 121 | `building_fishery_01` | Fischerei | harbor | 1200 px | `09_harbor` | ✓ | – | PLAN |
| 122 | `building_lighthouse_01` | Leuchtturm | harbor | 1200 px | `09_harbor` | ✓ | – | PLAN |
| 123 | `building_lighthouse_house_01` | Leuchtturmhaus | harbor | 1200 px | `09_harbor` | ✓ | – | PLAN |
| 124 | `harbor_pier_large_01` | Großer Hafensteg | harbor | 800 px | `09_harbor` | ✓ | – | PLAN |
| 125 | `harbor_pier_small_01` | Kleiner Hafensteg | harbor | 800 px | `09_harbor` | ✓ | – | PLAN |
| 126 | `harbor_loading_platform_01` | Hafen-Ladeplattform | harbor | 800 px | `09_harbor` | ✓ | – | PLAN |
| 127 | `harbor_crane_small_01` | Kleiner Hafenkran | harbor | 800 px | `09_harbor` | ✓ | – | PLAN |
| 128 | `harbor_breakwater_01` | Wellenbrecher | harbor | 800 px | `09_harbor` | ✓ | – | PLAN |
| 129 | `harbor_rock_islet_01` | Felsinsel klein | harbor | 800 px | `09_harbor` | ✓ | – | PLAN |
| 130 | `harbor_mooring_posts_01` | Anlegepfähle | harbor | 600 px | `09_harbor` | ✓ | – | PLAN |
| 131 | `field_empty_01` | Leeres Feld | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 132 | `field_prepared_01` | Vorbereitetes Feld | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 133 | `field_seeded_01` | Gesätes Feld | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 134 | `field_wheat_stage_01` | Weizen – Keimlinge | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 135 | `field_wheat_stage_02` | Weizen – jung | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 136 | `field_wheat_stage_03` | Weizen – mittel | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 137 | `field_wheat_stage_04` | Weizen – fast reif | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 138 | `field_wheat_ready_01` | Weizen – erntereif | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 139 | `field_wheat_harvested_01` | Weizen – abgeerntet | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 140 | `field_vegetable_01` | Gemüsefeld A | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 141 | `field_vegetable_02` | Gemüsefeld B | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 142 | `field_sunflower_01` | Sonnenblumenfeld | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 143 | `field_flower_01` | Blumenfeld | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 144 | `field_grass_reserved_01` | Leere Feldreserve/Wiese | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 145 | `field_orchard_plot_01` | Obstgartenfläche | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 146 | `field_fodder_01` | Futterpflanzenfeld | field | 1200 px | `10_fields` | ✓ | ✓ | PLAN |
| 147 | `pen_chicken_empty_01` | Hühnergehege leer | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 148 | `pen_chicken_active_01` | Hühnergehege aktiv | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 149 | `pen_sheep_empty_01` | Schafweide leer | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 150 | `pen_sheep_active_01` | Schafweide aktiv | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 151 | `pen_cow_empty_01` | Kuhweide leer | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 152 | `pen_cow_active_01` | Kuhweide aktiv | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 153 | `pen_horse_empty_01` | Pferdepaddock leer | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 154 | `pen_horse_active_01` | Pferdepaddock aktiv | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 155 | `pen_feed_station_01` | Futterstation | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 156 | `pen_water_trough_01` | Tiertränke | animal_pen | 1200 px | `11_animal_pens` | ✓ | ✓ | PLAN |
| 157 | `animal_chicken_white_01` | Huhn weiß | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 158 | `animal_chicken_brown_01` | Huhn braun | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 159 | `animal_chicken_red_01` | Huhn rotbraun | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 160 | `animal_sheep_white_01` | Schaf weiß | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 161 | `animal_sheep_gray_01` | Schaf grau | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 162 | `animal_cow_blackwhite_01` | Kuh schwarz/weiß | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 163 | `animal_cow_brownwhite_01` | Kuh braun/weiß | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 164 | `animal_cow_brown_01` | Kuh braun | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 165 | `animal_horse_brown_01` | Pferd braun | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 166 | `animal_horse_black_01` | Pferd schwarz | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 167 | `animal_horse_white_01` | Pferd hell | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 168 | `animal_rabbit_white_01` | Kaninchen weiß | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 169 | `animal_rabbit_brown_01` | Kaninchen braun | animal | 1200 px | `12_animals` | ✓ | ✓ | PLAN |
| 170 | `vehicle_tractor_old_01` | Alter Traktor | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 171 | `vehicle_tractor_restored_01` | Restaurierter Traktor | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 172 | `vehicle_combine_old_01` | Alter Mähdrescher | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 173 | `vehicle_combine_restored_01` | Restaurierter Mähdrescher | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 174 | `vehicle_seed_drill_01` | Sämaschine | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 175 | `vehicle_farm_trailer_01` | Landwirtschaftsanhänger | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 176 | `vehicle_fertilizer_spreader_01` | Düngerstreuer | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 177 | `vehicle_delivery_van_red_01` | Roter Lieferwagen | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 178 | `vehicle_post_van_01` | Postauto | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 179 | `vehicle_scrap_truck_01` | Schrott-LKW | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 180 | `vehicle_animal_transporter_01` | Tiertransporter | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 181 | `vehicle_construction_van_01` | Handwerkerfahrzeug | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 182 | `vehicle_flatbed_01` | Tieflader | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 183 | `vehicle_small_truck_01` | Kleiner Transport-LKW | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 184 | `vehicle_fishing_boat_01` | Fischkutter | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 185 | `vehicle_sailboat_01` | Segelboot | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 186 | `vehicle_small_boat_01` | Kleines Boot | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 187 | `vehicle_mine_cart_01` | Minenlore | vehicle | 1200 px | `13_vehicles` | ✓ | ✓ | PLAN |
| 188 | `prop_wood_crate_01` | Holzkiste | prop | 300 px | `14_props` | – | – | PLAN |
| 189 | `prop_barrel_01` | Fass | prop | 300 px | `14_props` | – | – | PLAN |
| 190 | `prop_sack_01` | Sack | prop | 250 px | `14_props` | – | – | PLAN |
| 191 | `prop_pallet_01` | Palette | prop | 300 px | `14_props` | – | – | PLAN |
| 192 | `prop_log_stack_01` | Holzstapel | prop | 600 px | `14_props` | – | – | PLAN |
| 193 | `prop_board_stack_01` | Bretterstapel | prop | 600 px | `14_props` | – | – | PLAN |
| 194 | `prop_hay_bale_01` | Heuballen | prop | 300 px | `14_props` | – | – | PLAN |
| 195 | `prop_street_lamp_01` | Straßenlaterne | prop | 300 px | `14_props` | – | – | PLAN |
| 196 | `prop_bench_01` | Bank | prop | 300 px | `14_props` | – | – | PLAN |
| 197 | `prop_signpost_01` | Wegweiser | prop | 300 px | `14_props` | – | – | PLAN |
| 198 | `prop_fence_wood_01` | Holzzaun gerade | prop | 600 px | `14_props` | – | – | PLAN |
| 199 | `prop_fence_corner_01` | Holzzaun Ecke | prop | 600 px | `14_props` | – | – | PLAN |
| 200 | `prop_gate_wood_01` | Holztor | prop | 600 px | `14_props` | – | – | PLAN |
