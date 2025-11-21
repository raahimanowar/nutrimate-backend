import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FoodInventory from './dist/schemas/foodInventory.schema.js';

dotenv.config();

const sampleData = [
  { name: 'Apple', category: 'fruit', expirationDays: 7, costPerUnit: 0.5, quantity: 10 },
  { name: 'Banana', category: 'fruit', expirationDays: 5, costPerUnit: 0.3, quantity: 15 },
  { name: 'Carrot', category: 'vegetable', expirationDays: 14, costPerUnit: 0.2, quantity: 20 },
  { name: 'Milk', category: 'dairy', expirationDays: 7, costPerUnit: 2.5, quantity: 5 },
  { name: 'Bread', category: 'grains', expirationDays: 5, costPerUnit: 2.0, quantity: 8 },
  { name: 'Chicken', category: 'protein', expirationDays: 3, costPerUnit: 5.0, quantity: 3 },
  { name: 'Orange Juice', category: 'beverages', expirationDays: 10, costPerUnit: 3.5, quantity: 6 },
  { name: 'Potato Chips', category: 'snacks', expirationDays: 30, costPerUnit: 1.5, quantity: 12 },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');

    // Clear existing data
    await FoodInventory.deleteMany({});
    console.log('Cleared existing FoodInventory data');

    // Insert sample data
    const insertedItems = await FoodInventory.insertMany(sampleData);
    console.log(`Successfully inserted ${insertedItems.length} items into FoodInventory`);

    // Display inserted items
    console.log('Inserted items:');
    insertedItems.forEach(item => {
      console.log(`- ${item.name} (${item.category}): $${item.costPerUnit}, ${item.quantity} units`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();