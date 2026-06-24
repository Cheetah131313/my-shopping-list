require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const ShoppingList = require('../models/ShoppingList');

describe('GET /shopping-lists/:id', () => {
  let shoppingListId;

  beforeAll(async () => {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.TEST_DB_URL);
    }
  });

  beforeEach(async () => {
    // Create a sample shopping list for testing
    const shoppingList = await ShoppingList.create({
      name: 'Test Shopping List',
      ownerId: "674a17424578bceba5fc70fc",
      membersId: [],
      items: [
        { name: 'Milk', checked: false },
        { name: 'Eggs', checked: true },
      ],
    });
    shoppingListId = shoppingList._id;
    console.log('Created shopping list ID:', shoppingListId);

  });  

  afterEach(async () => {
    // Clean up the database after each test
    await ShoppingList.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  it('should return a shopping list by ID (happy path)', async () => {
    console.log('Fetching shopping list with ID:', shoppingListId);
  
    const res = await request(app)
      .get(`/shopping-lists/${shoppingListId.toString()}`)
      .expect(200);
  
    //expect(res.body).toHaveProperty('_id', shoppingListId.toString());
    expect(res.body).toHaveProperty('name', 'Test Shopping List');
  });
  

  it('should return a 400 if the ID is invalid', async () => {
    const res = await request(app).get('/shopping-lists/invalid-id').expect(400);

    expect(res.body).toHaveProperty('message', 'Invalid shopping list ID');
  });

  it('should return a 404 if the shopping list does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/shopping-lists/${nonExistentId}`).expect(404);

    expect(res.body).toHaveProperty('message', 'Shopping list not found');
  });
});
