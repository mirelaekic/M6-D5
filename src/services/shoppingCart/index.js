const express = require("express")
const cartModel = require("./schema")
const ProductSchema = require("../products/schema")
const mongoose = require("mongoose")

const shoppingCartRouter = express.Router()

shoppingCartRouter.post("/", async (req, res, next) => {
    try {
      const newCart = new cartModel(req.body)
      const { _id } = await newCart.save()

      res.status(201).send(newCart)
    } catch (error) {
      next(error)
    }
  })

// Add a product to the cart array 
shoppingCartRouter.post("/:id/cart/:productsId", async (req, res, next) => {
    try {
      const productId = req.params.productsId

      const buyProducts = await ProductSchema.findById(productId, { _id: 0 })

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

//Delete products in cart
shoppingCartRouter.delete("/:id/cart/:productsId", async (req, res, next) => {
    try {
      const modifiedCart = await cartModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            cart: { _id: mongoose.Types.ObjectId(req.params.productsId) }, 
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