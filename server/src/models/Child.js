import mongoose from 'mongoose';

const childSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  ageGroup: { type: String, enum: ['under-8', '8-12', '13-15', '16-17'], required: true }
}, { timestamps: true });

export const Child = mongoose.model('Child', childSchema);
