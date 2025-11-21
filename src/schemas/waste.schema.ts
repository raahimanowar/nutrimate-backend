import { Schema, model } from "mongoose";

const WasteSchema = new Schema({
  username: { type: String, required: true, unique: true },
  inventory: [
    {
      name: String,
      quantity: Number, // grams or units
      price: Number,
      expiration: Date,
    },
  ],
  consumption: [
    {
      name: String,
      quantity: Number,
      date: Date,
    },
  ],
});

export default model("Waste", WasteSchema);
