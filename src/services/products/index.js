const express = require("express")
const mongoose = require("mongoose")
const ProductModel = require("./schema")
const router = express.Router()

/*
.map((product) => product.price * product.quantity)
    .reduce((acc, el) => acc + el, 0);
    */
router.get("/", async (req, res, next) => {
  try {
    const products = await ProductModel.find()   //find is the equivalent of our generic read of the whole json file
    res.send(products)
  } catch (error) {
    next(error)
  }
})

router.get("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id)   //findById is how we're getting back from the db the element with that specific id that we pass
    if (product) {
      res.send(product)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next("A problem occurred!")
  }
})

router.post("/", async (req, res, next) => {
  try {
    const newproduct = new ProductModel(req.body) //this is how we create the instance for the new element that we're going to add (that we pass between parenthesis)
    const { _id } = await newproduct.save()       // we add it through the save()

    res.status(201).send(newproduct)
  } catch (error) {
    next(error)
  }
})

router.put("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {   //for the put method we do basically a mix of the post and get by id
      runValidators: true,                                               //by using findByIdAndUpdate we pass the id to find our element and pass as the second parameter our updated body
      new: true,
    })
    if (product) {
      res.send(product)
    } else {
      const error = new Error(`product not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

router.delete("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id)   //find by id and delete the found element 
    if (product) {
      res.send("product deleted successfully")
    } else {
      const error = new Error("product not found")
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

router.post("/:id/reviews/", async (req, res, next) => {
    try {
      const newReview = { ...req.body, date: new Date() }
  
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            reviews: newReview,
          },
        },
        { runValidators: true, new: true }
      )
      res.status(201).send(updatedProduct)
    } catch (error) {
      next(error)
    }
  })
  
  router.get("/:id/reviews/", async (req, res, next) => {
    try {
      const { reviews } = await ProductModel.findById(req.params.id, {
        reviews: 1,
        _id: 0,
      })
      res.send(reviews)
    } catch (error) {
      console.log(error)
      next(error)
    }
  })
  
  router.get("/:id/reviews/:reviewId", async (req, res, next) => {
    try {
      const { reviews } = await ProductModel.findOne(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
        },
        {
          _id: 0,
          reviews: {
            $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
          },
        }
      ) 
      if (reviews && reviews.length > 0) {
        res.send(reviews[0])
      } else {
        next()
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  })
  
  router.delete("/:id/reviews/:reviewId", async (req, res, next) => {
    try {
      const modifiedProduct = await ProductModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            reviews: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
          },
        },
        {
          new: true,
        }
      )
      res.send(modifiedProduct)
    } catch (error) {
      console.log(error)
      next(error)
    }
  })
  
  router.put("/:id/reviews/:reviewId", async (req, res, next) => {
    try {
      const { reviews } = await ProductModel.findOne(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
        },
        {
          _id: 0,
          reviews: {
            $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
          },
        }
      )
  
      if (reviews && reviews.length > 0) {
        const ReviewToReplace = { ...reviews[0].toObject(), ...req.body }
  
        const modifiedReview = await ProductModel.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.params.id),
            "reviews._id": mongoose.Types.ObjectId(req.params.reviewId),
          },
          { $set: { "reviews.$": ReviewToReplace } },
          {
            runValidators: true,
            new: true,
          }
        )
        res.send(modifiedReview)
      } else {
        next()
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  })

module.exports = router