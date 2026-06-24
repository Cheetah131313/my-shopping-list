const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  checked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Item', itemSchema);
