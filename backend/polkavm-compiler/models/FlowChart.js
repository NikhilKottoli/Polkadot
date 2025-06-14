const mongoose  = require('mongoose');

const VersionSchema = new mongoose.Schema({
  flowData: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now }
});

const FlowchartSchema = new mongoose.Schema({
  walletId: { type: String, required: true },
  projectId: { type: String, required: true },
  versions: [VersionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flowchart', FlowchartSchema);
