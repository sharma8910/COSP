import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true, index: true },
  deviceName: { type: String, required: true, trim: true, maxlength: 100 },
  deviceTokenHash: { type: String, required: true, unique: true, select: false },
  lastSeenAt: Date,
  status: { type: String, enum: ['active', 'revoked'], default: 'active' }
}, { timestamps: true });

export const Device = mongoose.model('Device', deviceSchema);
