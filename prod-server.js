require('dotenv').config();

process.env.LOG = process.env.LOG || 'ERROR';
process.env.STATIC_DIR = process.env.STATIC_DIR || 'dist';
if (!process.env.PORT) {
  process.env.SERVER_PORT = process.env.SERVER_PORT || '4000';
}

require('./fun-chat-server-main/src/index.js');
