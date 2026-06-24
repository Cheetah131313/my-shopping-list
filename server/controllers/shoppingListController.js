const ShoppingList = require('../models/ShoppingList');
//const User = require('../models/User');
const Item = require('../models/Item');
const mongoose = require('mongoose');

// Get all shopping lists with pagination
exports.getAllShoppingLists = async (req, res) => {
  const { page = 1, limit = 100 } = req.query; // Default page = 1, limit = 100 if not specified

  try {
    const shoppingLists = await ShoppingList.find()
      .populate('ownerId', 'name')
      .populate('membersId', 'name')
      .skip((page - 1) * limit) // Skip items from previous pages
      .limit(parseInt(limit)); // Limit the number of items per page

    const totalLists = await ShoppingList.countDocuments(); // Total number of shopping lists
    res.json({
      shoppingLists,
      totalPages: Math.ceil(totalLists / limit),
      currentPage: parseInt(page),
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new shopping list
exports.createShoppingList = async (req, res) => {
  const { name, ownerId, membersId = [], items = [] } = req.body;

  try {
    // Input Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required and must be a non-empty string.' });
    }

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: 'Owner ID is required and must be a valid ObjectId.' });
    }

    if (!Array.isArray(membersId)) {
      return res.status(400).json({ message: 'Members ID must be an array if provided.' });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array if provided.' });
    }

    // Validate item structure (if items are provided)
    for (const item of items) {
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        return res.status(400).json({ message: 'Each item must have a non-empty name.' });
      }
      if (item.checked !== undefined && typeof item.checked !== 'boolean') {
        return res.status(400).json({ message: 'Item checked status must be a boolean.' });
      }
    }

    // Create and save the new shopping list
    const newList = new ShoppingList({
      name,
      ownerId,
      membersId,
      items,
    });

    const savedList = await newList.save();

    res.status(201).json(savedList);
  } catch (err) {
    console.error('Error creating shopping list:', err); // Log for debugging

    if (err.name === 'ValidationError') {
      res.status(400).json({ message: 'Invalid input data.', details: err.errors });
    } else {
      res.status(500).json({ message: 'Error creating shopping list' });
    }
  }
};

// Update a shopping list
exports.updateShoppingList = async (req, res) => {
  const { id } = req.params;
  const { name, ownerId, membersId } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid shopping list ID' });
  }

  // Validate input data
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ message: 'Invalid input data.' });
  }

  try {
    const updatedList = await ShoppingList.findByIdAndUpdate(
      id,
      { name, ownerId, membersId },
      { new: true }
    )
      .populate('ownerId', 'name')
      .populate('membersId', 'name');

    if (!updatedList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    res.status(200).json(updatedList);
  } catch (err) {
    res.status(500).json({ message: 'An error occurred while updating the shopping list.' });
  }
};


// Update a shopping list
// exports.updateShoppingList = async (req, res) => {
//   const { id } = req.params;

//     // Check if the ID is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid shopping list ID' });
//     }
//   try {
//     const updatedList = await ShoppingList.findByIdAndUpdate(req.params.id, req.body, { new: true })
//       .populate('ownerId', 'name')
//       .populate('membersId', 'name');

//     if (!updatedList) { 
//         return res.status(404).json({ message: 'Shopping list not found' }); 
//     }

//     res.json(updatedList);
//   } catch (err) {
//     res.status(500).json({ message: 'An error occurred while updating the shopping list.' });
//   }
// };

// Delete a shopping list
exports.deleteShoppingList = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid shopping list ID' });
  }

  try {
    // Attempt to delete the shopping list
    const deletedList = await ShoppingList.findByIdAndDelete(id);

    // If the list does not exist
    if (!deletedList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Successful deletion
    res.json({ message: 'Shopping list deleted successfully' });
  } catch (err) {
      res.status(500).json({ message: 'An error occurred while deleting the shopping list.' });
  }
};

// exports.deleteShoppingList = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID format 
//     if (!mongoose.Types.ObjectId.isValid(id)) { 
//       return res.status(400).json({ message: 'Invalid shopping list ID' }); 
//     } 
    
//     const shoppingList = await ShoppingList.findByIdAndDelete(id); 
//     if (!shoppingList) { 
//       return res.status(404).json({ message: 'Shopping list not found' }); 
//     } 
//     res.status(200).json({ message: 'Shopping list deleted successfully' }); 
//   } catch (err) { 
//     res.status(500).json({ message: err.message }); 
//   } 
// };

