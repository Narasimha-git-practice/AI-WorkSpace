const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Load all models
const User = require('../models/User');
const Note = require('../models/Note');
const Task = require('../models/Task');
const Email = require('../models/Email');
const Document = require('../models/Document');
const File = require('../models/File');
const VoiceNote = require('../models/VoiceNote');
const AIHistory = require('../models/AIHistory');

const initDatabase = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.error('\n❌ Error: Please configure your real MongoDB Atlas connection string in the server/.env file.\n');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ Connected successfully to Host: ${conn.connection.host}`);
    console.log(`📡 Database Name: ${conn.connection.name}`);

    console.log('\n🔄 Initializing tables / collections and compiling schemas...');
    
    const models = [
      { name: 'User', model: User },
      { name: 'Note', model: Note },
      { name: 'Task', model: Task },
      { name: 'Email', model: Email },
      { name: 'Document', model: Document },
      { name: 'File', model: File },
      { name: 'VoiceNote', model: VoiceNote },
      { name: 'AIHistory', model: AIHistory }
    ];

    for (const item of models) {
      console.log(`  - Synchronizing indexes for collection: ${item.model.collection.name} (${item.name})`);
      await item.model.syncIndexes();
    }

    console.log('\n🎉 MongoDB Atlas structure successfully initialized! All tables and text indexes are created.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Database initialization failed: ${error.message}\n`);
    process.exit(1);
  }
};

initDatabase();
