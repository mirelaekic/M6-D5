const express = require("express")
const mongoose = require("mongoose")
const ProductSchema = require("./schema")
const router = express.Router()
const multer = require("multer")

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, false);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

/*
.map((product) => product.price * product.quantity)
    .reduce((acc, el) => acc + el, 0);
    */
router.get("/", async (req, res, next) => {
  try {
    const products = await ProductSchema.find()   //find is the equivalent of our generic read of the whole json file
    res.send(products)
  } catch (error) {
    next(error)
  }
})

router.get("/:id", async (req, res, next) => {
  try {
    const product = await ProductSchema.findById(req.params.id)   //findById is how we're getting back from the db the element with that specific id that we pass
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
const Product = require("./schema");

router.post("/",upload.single('productImage'), async (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path 
  });
  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created product successfully",
        createdProduct: {
            name: result.name,
            price: result.price,
            _id: result._id,
            request: {
                type: 'GET',
                url: "http://localhost:3000/products/" + result._id
            }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
})

router.put("/:id", async (req, res, next) => {
  try {
    const product = await ProductSchema.findByIdAndUpdate(req.params.id, req.body, {   //for the put method we do basically a mix of the post and get by id
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
    const product = await ProductSchema.findByIdAndDelete(req.params.id)   //find by id and delete the found element 
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
  
      const updatedProduct = await ProductSchema.findByIdAndUpdate(
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
      const { reviews } = await ProductSchema.findById(req.params.id, {
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
      const { reviews } = await ProductSchema.findOne(
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
      const modifiedProduct = await ProductSchema.findByIdAndUpdate(
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
      const { reviews } = await ProductSchema.findOne(
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
  
        const modifiedReview = await ProductSchema.findOneAndUpdate(
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