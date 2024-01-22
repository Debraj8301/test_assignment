import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  roles: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Roles",
    required: false
  },
});

export default mongoose.model("User", userSchema);
