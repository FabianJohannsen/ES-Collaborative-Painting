/* eslint no-console: 0 */
const express = require('express');
const cors = require('cors');
const image = require('./routes/image');

const app = express();

const PORT = process.env.PORT || 3000;

// CORS
app.use(cors());

// JSON body parser thingy
app.use(express.json());

// Routes
app.use('/', image);

// Sockets
const http = require('http').Server(app);
require('./socket').listen(http);

// Start server
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
