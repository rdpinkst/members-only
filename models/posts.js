const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true},
  message: { type: String, required: true },
  postDate: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Post", PostSchema);