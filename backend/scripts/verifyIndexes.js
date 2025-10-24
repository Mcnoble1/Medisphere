import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/userModel.js';

dotenv.config();

async function verifyIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('\n=== Current User Collection Indexes ===');
    const indexes = await User.collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Check if any did-related indexes exist
    const didIndexes = indexes.filter(index =>
      index.name && (
        index.name.includes('did') ||
        JSON.stringify(index.key).includes('did')
      )
    );

    if (didIndexes.length > 0) {
      console.log('\n⚠️  WARNING: Found DID-related indexes:');
      console.log(JSON.stringify(didIndexes, null, 2));
      console.log('\n❌ These indexes need to be removed!');
    } else {
      console.log('\n✅ No DID-related indexes found. Database is clean!');
    }

    // Check if any users have did fields
    console.log('\n=== Checking for users with DID fields ===');
    const usersWithDid = await User.find({
      $or: [
        { did: { $exists: true } },
        { didRootPublicKey: { $exists: true } },
        { didAddressBookFileId: { $exists: true } }
      ]
    }).countDocuments();

    if (usersWithDid > 0) {
      console.log(`⚠️  Found ${usersWithDid} users with DID fields`);
      console.log('Consider cleaning up these fields from existing users');
    } else {
      console.log('✅ No users with DID fields found');
    }

    console.log('\n=== Database verification complete ===');
  } catch (error) {
    console.error('Error verifying database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

verifyIndexes();
