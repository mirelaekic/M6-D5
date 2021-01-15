const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
   },
  productImage: { type: String },
  price:{
      type: Number,
      required: true,
  },
  category:{
      type: String,
      required: true,
  },
    reviews: [
        {
          user: String,
          comment: String,
          rate: Number
        },
      ],
  },
  { timestamps: true }
)

module.exports = mongoose.model("Product", ProductSchema)

