const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Sample products for Krazy Girls
const sampleProducts = [
  {
    name: "Elegant Pink Anarkali Suit",
    description: "Beautiful pink Anarkali suit with intricate embroidery work. Perfect for weddings and special occasions.",
    category: "suit-sets",
    price: 2499,
    originalPrice: 3499,
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 15,
    images: ["👗", "👗", "👗", "👗", "👗"],
    mainImage: "👗",
    badge: "sale",
    colors: [{name: "Pink", value: "#FF69B4"}, {name: "Magenta", value: "#FF1493"}],
    details: "Premium quality fabric with detailed hand embroidery. Includes dupatta and matching bottoms. Perfect for festive occasions.",
    tags: ["anarkali", "wedding", "festive", "embroidered"],
    rating: 4.5,
    numReviews: 128
  },
  {
    name: "Royal Blue Straight Kurti",
    description: "Stylish straight cut kurti in royal blue with modern design elements.",
    category: "kurtas",
    price: 899,
    originalPrice: 1299,
    sizes: ["S", "M", "L", "XL"],
    stock: 25,
    images: ["👚", "👚", "👚", "👚", "👚"],
    mainImage: "👚",
    badge: "new",
    colors: [{name: "Royal Blue", value: "#4169E1"}, {name: "Navy", value: "#000080"}],
    details: "Comfortable cotton blend fabric with modern straight cut design. Perfect for office wear and casual outings.",
    tags: ["straight-cut", "office", "casual", "cotton"],
    rating: 4.2,
    numReviews: 89
  },
  {
    name: "Floral Print Summer Dress",
    description: "Light and breezy summer dress with beautiful floral print pattern.",
    category: "dresses",
    price: 1599,
    originalPrice: 2199,
    sizes: ["XS", "S", "M", "L"],
    stock: 20,
    images: ["👗", "👗", "👗", "👗", "👗"],
    mainImage: "👗",
    badge: "trending",
    colors: [{name: "Floral", value: "#FFB6C1"}, {name: "White", value: "#FFFFFF"}],
    details: "Lightweight fabric perfect for summer. Features beautiful floral print with comfortable fit.",
    tags: ["summer", "floral", "lightweight", "casual"],
    rating: 4.7,
    numReviews: 203
  },
  {
    name: "Classic Black Palazzo Pants",
    description: "Elegant black palazzo pants with comfortable elastic waistband.",
    category: "bottoms",
    price: 799,
    originalPrice: 999,
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 30,
    images: ["👖", "👖", "👖", "👖", "👖"],
    mainImage: "👖",
    colors: [{name: "Black", value: "#000000"}],
    details: "Comfortable and stylish palazzo pants made from premium fabric. Perfect for both casual and formal occasions.",
    tags: ["palazzo", "comfortable", "versatile", "black"],
    rating: 4.3,
    numReviews: 156
  },
  {
    name: "Traditional Red Banarasi Saree",
    description: "Authentic Banarasi silk saree with traditional red and gold zari work.",
    category: "sarees",
    price: 4999,
    originalPrice: 6999,
    sizes: ["Free Size"],
    stock: 8,
    images: ["🥻", "🥻", "🥻", "🥻", "🥻"],
    mainImage: "🥻",
    badge: "limited",
    colors: [{name: "Red", value: "#DC143C"}, {name: "Gold", value: "#FFD700"}],
    details: "Pure Banarasi silk saree with intricate zari work. Perfect for weddings and traditional functions.",
    tags: ["banarasi", "silk", "traditional", "wedding"],
    rating: 4.8,
    numReviews: 67
  },
  {
    name: "Emerald Green Sharara Suit",
    description: "Stunning emerald green sharara suit with heavy stone work.",
    category: "suit-sets",
    price: 3299,
    originalPrice: 4599,
    sizes: ["S", "M", "L", "XL"],
    stock: 12,
    images: ["👗", "👗", "👗", "👗", "👗"],
    mainImage: "👗",
    badge: "sale",
    colors: [{name: "Emerald", value: "#50C878"}, {name: "Green", value: "#228B22"}],
    details: "Heavy stone work sharara suit with matching dupatta. Perfect for mehndi functions and sangeet ceremonies.",
    tags: ["sharara", "stone-work", "mehndi", "sangeet"],
    rating: 4.6,
    numReviews: 94
  },
  {
    name: "Pastel Yellow A-Line Kurti",
    description: "Charming pastel yellow A-line kurti with delicate embroidery.",
    category: "kurtas",
    price: 749,
    originalPrice: 1099,
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 22,
    images: ["👚", "👚", "👚", "👚", "👚"],
    mainImage: "👚",
    colors: [{name: "Pastel Yellow", value: "#FFFFE0"}, {name: "Cream", value: "#FFF8DC"}],
    details: "Comfortable A-line kurti with subtle embroidery work. Perfect for daily wear and casual outings.",
    tags: ["a-line", "pastel", "daily-wear", "embroidered"],
    rating: 4.1,
    numReviews: 112
  },
  {
    name: "Navy Blue Maxi Dress",
    description: "Elegant navy blue maxi dress with flowing silhouette.",
    category: "dresses",
    price: 1899,
    originalPrice: 2499,
    sizes: ["XS", "S", "M", "L"],
    stock: 18,
    images: ["👗", "👗", "👗", "👗", "👗"],
    mainImage: "👗",
    badge: "new",
    colors: [{name: "Navy Blue", value: "#000080"}, {name: "Midnight", value: "#191970"}],
    details: "Flowing maxi dress perfect for evening events and parties. Made from premium quality fabric.",
    tags: ["maxi", "evening", "party", "flowing"],
    rating: 4.4,
    numReviews: 78
  },
  {
    name: "Beige Churidar Bottoms",
    description: "Comfortable beige churidar bottoms with elastic waistband.",
    category: "bottoms",
    price: 599,
    originalPrice: 799,
    sizes: ["S", "M", "L", "XL"],
    stock: 35,
    images: ["👖", "👖", "👖", "👖", "👖"],
    mainImage: "👖",
    colors: [{name: "Beige", value: "#F5F5DC"}],
    details: "Comfortable churidar bottoms made from cotton blend fabric. Perfect for pairing with kurtis and tops.",
    tags: ["churidar", "comfortable", "cotton", "versatile"],
    rating: 4.0,
    numReviews: 145
  },
  {
    name: "Peacock Blue Designer Saree",
    description: "Exquisite peacock blue designer saree with modern patterns.",
    category: "sarees",
    price: 3799,
    originalPrice: 5299,
    sizes: ["Free Size"],
    stock: 10,
    images: ["🥻", "🥻", "🥻", "🥻", "🥻"],
    mainImage: "🥻",
    badge: "trending",
    colors: [{name: "Peacock", value: "#4682B4"}, {name: "Teal", value: "#008080"}],
    details: "Designer saree with modern peacock blue patterns. Includes designer blouse piece.",
    tags: ["designer", "modern", "peacock", "blouse"],
    rating: 4.7,
    numReviews: 89
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/krazy-girls');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} sample products`);

    // Log the inserted products
    console.log('Sample products:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price} (${product.category})`);
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedProducts();
