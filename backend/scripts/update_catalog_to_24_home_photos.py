"""Script to update Home Essentials products with the 24 approved photo items."""
import os
import sys

new_home_products = '''    # =========================================================================
    # 4. HOME ESSENTIALS (24 Approved Photographic Products: IDs 263-286)
    # =========================================================================
    (263, "SP-H001", "Royal Decorative Diya Gift Set – 12 Pieces", "home", "Diyas & Deepams", "Festive Decor", "SaleSphere", 1499, 2299,
     ["Maroon", "Gold"], ["Set of 12"], "Handcrafted Clay & Gold Enamel", "Diwali / Festive Gifting", "Festive/Autumn", 4.9, 340,
     ["diwali", "festive", "bestseller", "giftset", "home"], "/photos_for_homeessential/1d54ed9d-5e50-46ec-8407-7c711e1a8d02.jpg",
     "Exquisite presentation gift box containing 12 hand-painted maroon and gold floral terracotta oil diyas for Diwali poojas and gifting."),

    (264, "SP-H002", "Brass Lotus Diya Set", "home", "Diyas & Deepams", "Festive Decor", "SaleSphere", 1299, 1899,
     ["Brass / Gold"], ["Set of 4"], "Pure Cast Brass", "Diwali / Mandir Aarti", "All Season", 4.9, 420,
     ["diwali", "festive", "bestseller", "home"], "/photos_for_homeessential/2b8d8f73-42be-4ba9-8c2d-0a9538b8b70a.jpg",
     "Set of 4 blooming lotus-petal cast brass oil lamps with elevated pedestal bases, radiating divine warmth across prayer altars."),

    (265, "SP-H003", "Golden LED Curtain Fairy Lights", "home", "Festive Lighting", "Festive Decor", "SaleSphere", 1499, 2199,
     ["Warm Gold"], ["3m x 2m"], "Insulated Copper Wire & High-Lumen LEDs", "Diwali / Festive Celebrations", "Festive/Autumn", 4.8, 510,
     ["diwali", "festive", "lighting", "home"], "/photos_for_homeessential/3d0b11cb-1948-4ddd-973e-aee246f2f6f5.jpg",
     "Dazzling waterfall curtain of golden warm-white micro LED string lights with multi-mode controller, transforming sheer drapes into a shimmering palace backdrop."),

    (266, "SP-H004", "Grand Diwali Living Room Décor Collection", "home", "Festive Home Styling", "Festive Decor", "SaleSphere", 1999, 2999,
     ["Gold", "Maroon", "Multi"], ["Grand Lifestyle Set"], "Brass, Silk, Florals & Wax Accents", "Diwali / Grand Celebrations", "Festive/Autumn", 5.0, 280,
     ["diwali", "festive", "bestseller", "styling", "home"], "/photos_for_homeessential/bc14e333-472a-429e-b428-e95551bf48b8.jpg",
     "Curated grand festive celebration styling suite featuring brass floor lanterns, ceremonial marigold doorway torans, illuminated urlis, and royal dining accents."),

    (267, "SP-H005", "Lakshmi Ganesha Festive Idol Set", "home", "Pooja Essentials", "Festive Decor", "SaleSphere", 1999, 2999,
     ["Antique Brass"], ["7 Inch Pair"], "Pure Sand-Cast Brass & Teak Chowki", "Diwali Lakshmi Pujan / Mandir", "All Season", 4.9, 630,
     ["diwali", "festive", "bestseller", "pooja", "home"], "/photos_for_homeessential/6a98c18e-14e3-4057-87f5-073636f4adea.jpg",
     "Sanctified solid brass murtis of Lord Ganesha and Goddess Lakshmi in blessing abhaya mudra, seated gracefully on an engraved wooden altar bajot with marigold trim."),

    (268, "SP-H006", "Floating Lotus Diya Urli Set", "home", "Urli & Brass Décor", "Festive Decor", "SaleSphere", 1499, 2199,
     ["Brass / Gold", "Multi"], ["12 Inch Urli with 12 Candles"], "Pure Brass & Scented Paraffin/Soy Wax", "Diwali / Living Foyer", "Festive/Autumn", 4.8, 390,
     ["diwali", "festive", "bestseller", "urli", "home"], "/photos_for_homeessential/7b66deb1-6494-4fc3-af69-88746a7e321b.jpg",
     "Shallow spun brass water vessel paired with a dozen multi-hued floating wax lotus candles, creating an enchanting illuminated centerpiece for foyers and tables."),

    (269, "SP-H007", "Antique Brass Decorative Lantern", "home", "Lanterns & Kandils", "Festive Decor", "SaleSphere", 1699, 2499,
     ["Antique Brass"], ["14 Inch Tall"], "Sheet Brass & Textured Glass Panels", "Diwali / Living & Balcony", "All Season", 4.8, 245,
     ["diwali", "festive", "lantern", "home"], "/photos_for_homeessential/8b72c4b7-b660-4093-8fd6-ffe4f7a40286.jpg",
     "Hexagonal antique brass pillar lantern featuring intricate cutwork filigree dome, textured amber glass side panels, and top suspension ring for romantic candlelight."),

    (270, "SP-H008", "Traditional Festive Table Décor Set", "home", "Festive Home Styling", "Festive Decor", "SaleSphere", 1799, 2699,
     ["Maroon", "Gold"], ["Full Banquet Styling Suite"], "Banarasi Silk Brocade & Cast Brass", "Diwali Feasts / Family Gatherings", "Festive/Autumn", 4.8, 195,
     ["diwali", "festive", "dining", "home"], "/photos_for_homeessential/8ccf57ef-0014-4e64-b155-af6f31bd83ff.jpg",
     "Regal dining styling set comprising a heavy maroon zari runner, tall polished brass taper candle holders, votive tea-light cups, and sculpted brass peacock accent."),

    (271, "SP-H009", "Traditional Hanging Diwali Kandil", "home", "Lanterns & Kandils", "Festive Decor", "SaleSphere", 1299, 1899,
     ["Crimson Red", "Gold"], ["24 Inch Hanging"], "Artisan Cardstock, Translucent Paper & Silk Tassels", "Diwali / Balcony Illuminations", "Festive/Autumn", 4.9, 480,
     ["diwali", "festive", "bestseller", "kandil", "home"], "/photos_for_homeessential/9f78caa2-4c5d-451c-9031-5ed3f7e13aa5.jpg",
     "Geometric star-shaped traditional Akash Diva with gold floral foil motifs, crown fretwork crest, and flowing pleated streamers that illuminate evening balconies."),

    (272, "SP-H010", "Brass Urli with Floating Flower Décor", "home", "Urli & Brass Décor", "Festive Decor", "SaleSphere", 1799, 2699,
     ["Brass / Gold"], ["14 Inch Beaten Urli"], "100% Solid Beaten Virgin Brass", "Diwali / Welcoming Entrances", "All Season", 4.9, 560,
     ["diwali", "festive", "bestseller", "urli", "home"], "/photos_for_homeessential/31fec69b-c1a9-4ac7-b26c-1987173c2ab8.jpg",
     "Artisan hand-hammered heavy brass urli bowl fitted with ornate double-loop handles, floating fresh marigolds, crimson rose petals, and glowing clay oil deepams."),

    (273, "SP-H011", "Handcrafted Traditional Diya Set", "home", "Diyas & Deepams", "Festive Decor", "SaleSphere", 1199, 1699,
     ["Maroon", "Gold"], ["Set of 9"], "Terracotta Clay & Metallic Gold Acrylic", "Diwali / Home Illumination", "Festive/Autumn", 4.7, 310,
     ["diwali", "festive", "diyas", "home"], "/photos_for_homeessential/79c9c98e-3b08-4bb4-addb-bc18bd3cb5f1.jpg",
     "Curated collection of 9 assorted hand-molded clay oil lamps featuring lotus, oval, and fluted silhouettes painted in deep vermillion and gilded borders."),

    (274, "SP-H012", "Festive Embroidered Cushion Cover Set", "home", "Festive Home Styling", "Festive Decor", "SaleSphere", 1499, 2199,
     ["Maroon", "Gold", "Ivory"], ["Set of 5 (16x16 Inch)"], "Pure Velvet Silk & Resham Zari Thread", "Diwali / Festive Living", "All Season", 4.8, 440,
     ["festive", "cushions", "bestseller", "home"], "/photos_for_homeessential/951ebd10-05d6-47a6-8f40-3d4f259f1e57.jpg",
     "Luxury 5-piece royal cushion set boasting royal tree-of-life floral needlework, ceremonial royal elephant motifs, and gilded piping on plush velvet and raw silk."),

    (275, "SP-H013", "Traditional Decorative Rangoli Mat", "home", "Rangoli & Floor Décor", "Festive Decor", "SaleSphere", 1499, 2199,
     ["Maroon", "Gold", "Ivory"], ["24 Inch Round Mat"], "Embossed Acrylic, Velvet Base & Kundan Gems", "Diwali / Griha Pravesh / Mandir", "All Season", 4.8, 280,
     ["diwali", "festive", "rangoli", "home"], "/photos_for_homeessential/54823c4a-19b9-4c7a-8cdc-2d0f910a80fa.jpg",
     "Reusable circular mandala floor rangoli mat embellished with gold filigree flourishes, pearl drops, and center brass diya seat for instantaneous mess-free courtyard styling."),

    (276, "SP-H014", "Festive Door Entrance Toran Décor Set", "home", "Entrance Décor & Torans", "Festive Decor", "SaleSphere", 1799, 2699,
     ["Marigold Yellow", "Orange", "Green"], ["Full Door Arch (3.8 ft)"], "Fluffy Marigold Florals, Mango Leaves & Brass Latkans", "Diwali / Housewarming / Puja Entry", "All Season", 4.9, 590,
     ["diwali", "festive", "bestseller", "toran", "entrance", "home"], "/photos_for_homeessential/77693b4e-d814-4e2e-8492-c060d55119eb.jpg",
     "Complete entryway blessing set showcasing layered yellow and saffron marigold arches, fresh-look mango leaves, brass hanging bells, and twin floral drop side panels."),

    (277, "SP-H015", "Rangoli Colour Powder Gift Set", "home", "Rangoli & Floor Décor", "Festive Decor", "SaleSphere", 1099, 1599,
     ["Multi"], ["5 Bowls with Stencil & Spoon"], "Herbal Cornstarch Organic Pigments & Brass Tools", "Diwali / Navratri Celebrations", "Festive/Autumn", 4.8, 360,
     ["diwali", "festive", "rangoli", "giftset", "home"], "/photos_for_homeessential/a76420a5-1eaf-4cf7-9d46-c1d39cafc933.jpg",
     "Artisanal rangoli toolkit presenting five natural, skin-safe herbal color pigments (saffron, pink, emerald, white, royal purple) accompanied by a laser-cut brass lotus stencil and measuring spoon."),

    (278, "SP-H016", "Brass Pooja Kalash Set", "home", "Pooja Essentials", "Festive Decor", "SaleSphere", 1599, 2399,
     ["Brass / Gold"], ["Complete Kalash & Aarti Suite"], "Engraved Cast Brass", "Diwali / Navratri Sthapana", "All Season", 4.9, 410,
     ["diwali", "festive", "pooja", "home"], "/photos_for_homeessential/a3976567-b6d2-45bb-adc2-920d7317819e.jpg",
     "Sacred embossed brass pooja vessel featuring engraved lotus petals with coconut top, acoustic Nandi temple bell, dhoop agarbatti incense burner, and lidded kumkum katori."),

    (279, "SP-H017", "Premium Traditional Hanging Kandil", "home", "Lanterns & Kandils", "Festive Decor", "SaleSphere", 1499, 2199,
     ["Maroon", "Gold"], ["28 Inch Statement Lantern"], "Perforated Sheet Brass, Brocade Silk & Gilded Tassels", "Diwali / Courtyard Decor", "Festive/Autumn", 4.9, 320,
     ["diwali", "festive", "kandil", "lantern", "home"], "/photos_for_homeessential/b976e4a4-d39b-4e65-a537-825011c627cd.jpg",
     "Regal multifaceted ceremonial lantern adorned with cutwork star-aperture brass crowns, rich vertical silk brocade ribbing, and cascading gold streamers."),

    (280, "SP-H018", "Handcrafted Decorative Diya Bowl Set", "home", "Diyas & Deepams", "Festive Decor", "SaleSphere", 1499, 2199,
     ["Emerald Green", "Maroon", "Ivory"], ["Set of 6 Bowls"], "Glazed Ceramic Stoneware & 24K Gold Decal", "Diwali / Festive Dining Tables", "All Season", 4.8, 275,
     ["diwali", "festive", "diyas", "home"], "/photos_for_homeessential/ba7d240e-5103-4021-b9cf-b1caa1c8e882.jpg",
     "Set of 6 flared ceramic oil deepams finished with intricate Meenakari floral creepers, gilded scalloped rims, and tapered wick pouring spouts."),

    (281, "SP-H019", "Festive Living Room Styling Collection", "home", "Festive Home Styling", "Festive Decor", "SaleSphere", 1999, 2999,
     ["Gold", "Marigold Yellow", "Crimson"], ["Curated Interior Ensemble"], "Brass Urlis, Torans, Moroccan Lanterns & Marigold Ropes", "Diwali / Holiday Home Styling", "Festive/Autumn", 4.9, 310,
     ["diwali", "festive", "bestseller", "styling", "home"], "/photos_for_homeessential/6a64b8b2-829f-4a95-9caf-dadc58f6506c.jpg",
     "Complete architectural celebration styling bundle uniting staircase clay diya runners, overhead floral hangings, round marigold floor carpets, and warm atmospheric lanterns."),

    (282, "SP-H020", "Terracotta Diya Set", "home", "Diyas & Deepams", "Festive Decor", "SaleSphere", 1099, 1599,
     ["Terracotta", "Warm Gold"], ["Set of 10 with LED Lights"], "Natural Baked Terracotta & Safe Flameless LEDs", "Diwali / Verandahs & Walkways", "Festive/Autumn", 4.7, 480,
     ["diwali", "festive", "bestseller", "diyas", "home"], "/photos_for_homeessential/c35fab3a-5577-4872-8c11-98c2c0f16e56.jpg",
     "Set of 10 classic hand-notched earthen clay lamps equipped with long-lasting warm yellow LED flickering candle flames for windproof, safe all-night festive illumination."),

    (283, "SP-H021", "Traditional Brass Pooja Thali Set", "home", "Pooja Essentials", "Festive Decor", "SaleSphere", 1799, 2699,
     ["Brass / Gold"], ["7-Piece Aarti Thali Set"], "Pure Etched Brass", "Diwali Pujan / Daily Aarti", "All Season", 4.9, 530,
     ["diwali", "festive", "bestseller", "pooja", "thali", "home"], "/photos_for_homeessential/dea9d291-4a41-4148-8bbf-8c01e884d49b.jpg",
     "Comprehensive ceremonial aarti plate featuring intricate mandala engravings, an oil diya, acoustic bell, perforated incense holder, twin lidded haldi-kumkum katoris, and marigolds."),

    (284, "SP-H022", "Premium Brass Deepak Set", "home", "Diyas & Deepams", "Festive Decor", "SaleSphere", 1699, 2499,
     ["Brass / Gold"], ["Set of 4 Deepaks"], "Pure Heavy Virgin Brass", "Diwali / Altar Deepam", "All Season", 4.9, 350,
     ["diwali", "festive", "deepak", "brass", "home"], "/photos_for_homeessential/e2985816-5466-4f77-ae26-7997b024501d (1).jpg",
     "Quartet of substantial cast brass pedestal oil deepaks sculpted with multilayer lotus chalice rims that reflect brilliant dancing golden flames."),

    (285, "SP-H023", "Traditional Beaded Door Hanging Toran", "home", "Entrance Décor & Torans", "Festive Decor", "SaleSphere", 1299, 1899,
     ["Red", "Gold", "Marigold Yellow"], ["3.5 Feet Doorway Hanging"], "Velvet Shading, Kundan Rhinestones & Auspicious Beadwork", "Diwali / New Year / Mandir Entry", "All Season", 4.8, 390,
     ["diwali", "festive", "toran", "entrance", "home"], "/photos_for_homeessential/f30cfe19-662b-4d2d-9963-a2b71b5bae2e.jpg",
     "Handcrafted doorway bandhanwar strung with floral marigold drops, crystal bead strings, and ceremonial 'Shubh Labh' embroidered roundels attracting prosperity to your threshold."),

    (286, "SP-H024", "Antique Brass Standing Deepam", "home", "Diyas & Deepams", "Festive Decor", "SaleSphere", 1999, 2999,
     ["Brass / Gold"], ["15 Inch Tall Pillar Deepam"], "Hand-Turned Heavy Cast Brass", "Diwali / Mandir Sanctum / Foyer", "All Season", 5.0, 470,
     ["diwali", "festive", "bestseller", "deepam", "home"], "/photos_for_homeessential/f7514a1c-2d14-4b41-8b42-7b08b5e37439.jpg",
     "Majestic 15-inch traditional South Indian standing deepam surmounted by an exquisitely sculpted Goddess Lakshmi prabhavali arch, with a fluted pillar and tiered ceremonial oil bowl.")
'''

catalog_path = os.path.join(os.path.dirname(__file__), "..", "catalog_data.py")
with open(catalog_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find the start of section 4
start_idx = None
end_idx = None

for idx, line in enumerate(lines):
    if "4. INDIAN FESTIVE HOME DECOR" in line or "4. HOME ESSENTIALS" in line:
        start_idx = idx - 1  # include the divider line above
        break

for idx in range(len(lines) - 1, -1, -1):
    if lines[idx].strip() == "]":
        end_idx = idx
        break

assert start_idx is not None, "Could not find start of Home Essentials section"
assert end_idx is not None, "Could not find end of PRODUCTS_RAW list"

print(f"Replacing lines {start_idx+1} to {end_idx} in {catalog_path}")

new_lines = lines[:start_idx] + [new_home_products] + lines[end_idx:]

with open(catalog_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("SUCCESS: Updated catalog_data.py with 24 approved photographic Home Essentials products!")

