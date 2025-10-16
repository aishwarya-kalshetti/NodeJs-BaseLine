const mongoose = require('mongoose');
const User = require('./models/User');
const Feedback = require('./models/Feedback');
require('dotenv').config();

async function viewDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('-password');
    console.log('👥 USERS IN DATABASE:');
    console.log('====================');
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Verified: ${user.isVerified ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt || 'Unknown'}`);
        console.log('   ---');
      });
    }

    // Get all feedback
    const feedbacks = await Feedback.find({}).populate('userId', 'name email');
    console.log('\n💬 FEEDBACK IN DATABASE:');
    console.log('========================');
    if (feedbacks.length === 0) {
      console.log('No feedback found in database');
    } else {
      feedbacks.forEach((feedback, index) => {
        console.log(`${index + 1}. User: ${feedback.userId ? feedback.userId.name : 'Unknown'}`);
        console.log(`   Email: ${feedback.userId ? feedback.userId.email : 'Unknown'}`);
        console.log(`   Feedback: ${feedback.feedbackText}`);
        console.log(`   Created: ${feedback.createdAt}`);
        console.log('   ---');
      });
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Feedback: ${feedbacks.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

viewDatabase();

