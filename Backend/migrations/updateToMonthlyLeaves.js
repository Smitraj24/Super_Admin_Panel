import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.models.js';

dotenv.config();

const updateToMonthlyLeaves = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);
    console.log('');

    let updated = 0;
    for (const user of users) {
      // Set new monthly leave balance
      user.leaveBalance.PL = 1;  
      user.leaveBalance.SL = 1;  
      user.leaveBalance.CL = "♾️"; 
      user.leaveBalance.DL = 0;  
      user.lastLeaveRefill = new Date(); 

      await user.save();
      updated++;
      console.log(`Updated: ${user.name} (${user.email})`);
      console.log(`   PL: 1 | SL: 1 | CL: ♾️ | DL: 0`);
    }


    process.exit(0);
  } catch (error) {
    console.error('Error updating to monthly leaves:', error);
    process.exit(1);
  }
};

updateToMonthlyLeaves();
