import mongoose from "mongoose";

const activityEventSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true, index: true },
  domain: { type: String, required: true, lowercase: true, trim: true },
  reason: { type: String , required: true },
  createdAt: { type: Date, default: Date.now, index: true }

})

export const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema);