const ShoppingList = require('../models/ShoppingList');
const { getAllShoppingLists } = require('../controllers/shoppingListController');

// Mock the ShoppingList model
jest.mock('../models/ShoppingList');

describe('ShoppingList Controller Tests', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('getAllShoppingLists', () => {
    it('should return all shopping lists with pagination', async () => {
      // Mock data
      const mockShoppingLists = [
        { id: 1, name: 'Groceries', ownerId: { name: 'Anna' }, membersId: [{ name: 'Adam' }] },
        { id: 2, name: 'Electronics', ownerId: { name: 'Pepa' }, membersId: [{ name: 'Bob' }] },
      ];

      const totalLists = 2;

      // Mock ShoppingList.find()
      ShoppingList.find.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockShoppingLists),
      }));

      // Mock ShoppingList.countDocuments()
      ShoppingList.countDocuments.mockResolvedValue(totalLists);

      // Mock request and response
      const req = { query: { page: 1, limit: 2 } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getAllShoppingLists(req, res);

      expect(ShoppingList.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        shoppingLists: mockShoppingLists,
        totalPages: Math.ceil(totalLists / req.query.limit),
        currentPage: 1,
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock ShoppingList.find() to throw an error
      ShoppingList.find.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      const req = { query: {} };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getAllShoppingLists(req, res);

    
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
});
