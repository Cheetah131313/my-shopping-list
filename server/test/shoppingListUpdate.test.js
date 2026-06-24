require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const ShoppingList = require('../models/ShoppingList');

describe('PUT /shopping-lists/:id', () => {
  let shoppingListId;

  beforeAll(async () => {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.TEST_DB_URL);
    }
  });

  beforeEach(async () => {
    const shoppingList = await ShoppingList.create({
      name: 'Original List',
      ownerId: '674a17424578bceba5fc70fc',
      membersId: [],
      items: [
        { name: 'Milk', checked: false },
        { name: 'Eggs', checked: true },
      ],
    });
    shoppingListId = shoppingList._id;
    console.log('Created shopping list with ID:', shoppingListId);
  });

  afterEach(async () => {
    await ShoppingList.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should update a shopping list successfully', async () => {
    console.log('Testing update for ID:', shoppingListId.toString());

    const updatedData = { name: 'Updated List' };

    const res = await request(app)
      .put(`/shopping-lists/${shoppingListId}`)
      .send(updatedData)
      .expect(200);

    //expect(res.body).toHaveProperty('_id', shoppingListId.toString());
    expect(res.body).toHaveProperty('name', 'Updated List');
  });

  it('should return a 400 error for an invalid ID format', async () => {
    const invalidId = 'invalid-id-format';
    const res = await request(app)
      .put(`/shopping-lists/${invalidId}`)
      .send({ name: 'Updated List' })
      .expect(400);

    expect(res.body).toHaveProperty('message', 'Invalid shopping list ID');
  });

  it('should validate request data and return a 400 error for invalid input', async () => {
    const invalidData = { name: '', items: 'not-an-array' };
    const res = await request(app)
      .put(`/shopping-lists/${shoppingListId}`)
      .send(invalidData)
      .expect(400);

    expect(res.body).toHaveProperty('message', 'Invalid input data.');
  });

  it('should handle server errors gracefully', async () => {
    jest.spyOn(ShoppingList, 'findByIdAndUpdate').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .put(`/shopping-lists/${shoppingListId}`)
      .send({ name: 'Test Error' })
      .expect(500);

    expect(res.body).toHaveProperty('message', 'An error occurred while updating the shopping list.');
  });
});
