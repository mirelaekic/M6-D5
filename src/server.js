const express = require("express")
const cors = require("cors")
const { join } = require("path")
const listEndpoints = require("express-list-endpoints")
const mongoose = require("mongoose")

const productsRouter = require("./services/products")
const shoppingCartRouter = require("./services/shoppingCart")

const {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers")

const server = express()

const port = process.env.PORT

const staticFolderPath = join(__dirname, "../public");
server.use(express.static(staticFolderPath));
server.use(express.json());

server.use(cors());

server.use("/products", productsRouter);
server.use("/shoppingcart", shoppingCartRouter);

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.log(listEndpoints(server));

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port)
    })
  )
  .catch(err => console.log(err));