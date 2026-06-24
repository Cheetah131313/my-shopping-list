const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  checked: { type: Boolean, default: false },
});

const shoppingListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  archived: { type: Boolean, default: false },
  membersId: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  items: [itemSchema]
}, {timestamps: true
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);


// const mongoose = require('mongoose');

// const shoppingListSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     ownerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     archived: {
//       type: Boolean,
//       default: false,
//     },
//     membersId: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         default: [], // Default to an empty array
//       },
//     ],
//     items: [
//       {
//         name: { type: String, required: true }, // Item name
//         checked: { type: Boolean, default: false }, // Checked status
        
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model('ShoppingList', shoppingListSchema);


// const mongoose = require('mongoose');

// const shoppingListSchema = new mongoose.Schema(
//   {
//     name: { 
//       type: String, 
//       required: true 
//     },
//     archived: { type: Boolean, default: false },
//     items: [{
//       name: String,
//       checked: {type: Boolean, default: false }
//     }],

  
// });

// const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

// module.exports = ShoppingList;
