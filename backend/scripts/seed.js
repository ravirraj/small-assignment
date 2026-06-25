require("dotenv").config();
const { Pool } = require("pg");
const { faker } = require("@faker-js/faker");

const PRODUCTS_BY_CATEGORY = {
  Electronics: [
    "Wireless Bluetooth Earbuds", "USB-C Fast Charger 65W", "Portable Power Bank 10000mAh",
    "Smart LED Bulb WiFi", "HDMI Cable 2m", "Mechanical Keyboard RGB",
    "Wireless Mouse", "Laptop Stand Adjustable", "Webcam HD 1080p",
    "Smartwatch Fitness Tracker", "Bluetooth Speaker Portable", "Screen Protector Tempered Glass",
    "USB Hub 4-Port", "Noise Cancelling Headphones", "Smart Plug WiFi",
    "Ring Light 10 inch", "Tablet Stand Holder", "Dash Cam 4K",
    "Wireless Charging Pad", "Surge Protector 6-Outlet",
  ],
  Clothing: [
    "Cotton Round Neck T-Shirt", "Slim Fit Denim Jeans", "Running Shoes Mesh",
    "Casual Linen Shirt", "Wool Blend Sweater", "Track Pants Elastic",
    "Leather Belt Classic", "Cotton Handkerchief Pack", "Sports Socks 3-Pack",
    "Polarized Sunglasses", "Waterproof Jacket", "Formal Trousers",
    "Graphic Print Hoodie", "Compression Leggings", "Canvas Sneakers",
    "Flannel Check Shirt", "Zip-Up Fleece Vest", "Cargo Shorts",
    "Knit Beanie Cap", "Silk Blend Scarf",
  ],
  "Home & Garden": [
    "Ceramic Flower Pot 8 inch", "Bamboo Cutting Board", "Stainless Steel Water Bottle",
    "Microfiber Bed Sheet Set", "LED Desk Lamp Dimmable", "Silicone Kitchen Utensil Set",
    "Wall Mounted Shelf Wooden", "Cotton Bath Towel Set", "Air Purifier HEPA Filter",
    "Essential Oil Diffuser", "Garden Hose 15m", "Solar Garden Lights 4-Pack",
    "Non-Stick Frying Pan", "Spice Rack Organizer", "Memory Foam Pillow",
    "Plant Mister Spray Bottle", "Door Mat Rubber", "Storage Basket Foldable",
    "Wall Clock Silent", "Curtain Rod Adjustable",
  ],
  Sports: [
    "Yoga Mat 6mm Thick", "Resistance Band Set", "Jump Rope Adjustable",
    "Dumbbell Set 5kg", "Cricket Bat English Willow", "Football Size 5",
    "Badminton Racket Carbon", "Kettlebell Cast Iron", "Foam Roller Muscle",
    "Gym Gloves Weightlifting", "Skipping Rope Speed", "Ab Roller Wheel",
    "Swimming Goggles Anti-Fog", "Cycling Helmet MIPS", "Basketball Indoor Outdoor",
    "Tennis Ball Pack of 4", "Boxing Hand Wraps", "Pull-Up Bar Doorway",
    "Agility Ladder Training", "Medicine Ball 3kg",
  ],
  Books: [
    "Atomic Habits by James Clear", "The Alchemist by Paulo Coelho", "Sapiens by Yuval Noah Harari",
    "Rich Dad Poor Dad", "Think and Grow Rich", "The Psychology of Money",
    "Deep Work by Cal Newport", "Zero to One by Peter Thiel", "Ikigai Japanese Secret",
    "The Subtle Art of Not Giving", "Mindset by Carol Dweck", "Outliers by Malcolm Gladwell",
    "The 48 Laws of Power", "Meditations by Marcus Aurelius", "Man's Search for Meaning",
    "The Power of Now", "How to Win Friends", "The Monk Who Sold His Ferrari",
    "Lean Startup by Eric Ries", "Thinking Fast and Slow",
  ],
  Toys: [
    "Building Blocks 500pcs", "RC Car Off-Road", "Puzzle 1000 Pieces",
    "Board Game Strategy", "Plush Teddy Bear Soft", "Action Figure Deluxe",
    "Magnetic Tiles Set", "Play Dough Kit 24 Colors", "Robot STEM Kit",
    "Slot Car Racing Set", "Doll House Furniture", "Nerf Blaster Elite",
    "LEGO Classic Brick Set", "Wooden Train Set", "Science Experiment Kit",
    "Card Game Expansion Pack", "Remote Control Helicopter", "Jigsaw Puzzle Adult",
    "Water Gun Super Soaker", "Drone Mini Camera",
  ],
  Health: [
    "Vitamin D3 1000 IU", "Probiotic Capsules 30ct", "Digital Blood Pressure Monitor",
    "Face Mask KN95 20-Pack", "Hand Sanitizer 500ml", "Massage Gun Portable",
    "Heating Pad Electric", "Blood Glucose Monitor", "Omega-3 Fish Oil",
    "Pill Organizer Weekly", "First Aid Kit Complete", "Thermal Scanner Non-Contact",
    "Knee Support Brace", "Calcium Magnesium Zinc", "Foam Wedge Pillow",
    "Acupressure Mat", "Muscle Relief Gel", "Sleep Aid Melatonin",
    "Iron Supplement Tablets", "Posture Corrector Back",
  ],
  Automotive: [
    "Car Vacuum Cleaner Portable", "Tyre Inflator Digital", "Dash Cam Dual Lens",
    "Seat Covers Universal", "Car Air Freshener 3-Pack", "Mobile Holder Dashboard",
    "Car Battery Jump Starter", "Wiper Blades Pair", "LED Headlight Bulbs",
    "Car Floor Mats Rubber", "Steering Wheel Cover Leather", "Trunk Organizer Collapsible",
    "Car Wash Shampoo 1L", "OBD2 Scanner Bluetooth", "Tire Pressure Gauge",
    "Car Phone Charger 12V", "Windshield Sun Shade", "Car Perfume Electric",
    "Reverse Parking Sensors", "Engine Oil 5W-30 4L",
  ],
  Food: [
    "Premium Green Tea 100 Bags", "Organic Honey 500g", "Almonds Roasted 500g",
    "Dark Chocolate 72% Cocoa", "Protein Powder Whey 1kg", "Coffee Beans Arabica 250g",
    "Extra Virgin Olive Oil 1L", "Quinoa Organic 500g", "Peanut Butter Crunchy",
    "Dried Cranberries 200g", "Basmati Rice Premium 5kg", "Turmeric Powder Organic",
    "Masala Chai Blend", "Cashews Salted 250g", "Oats Rolled Organic 1kg",
    "Jaggery Organic 1kg", "Flax Seeds 250g", "Coconut Oil Cold Pressed",
    "Rock Salt Pink 1kg", "Mixed Dry Fruits 500g",
  ],
  Office: [
    "A4 Copy Paper 500 Sheets", "Gel Pen Blue Pack of 10", "Sticky Notes Assorted",
    "Desk Organizer Mesh", "File Folder Set 20ct", "Whiteboard Markers 4-Pack",
    " Staple Gun Heavy Duty", "Laminator A4 Desktop", "Paper Shredder Cross-Cut",
    "Desk Pad Leather", "Binder Clips Assorted", "Calculator Scientific",
    "Notebook Spiral Ruled", "Highlighter Set 6 Colors", "Label Maker Portable",
    "Monitor Stand Riser", "Cable Management Clips", "Webcam Cover Sliding",
    "Pen Holder Rotating", "Document Scanner Portable",
  ],
};

