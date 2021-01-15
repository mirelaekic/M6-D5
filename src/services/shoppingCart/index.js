const express = require("express")
const cartModel = require("./schema")
const ProductModel = require("../products/schema")
const mongoose = require("mongoose")

const shoppingCartRouter = express.Router()
//create a new cart
shoppingCartRouter.post("/", async (req, res, next) => {
    try {
      const newCart = new cartModel(req.body)
      const { _id } = await newCart.save()
  
      res.status(201).send(_id)
    } catch (error) {
      next(error)
    }
  })
  // GET the cart with the posted products
  shoppingCartRouter.get("/:id", async (req, res, next) => {
    try {
      const { cart } = await cartModel.findById(req.params.id, {
        cart: 1,
        _id: 0,
      })
      res.send(cart)
    } catch (error) {
      next(error)
    }
  });
  //6001748baf0fb43eacf2b357
  //600174caaf0fb43eacf2b358
  //CARTS
  //60017269e95d14155c4a83d6 PRODUCT
  //600180d99c03f44274d633ed

shoppingCartRouter.post("/:id/cart/:productsId", async (req, res, next) => {
    // add a book to the purchase history of the specified user
    try {
      const productId = req.params.productsId
  
      const buyProducts = await ProductModel.findById(productId, { _id: 0 })
  
      console.log(buyProducts)
  
      const productsToInsert = { ...buyProducts.toObject(), date: new Date() }
      const modifiedCart = await cartModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { cart: productsToInsert },
        },
        { runValidators: true, new: true, findOneAndUpdate:false }
      )
      res.send(modifiedCart)
    } catch (error) {
      console.log(error)
    }
  })
//Delete product in cart
shoppingCartRouter.delete("/:id/cart/:productsId", async (req, res, next) => {
    try {
      const modifiedCart = await cartModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            cart: { _id: mongoose.Types.ObjectId(req.params.productsId) }, // I need to specify a criteria to tell mongo which element of purchaseHistory needs to be removed. This criteria is to match _id
          },
        },
        {
          runValidators: true,
          new: true,
        }
      )
      res.send(modifiedCart)
    } catch (error) {
      next(error)
    }
  })
// calculate the total in the cart
shoppingCartRouter.get("/:id/calculate", async (req, res, next) => {
    try {
      const total = await cartModel.calculateCartTotal(req.params.id)
      res.send({ total })
    } catch (error) {
      next(error)
    }
  });

  module.exports = shoppingCartRouter;