const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');

router.get('/', shoppingListController.getAllShoppingLists);
router.post('/', shoppingListController.createShoppingList);
router.put('/:id', shoppingListController.updateShoppingList);
router.delete('/:id', shoppingListController.deleteShoppingList);
router.get('/:id', shoppingListController.getShoppingListById); // Route to get a specific list
router.put('/archive/:id', shoppingListController.archiveShoppingList);//Archive
router.put('/:id/members', shoppingListController.setMembersForShoppingList);
router.put('/:id/remove-member', shoppingListController.removeMemberFromShoppingList);
router.post('/:id/items', shoppingListController.addItemToShoppingList);
router.delete('/:id/items/:itemId', shoppingListController.deleteItemFromShoppingList);
router.patch('/:id/items/:itemId', shoppingListController.toggleItemCheckedStatus);

module.exports = router;
