import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true, index: true },
  type: { type: String, enum: ['allowlist', 'blocklist'], required: true },
  domain: { type: String, required: true, lowercase: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});
policySchema.index({ childId: 1, type: 1, domain: 1 }, { unique: true });

export const Policy = mongoose.model('Policy', policySchema);
