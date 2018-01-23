/* eslint no-console: 0 */
const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const app = express();

const PORT = process.env.PORT || 3000;

// CORS
app.use(cors());

// JSON body parser thingy
app.use(express.json());

// Sockets
const http = require('http').Server(app);
require('./socket').listen(http);

const adapter = new FileAsync('db.json');
low(adapter)
    .then((db) => {
        // POST /image
        app.post('/image', (req, res) => {
            db.get('images')
                .push(req.body)
                .last()
                .assign({ id: Date.now().toString() })
                .write()
                .then(image => res.send(image));
        });

        // GET /image/:id
        app.get('/image/:id', (req, res) => {
            const image = db.get('images')
                .find({ id: req.params.id })
                .value();

            res.send(image);
        });

        // Set db default values
        return db.defaults({ images: [] }).write();
    })
    .then(() => {
        // Start server
        http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    });
