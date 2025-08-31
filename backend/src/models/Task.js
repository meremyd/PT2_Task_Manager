const { Schema, model, Types } = require('mongoose');

const taskSchema = new Schema(
  {
    taskId: {
      type: String,
      default: () => new Types.ObjectId().toString(),
      unique: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
      index: true
    },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

taskSchema.index({ title: 'text', description: 'text' });

module.exports = model('Task', taskSchema);
