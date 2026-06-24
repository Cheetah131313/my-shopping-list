const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const ShoppingList = require('../models/ShoppingList');

describe('DELETE /shopping-lists/:id', () => {
  let shoppingListId;

  beforeAll(async () => {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.TEST_DB_URL);
    }
  });

  beforeEach(async () => {
    const shoppingList = await ShoppingList.create({
      name: 'Test Shopping List',
      ownerId: "674a17424578bceba5fc70fc",
      membersId: [],
      items: [
              { name: 'Milk', checked: false },
              { name: 'Eggs', checked: true },
            ],
    });
    shoppingListId = shoppingList._id.toString();
    console.log('Created Shopping List with ID:', shoppingListId);
  });

  afterEach(async () => {
    await ShoppingList.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  it('should delete a shopping list successfully', async () => {
    console.log('Testing deletion for ID:', shoppingListId); 
    const res = await request(app)
      .delete(`/shopping-lists/${shoppingListId.toString()}`)
      .expect(200);

    expect(res.body).toHaveProperty('message', 'Shopping list deleted successfully');
  });

  it('should return a 404 error for a non-existent shopping list', async () => {
    const fakeId = new mongoose.Types.ObjectId(); // Generate a valid but non-existent ObjectId

    const res = await request(app)
      .delete(`/shopping-lists/${fakeId}`)
      .expect(404);

    expect(res.body).toHaveProperty('message', 'Shopping list not found');
  });

  it('should return a 400 error for an invalid ID format', async () => {
    const res = await request(app)
      .delete('/shopping-lists/invalid-id-format')
      .expect(400);

    expect(res.body).toHaveProperty('message', 'Invalid shopping list ID');
  });
});


// require('dotenv').config(); 

// const request = require('supertest');
// const mongoose = require('mongoose');
// const app = require('../server'); 
// const ShoppingList = require('../models/ShoppingList');

// describe('DELETE /shopping-lists/:id', () => {
//   let shoppingListId;

//   beforeAll(async () => {
//     if (!mongoose.connection.readyState) {
//         await mongoose.connect(process.env.TEST_DB_URL);
//     }
//   });

//   beforeEach(async () => {
//     // Create a sample shopping list for testing
//     const shoppingList = await ShoppingList.create({
//       name: 'Test List',
//       ownerId: "674a17424578bceba5fc70fc",
//       membersId: [],
//       items: [
//         { name: 'Apples', checked: false },
//         { name: 'Bananas', checked: true },
//       ],
//     });
//     shoppingListId = shoppingList._id;
//   });

//   afterEach(async () => {
//     // Clean up the database after each test
//     await ShoppingList.deleteMany({});
//   });

//   afterAll(async () => {
//     // Disconnect from the test database
//     await mongoose.disconnect();
//   });

//   it('should delete a shopping list successfully', async () => {
//     const res = await request(app)
//       .delete(`/shopping-lists/${shoppingListId}`)
//       .expect(200);

//     expect(res.body).toHaveProperty('message', 'Shopping lst deleted successfully');

//     // Verify the shopping list no longer exists in the database
//     const deletedList = await ShoppingList.findById(shoppingListId);
//     expect(deletedList).toBeNull();
//   });

//   it('should return a 404 error if the shopping list does not exist', async () => {
//     const nonExistentId = new mongoose.Types.ObjectId();
//     const res = await request(app)
//       .delete(`/shopping-lists/${nonExistentId}`)
//       .expect(404);

//     expect(res.body).toHaveProperty('message', 'Shopping list not found');
//   });

//   it('should return a 400 error for an invalid ID format', async () => {
//     const invalidId = 'invalid-id-format';
//     const res = await request(app)
//       .delete(`/shopping-lists/${invalidId}`)
//       .expect(400);

//     expect(res.body).toHaveProperty('message', 'Invalid shopping list ID');
//   });

//   it('should handle server errors gracefully', async () => {
//     jest.spyOn(ShoppingList, 'findByIdAndDelete').mockImplementationOnce(() => {
//       throw new Error('Database error');
//     });

//     const res = await request(app)
//       .delete(`/shopping-lists/${fakeId}`)
//       .expect(500);

//     expect(res.body).toHaveProperty('message', 'An error occurred while deleting the shopping list.');
//   });
// });
