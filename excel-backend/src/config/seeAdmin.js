import User from '../models/User.js';
import bcrypt from 'bcrypt';

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    return;
  }

  const existingAdmin = await User.findOne({ useremail: adminEmail });

  if (existingAdmin) {
    console.log('ℹ️ Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const newAdmin = new User({
    username: 'Admin',
    useremail: adminEmail,
    password: hashedPassword,
    role: 'admin',
    status: 'active',
  });

  await newAdmin.save();
  console.log('✅ Admin user created');
};

export default seedAdmin;
