const { Schema, model } = require("mongoose")

const ReviewSchema = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    comment: { type: String, required: true },
    gender:{type: String, required: true},
    rate:{type: Number, required: true},
  },
  {
    timestamps: true,
  }
)

module.exports = model("Review", ReviewSchema)