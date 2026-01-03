const mongoose = require('mongoose');
require('dotenv').config();

// Sample products data
const sampleProducts = [
    {
        name: "Elegant Pink Anarkali Suit",
        description: "Beautiful pink Anarkali suit with intricate embroidery work. Perfect for weddings and special occasions.",
        category: "suit-sets",
        price: 2499,
        originalPrice: 3499,
        discount: 29,
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 15,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "sale",
        colors: [{name: "Pink", value: "#FF69B4"}, {name: "Magenta", value: "#FF1493"}],
        details: "Premium quality fabric with detailed hand embroidery. Includes dupatta and matching bottoms.",
        tags: ["anarkali", "wedding", "festive"],
        rating: 4.5,
        numReviews: 128,
        isActive: true
    },
    {
        name: "Royal Blue Straight Kurti",
        description: "Stylish straight cut kurti in royal blue with modern design elements.",
        category: "kurtas",
        price: 899,
        originalPrice: 1299,
        discount: 31,
        sizes: ["S", "M", "L", "XL"],
        stock: 25,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "new",
        colors: [{name: "Royal Blue", value: "#4169E1"}, {name: "Navy", value: "#000080"}],
        details: "Comfortable cotton blend fabric with modern straight cut design.",
        tags: ["straight-cut", "office", "casual"],
        rating: 4.2,
        numReviews: 89,
        isActive: true
    },
    {
        name: "Floral Print Summer Dress",
        description: "Light and breezy summer dress with beautiful floral print pattern.",
        category: "dresses",
        price: 1599,
        originalPrice: 2199,
        discount: 27,
        sizes: ["XS", "S", "M", "L"],
        stock: 20,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "trending",
        colors: [{name: "Floral", value: "#FFB6C1"}, {name: "White", value: "#FFFFFF"}],
        details: "Lightweight fabric perfect for summer with beautiful floral print.",
        tags: ["summer", "floral", "lightweight"],
        rating: 4.7,
        numReviews: 203,
        isActive: true
    },
    {
        name: "Traditional Red Saree",
        description: "Elegant red saree with golden border work. Perfect for festivals and traditional occasions.",
        category: "sarees",
        price: 3999,
        originalPrice: 5999,
        discount: 33,
        sizes: ["S", "M", "L"],
        stock: 10,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "premium",
        colors: [{name: "Red", value: "#FF0000"}, {name: "Maroon", value: "#800000"}],
        details: "Pure silk fabric with intricate golden border work. Includes matching blouse piece.",
        tags: ["traditional", "silk", "festive"],
        rating: 4.8,
        numReviews: 156,
        isActive: true
    },
    {
        name: "Black Palazzo Pants",
        description: "Comfortable black palazzo pants with modern styling. Perfect for casual and office wear.",
        category: "bottoms",
        price: 699,
        originalPrice: 999,
        discount: 30,
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 30,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "popular",
        colors: [{name: "Black", value: "#000000"}, {name: "Navy", value: "#000080"}],
        details: "Comfortable cotton blend fabric with elastic waistband.",
        tags: ["palazzo", "casual", "office"],
        rating: 4.3,
        numReviews: 94,
        isActive: true
    },
    {
        name: "Green Embroidered Suit Set",
        description: "Beautiful green suit set with detailed embroidery work. Perfect for party wear.",
        category: "suit-sets",
        price: 2799,
        originalPrice: 3899,
        discount: 28,
        sizes: ["S", "M", "L", "XL"],
        stock: 12,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "new",
        colors: [{name: "Green", value: "#008000"}, {name: "Olive", value: "#808000"}],
        details: "Premium fabric with intricate embroidery. Includes dupatta and matching bottoms.",
        tags: ["embroidered", "party", "elegant"],
        rating: 4.6,
        numReviews: 112,
        isActive: true
    },
    {
        name: "Yellow Summer Kurti",
        description: "Bright and cheerful yellow kurti perfect for summer days.",
        category: "kurtas",
        price: 799,
        originalPrice: 1199,
        discount: 33,
        sizes: ["XS", "S", "M", "L"],
        stock: 18,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "summer",
        colors: [{name: "Yellow", value: "#FFFF00"}, {name: "Lemon", value: "#FFFACD"}],
        details: "Lightweight cotton fabric perfect for hot weather.",
        tags: ["summer", "cotton", "casual"],
        rating: 4.4,
        numReviews: 78,
        isActive: true
    },
    {
        name: "Blue Evening Gown",
        description: "Elegant blue evening gown perfect for formal events and parties.",
        category: "dresses",
        price: 4999,
        originalPrice: 6999,
        discount: 29,
        sizes: ["S", "M", "L"],
        stock: 8,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "luxury",
        colors: [{name: "Royal Blue", value: "#4169E1"}, {name: "Navy", value: "#000080"}],
        details: "Premium fabric with elegant design and perfect fit.",
        tags: ["evening", "formal", "luxury"],
        rating: 4.9,
        numReviews: 67,
        isActive: true
    },
    {
        name: "Pink Casual Pants",
        description: "Comfortable pink casual pants for everyday wear.",
        category: "bottoms",
        price: 599,
        originalPrice: 899,
        discount: 33,
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 22,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "casual",
        colors: [{name: "Pink", value: "#FFC0CB"}, {name: "Rose", value: "#FF1493"}],
        details: "Comfortable fabric with elastic waistband and pockets.",
        tags: ["casual", "comfortable", "everyday"],
        rating: 4.1,
        numReviews: 45,
        isActive: true
    },
    {
        name: "Purple Designer Saree",
        description: "Stunning purple designer saree with modern patterns.",
        category: "sarees",
        price: 4499,
        originalPrice: 6499,
        discount: 31,
        sizes: ["S", "M", "L"],
        stock: 6,
        outOfStock: false,
        image: "👚",
        images: ["👚", "👚", "👚", "👚", "👚"],
        mainImage: "👚",
        badge: "designer",
        colors: [{name: "Purple", value: "#800080"}, {name: "Violet", value: "#EE82EE"}],
        details: "Designer fabric with modern patterns and matching blouse piece.",
        tags: ["designer", "modern", "elegant"],
        rating: 4.7,
        numReviews: 89,
        isActive: true
    }
];

// Simple product schema (without requiring the model file)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    sizes: [String],
    stock: { type: Number, default: 0 },
    outOfStock: { type: Boolean, default: false },
    image: { type: String, required: true },
    images: [String],
    mainImage: { type: String, required: true },
    badge: { type: String },
    colors: [{
        name: String,
        value: String
    }],
    details: { type: String, required: true },
    tags: [String],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert sample products
        const insertedProducts = await Product.insertMany(sampleProducts);
        console.log(`Inserted ${insertedProducts.length} products`);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
