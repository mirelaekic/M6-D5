const { Schema, model } = require("mongoose")

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
  imageUrl:{
      type: String,
      required: true,
  },
  price:{
      type: Number,
      required: true,
  },
  category:{
      type: String,
      required: true,
  },
  availableQuantity: Number,
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

ProductSchema.static("decreaseProductsQuantity", async function (id, amount) {
  const product = await ProductSchema.findOneAndUpdate(id, {
    $inc: { availableQuantity: -amount },
  })
  return product
})

const ProductModel = model("Product", ProductSchema)
module.exports = ProductModel;