const CATEGORIES = Object.keys(PRODUCTS_BY_CATEGORY);
const TOTAL_PRODUCTS = 200_000;
const BATCH_SIZE = 5_000;

function randomProductName(category) {
  const products = PRODUCTS_BY_CATEGORY[category];
  const base = faker.helpers.arrayElement(products);
  // Add a brand prefix for variety
  const brand = faker.company.name();
  return `${brand} ${base}`;
}

function randomPrice(category) {
  const ranges = {
    Electronics: [149, 49999],
    Clothing: [199, 3999],
    "Home & Garden": [149, 12999],
    Sports: [99, 8999],
    Books: [99, 999],
    Toys: [149, 6999],
    Health: [99, 4999],
    Automotive: [199, 14999],
    Food: [49, 1999],
    Office: [49, 4999],
  };
  const [min, max] = ranges[category] || [49, 9999];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log(`Seeding ${TOTAL_PRODUCTS.toLocaleString()} products...`);

  await pool.query("TRUNCATE products RESTART IDENTITY");

  const insertQuery = `
    INSERT INTO products (name, category, price, created_at, updated_at)
    SELECT unnest($1::text[]),
           unnest($2::text[]),
           unnest($3::numeric[]),
           unnest($4::timestamptz[]),
           unnest($5::timestamptz[])
  `;

  const now = Date.now();
  const oneYear = 365 * 24 * 60 * 60 * 1000;

  let inserted = 0;

  for (let offset = 0; offset < TOTAL_PRODUCTS; offset += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - offset);

    const names = [];
    const categories = [];
    const prices = [];
    const createdAges = [];
    const updatedAges = [];

    for (let i = 0; i < batchSize; i++) {
      const category = faker.helpers.arrayElement(CATEGORIES);
      categories.push(category);
      names.push(randomProductName(category));
      prices.push(randomPrice(category));

      const createdAt = new Date(now - Math.random() * oneYear);
      createdAges.push(createdAt.toISOString());

      const updatedAt =
        Math.random() > 0.7
          ? new Date(
              createdAt.getTime() + Math.random() * (now - createdAt.getTime())
            )
          : createdAt;
      updatedAges.push(updatedAt.toISOString());
    }

    await pool.query(insertQuery, [
      names,
      categories,
      prices,
      createdAges,
      updatedAges,
    ]);

    inserted += batchSize;
    process.stdout.write(
      `\r  Inserted ${inserted.toLocaleString()} / ${TOTAL_PRODUCTS.toLocaleString()}`
    );
  }

  console.log("\nDone.");

  await pool.query(
    "SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))"
  );

  const { rows } = await pool.query("SELECT COUNT(*) as count FROM products");
  console.log(`Total products in database: ${rows[0].count}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
