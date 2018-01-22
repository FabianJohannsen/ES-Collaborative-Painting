/* eslint no-console: 0 */
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const image = require('./routes/image');

const PORT = process.env.PORT || 3000;

app.use('/', image);

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('drawing', data => io.emit('drawing-data', data));
    socket.on('image', data => io.emit('image-data', data));
    socket.on('path-end', data => io.emit('path-end-data', data));
    socket.on('undo', id => io.emit('undo-id', id));
    socket.on('redo', id => io.emit('redo-id', id));
    socket.on('disconnect', () => console.log('A user disconnected'));
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
