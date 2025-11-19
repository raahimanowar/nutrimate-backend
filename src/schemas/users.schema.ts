import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    height: { type: Number },
    weight: { type: Number },
    address: {
      country: { type: String },
      city: { type: String },
    },
    profilePic: { type: String },
    dateOfBirth: { type: Date },
    role: { type: String, default: "user" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("User", UserSchema);
