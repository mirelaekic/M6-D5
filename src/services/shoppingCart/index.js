const express = require("express")
const cartModel = require("./schema")
const productsModel = require("../products/schema")

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
  //6001748baf0fb43eacf2b357
  //600174caaf0fb43eacf2b358
// Add a product to the exsisting cart array :id is the cart id 
shoppingCartRouter.post("/:id/add/:productsId", async (req, res, next) => {
    try {
      const products = await productsModel.decreaseProductsQuantity(
        req.params.productsId,
        req.body.quantity
      )
      if (products) {
        const newProducts = { ...products.toObject(), quantity: req.body.quantity }
  
        const isProductThere = await cartModel.findProductsInCart(
          req.params.id,
          req.params.productsId
        )
        if (isProductThere) {
          await cartModel.incrementCartQuantity(
            req.params.id,
            req.params.productsId,
            req.body.quantity
          )
          res.send("Quantity incremented")
        } else {
          await cartModel.addProductsToCart(req.params.id, newProducts)
          res.send("New products added!")
        }
      } else {
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      next(error)
    }
  })
  // GET the cart with the posted products
  shoppingCartRouter.get("/:id/cart", async (req, res, next) => {
    try {
      const { cart } = await productsModel.findById(req.params.id, {
        cart: 1,
        _id: 0,
      })
      res.send(cart)
    } catch (error) {
      next(error)
    }
  });

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