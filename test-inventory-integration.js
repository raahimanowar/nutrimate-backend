import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from './dist/schemas/inventory.schema.js';

dotenv.config();

// Test user ID (you'll need to replace this with an actual user ID from your database)
const TEST_USER_ID = 'YOUR_USER_ID_HERE'; // Replace with actual user ID

const testItems = [
  { itemName: 'Apple', category: 'fruits', quantity: 10, costPerUnit: 0.5, hasExpiration: true },
  { itemName: 'Banana', category: 'fruits', quantity: 5, costPerUnit: 0.3, hasExpiration: true },
  { itemName: 'Milk', category: 'dairy', quantity: 2, costPerUnit: 2.5, hasExpiration: true }
];

async function setupTestInventory() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');

    // Clear existing test data for this user
    await Inventory.deleteMany({ userId: TEST_USER_ID });
    console.log('Cleared existing inventory for test user');

    // Add test items to inventory
    const insertedItems = await Inventory.insertMany(
      testItems.map(item => ({ ...item, userId: TEST_USER_ID }))
    );

    console.log('Added test inventory items:');
    insertedItems.forEach(item => {
      console.log(`- ${item.itemName}: ${item.quantity} units (${item.category})`);
    });

    console.log('\n=== Test Scenarios ===');
    console.log('1. Try adding 2 apples to daily log (should succeed, 8 remaining)');
    console.log('2. Try adding 6 apples to daily log (should fail, only 8 available)');
    console.log('3. Try adding orange to daily log (should fail, not in inventory)');
    console.log('4. Try adding 1 milk to daily log (should succeed, 1 remaining)');

    console.log('\n=== API Test Commands ===');
    console.log('To test with curl, use these commands (replace TOKEN with actual auth token):');

    insertedItems.forEach(item => {
      console.log(`\nTesting ${item.itemName}:`);
      console.log(`# Should succeed (consume 1 ${item.itemName}):`);
      console.log(`curl -X POST http://localhost:5000/api/daily-log \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{
    "item": {
      "itemName": "${item.itemName}",
      "quantity": 1,
      "category": "${item.category}",
      "mealType": "snack"
    }
  }'`);

      console.log(`\n# Should fail (consume too many ${item.itemName}s):`);
      console.log(`curl -X POST http://localhost:5000/api/daily-log \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{
    "item": {
      "itemName": "${item.itemName}",
      "quantity": ${item.quantity + 5},
      "category": "${item.category}",
      "mealType": "snack"
    }
  }'`);
    });

  } catch (error) {
    console.error('Error setting up test inventory:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

setupTestInventory();