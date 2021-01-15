const { Schema, model } = require("mongoose");
const mongoose = require("mongoose")

const cartSchema = new Schema(
  {
    name: {
        type: String,
        required: true,
      },
    cart: [
      {
        name: String,
        brand: String,
        price: Number,
        category: String,
        quantity: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);
cartSchema.static("findProductInCart", async function (id, productId) {
  const isproductThere = await cartModel.findOne({
    _id: id,
    "cart._id": productId,
  });
  return isproductThere;
});

cartSchema.static(
  "incrementCartQuantity",
  async function (id, productId, quantity) {
    await cartModel.findOneAndUpdate(
      {
        _id: id,
        "cart._id": productId,
      },
      { $inc: { "cart.$.quantity": quantity } }
    );
  }
);

cartSchema.static("addProductToCart", async function (id, product) {
  await cartModel.findOneAndUpdate(
    { _id: id },
    {
      $addToSet: { cart: product },
    }
  );
});

cartSchema.static("calculateCartTotal", async function (id) {
  const { cart } = await cartModel.findById(id);
  return cart
    .map((product) => product.price * product.quantity)
    .reduce((acc, el) => acc + el, 0);
});

const cartModel = model("cart", cartSchema);
module.exports = mongoose.model("cart", cartSchema)
//module.exports = cartModel;
