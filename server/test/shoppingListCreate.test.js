require('dotenv').config(); 

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); 
const ShoppingList = require('../models/ShoppingList');

describe('POST /shopping-lists', () => {
  beforeAll(async () => {
    if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.TEST_DB_URL);
    }
  });

  afterEach(async () => {
    // Clean up the database after each test
    await ShoppingList.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  it('should create a new shopping list successfully', async () => {
    const newList = {
      name: 'Weekly Groceries',
      ownerId: '674a17424578bceba5fc70fc',
      membersId: [],
      items: [
        { name: 'Milk', checked: false },
        { name: 'Eggs', checked: true },
      ],
    };

    const res = await request(app)
      .post('/shopping-lists')
      .send(newList)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Weekly Groceries');
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0]).toHaveProperty('name', 'Milk');
  });

  it('should return a 400 error if required fields are missing', async () => {
    const incompleteList = {
      items: [
        { name: 'Bread', checked: true },
      ],
    };

    const res = await request(app)
      .post('/shopping-lists')
      .send(incompleteList)
      .expect(400);

    expect(res.body).toHaveProperty('message', 'Name is required and must be a non-empty string.');
  });

  it('should handle server errors gracefully', async () => {
    // Simulate a database error by mocking the ShoppingList.prototype.save method
    jest.spyOn(ShoppingList.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const newList = {
      name: 'Backup Groceries',
      ownerId: "674a17424578bceba5fc70fc",
      membersId: [],
      items: [
        { name: 'Cheese', checked: false },
      ],
    };

    const res = await request(app)
      .post('/shopping-lists')
      .send(newList)
      .expect(500);

    expect(res.body).toHaveProperty('message', 'Error creating shopping list');
  });
});
