import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    friends: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        email: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notifications: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        fromName: String,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        read: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
