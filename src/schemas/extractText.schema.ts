import mongoose, { Schema } from "mongoose";

const ExtractedTextSchema = new Schema({
  imgUrl: String,
  content: String,
});

export default mongoose.model("ExtractedText", ExtractedTextSchema);
