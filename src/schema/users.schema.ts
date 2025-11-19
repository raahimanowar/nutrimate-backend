import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    address: {
      country: { type: String, required: true },
      city: { type: String, required: true },
    },
    profilePic: { type: String },
    dateOfBirth: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("User", UserSchema);
