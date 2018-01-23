const socketio = require('socket.io');

module.exports.listen = (app) => {
    const io = socketio(app);

    let canvasObjects = [];
    let undoneObjects = [];

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Paint all objects on connect
        socket.emit('repaint', canvasObjects);

        socket.on('drawing', data => io.emit('drawing-data', data));
        socket.on('image', (data) => {
            canvasObjects.push(data);
            io.emit('image-data', data);
        });
        socket.on('path-end', data => canvasObjects.push(data));
        socket.on('undo', (id) => {
            if (canvasObjects.length > 0) {
                if (canvasObjects.map(obj => obj.id).lastIndexOf(id) !== -1) {
                    undoneObjects.push(canvasObjects
                        .splice(canvasObjects
                            .map(obj => obj.id)
                            .lastIndexOf(id), 1)[0]);
                    io.emit('repaint', canvasObjects);
                }
            }
        });
        socket.on('redo', (id) => {
            if (undoneObjects.length > 0) {
                if (undoneObjects.map(obj => obj.id).lastIndexOf(id) !== -1) {
                    canvasObjects.push(undoneObjects
                        .splice(undoneObjects
                            .map(obj => obj.id)
                            .lastIndexOf(id), 1)[0]);
                    io.emit('repaint', canvasObjects);
                }
            }
        });
        socket.on('load-canvas', (data) => {
            emptyPaths();
            canvasObjects.push(data);
            io.emit('render-canvas', data.image);
        });
        socket.on('disconnect', () => console.log('A user disconnected'));
    });


    function emptyPaths() {
        canvasObjects = [];
        undoneObjects = [];
    }

    return io;
};