// Get a specific shopping list by ID with populated owner and members
exports.getShoppingListById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid shopping list ID' });
  } 

  try {
    const shoppingList = await ShoppingList.findById(id)
      .populate('ownerId', 'name')
      .populate('membersId', 'name');

    if (!shoppingList) return res.status(404).json({ message: 'Shopping list not found' });

    res.status(200).json(shoppingList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Archive a shopping list
exports.archiveShoppingList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await ShoppingList.findById(id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    list.archived = !list.archived; // Toggle the archived status
    const updatedList = await list.save();
    res.json(updatedList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update members of a shopping list
exports.setMembersForShoppingList = async (req, res) => {
  try {
    const { id } = req.params; // Shopping list ID
    const { membersId } = req.body; // Array of member IDs

    // Find the shopping list by ID
    const list = await ShoppingList.findById(id);
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Update the membersId field
    list.membersId = membersId;
    const updatedList = await list.save();

    res.json(updatedList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove a member from a shopping list
exports.removeMemberFromShoppingList = async (req, res) => {
  try {
    const { id } = req.params; // Shopping list ID
    const { memberId } = req.body; // Member ID to remove

    // Find the shopping list by ID
    const list = await ShoppingList.findById(id);
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Check if the member exists in the list
    if (!list.membersId.includes(memberId)) {
      return res.status(404).json({ message: 'Member not found in the shopping list' });
    }

    // Remove the member from the membersId array
    list.membersId = list.membersId.filter((id) => id.toString() !== memberId);

    // Save the updated list
    const updatedList = await list.save();

    res.json(updatedList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

    // Add an item to a shopping list
    exports.addItemToShoppingList = async (req, res) => {
    try {
      const { id } = req.params; // Shopping list ID
      const { name } = req.body; // Item name

      // Validate input
      if (!name) {
        return res.status(400).json({ message: 'Item name is required' });
      }

      // Find the shopping list
      const list = await ShoppingList.findById(id);
      if (!list) {
        return res.status(404).json({ message: 'Shopping list not found' });
      }

      // Create a new item with an auto-generated ID
      const newItem = {
        //id: list.items.length ? list.items[list.items.length - 1].id + 1 : 1, // Increment ID
        name,
        checked: false, // Default to unchecked
      };

      // Add the new item to the items array
      list.items.push(newItem);
      await list.save();

      const createdItem = list.items[list.items.length - 1]; //Get newone
      res.status(201).json(createdItem);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.deleteItemFromShoppingList = async (req, res) => {
    try {
      const { id, itemId } = req.params; // Shopping list ID and item ID
  
      // Find the shopping list
      const shoppingList = await ShoppingList.findById(id).populate('items');
      if (!shoppingList) {
        return res.status(404).json({ message: 'Shopping list not found' });
      }
  
      // Remove the item by its ID
      shoppingList.items = shoppingList.items.filter(item => item._id.toString() !== itemId);
  
      // Save the updated shopping list
      await shoppingList.save();
  
      // Remove the item from the Item collection
      await Item.findByIdAndDelete(itemId);
  
      res.json( shoppingList );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.toggleItemCheckedStatus = async (req, res) => {
    try {
      const { id, itemId } = req.params; // Shopping list ID and item ID
  
      // Find the shopping list by its ID
      const shoppingList = await ShoppingList.findById(id);
      if (!shoppingList) {
        return res.status(404).json({ message: 'Shopping list not found' });
      }
  
      // Find the item within the shopping list by its ID
      const item = shoppingList.items.id(itemId); // Use `.id()` to find subdocument
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      // Toggle the checked status
      item.checked = !item.checked;
  
      // Save the parent document to persist the changes
      await shoppingList.save();
  
      res.json( item );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  
  
  // exports.toggleItemCheckedStatus = async (req, res) => {
  //   try {
  //     const { id, itemId } = req.params; // Shopping list ID and item ID
  
  //     // Find the shopping list
  //     const shoppingList = await ShoppingList.findById(id).populate('items');
  //     if (!shoppingList) {
  //       return res.status(404).json({ message: 'Shopping list not found' });
  //     }
  
  //     // Find the item by its ID
  //     const item = shoppingList.items.find(item => item._id.toString() === itemId);
  //     if (!item) {
  //       return res.status(404).json({ message: 'Item not found' });
  //     }
  
  //     // Toggle the checked status
  //     item.checked = !item.checked;
  
  //     // Save the updated item
  //     await item.save();
  
  //     res.json({ message: 'Item updated successfully', shoppingList });
  //   } catch (err) {
  //     res.status(500).json({ message: err.message });
  //   }
  // };
  