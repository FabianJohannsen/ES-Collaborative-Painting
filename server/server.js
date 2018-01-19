/* eslint no-console: 0 */

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hellooo');
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('drawing', data => socket.broadcast.emit('drawing-data', data));
    socket.on('image', data => socket.broadcast.emit('image-data', data));
    socket.on('disconnect', () => console.log('A user disconnected'));
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
