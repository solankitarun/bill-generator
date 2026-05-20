const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./db');
const User = require('./models/User');

const seedAdminUser = async () => {
    await connectDB();
    
    try {
        const username = 'admin';
        const password = 'zxc@123'; 

        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await User.findOne({ username });
        
        if (existingUser) {
            await User.updateOne({ username }, { password: hashedPassword });
            console.log('Admin user password updated successfully.');
        } else {
            const newUser = new User({
                username,
                password: hashedPassword
            });
            await newUser.save();
            console.log('Admin user created successfully.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdminUser();
