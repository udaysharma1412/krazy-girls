const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a product name"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a product description"],
    maxlength: [1000, "Description cannot be more than 1000 characters"],
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: ["suit-sets", "kurtas", "dresses", "bottoms", "sarees"],
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
    min: [0, "Price cannot be negative"],
  },
  originalPrice: {
    type: Number,
    required: [true, "Please add an original price"],
    min: [0, "Original price cannot be negative"],
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  sizes: [{
    type: String,
    trim: true,
  }],
  colors: [{
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  }],
  images: [{
    type: String,
    required: true,
  }],
  mainImage: {
    type: String,
    required: true,
  },
  badge: {
    type: String,
    enum: ["sale", "new", "trending", "limited"],
  },
  stock: {
    type: Number,
    required: [true, "Please add stock quantity"],
    min: 0,
    default: 0,
  },
  outOfStock: {
    type: Boolean,
    default: false,
  },
  details: {
    type: String,
    required: [true, "Please add product details"],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate discount if not provided
productSchema.pre("save", function (next) {
  if (this.originalPrice && this.price && !this.discount) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Update outOfStock based on stock
productSchema.pre("save", function (next) {
  this.outOfStock = this.stock <= 0;
  next();
});

module.exports = mongoose.model("Product", productSchema);
