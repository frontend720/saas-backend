import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Project } from '../models/index.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-app';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[seed] Connected to MongoDB');

    // Clear existing data (dev only!)
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
    ]);
    console.log('[seed] Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      tier: 'enterprise',
    });
    console.log(`[seed] Created admin: ${admin.email}`);

    // Create a free-tier user
    const freeUser = await User.create({
      name: 'Free User',
      email: 'free@example.com',
      password: 'password123',
      role: 'user',
      tier: 'free',
    });
    console.log(`[seed] Created user: ${freeUser.email}`);

    // Create a pro user
    const proUser = await User.create({
      name: 'Pro User',
      email: 'pro@example.com',
      password: 'password123',
      role: 'pro',
      tier: 'pro',
    });
    console.log(`[seed] Created user: ${proUser.email}`);

    // Create sample projects
    const projects = await Project.create([
      {
        owner: freeUser._id,
        name: 'My First Project',
        description: 'A sample project for the free tier user',
        status: 'active',
        tags: ['sample', 'starter'],
      },
      {
        owner: proUser._id,
        name: 'Pro Portfolio Site',
        description: 'A professional portfolio built on the pro tier',
        status: 'active',
        tags: ['portfolio', 'pro'],
        collaborators: [{ user: freeUser._id, role: 'viewer' }],
      },
      {
        owner: admin._id,
        name: 'Platform Admin Dashboard',
        description: 'Internal admin tooling',
        status: 'active',
        tags: ['admin', 'internal'],
      },
    ]);
    console.log(`[seed] Created ${projects.length} projects`);

    console.log('\n[seed] Done! Login credentials:');
    console.log('  Admin:    admin@example.com / password123');
    console.log('  Free:     free@example.com  / password123');
    console.log('  Pro:      pro@example.com   / password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err);
    process.exit(1);
  }
};

seed();
