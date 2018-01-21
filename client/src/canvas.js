import io from 'socket.io-client';

import Path from './path';
import Toolset from './tools';
import { paint, repaint, renderImg } from './render';

export default class Canvas {
    constructor(canvas, ctx) {
        // Set canvas and context
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.lineCap = this.ctx.lineJoin = 'round'; // Makes the painting smoother
        // Class variables
        this.drawing = false;
        this.path = null;
        this.paths = [];
        this.undoPaths = [];
        this.incomingPaths = [];
        // Initlialize toolset
        this.tools = new Toolset();
        // Socket events
        this.socket = io('http://localhost:3000');
        this.socket.on('drawing-data', data => paint(this.ctx, data));
        this.socket.on('image-data', data => renderImg(this.ctx, data));
        this.socket.on('path-end-data', data => this.incomingPaths.push(data));
        // Undo & Redo buttons
        this.undoBtn = document.getElementById('undo');
        this.redoBtn = document.getElementById('redo');
    }

    init() {
        // Canvas event listeners
        this.canvas.addEventListener('mousedown', this.start.bind(this));
        this.canvas.addEventListener('mousemove', this.move.bind(this));
        this.canvas.addEventListener('mouseup', this.stop.bind(this));
        this.canvas.addEventListener('mouseout', this.stop.bind(this));
        this.canvas.addEventListener('dragover', (e) => { e.preventDefault(); }, true); // Necessary?
        this.canvas.addEventListener('drop', this.onImageDrop.bind(this), true);
        // Undo & Redo buttons event listeners
        this.undoBtn.addEventListener('click', this.onUndeClick.bind(this, this.paths, this.undoPaths, this.incomingPaths));
        this.redoBtn.addEventListener('click', this.onRedoClick.bind(this, this.paths, this.undoPaths, this.incomingPaths));
    }

    start(e) {
        this.undoPaths = []; // Empty undpPaths to simulate real undo/redo (?)
        const options = {
            lineWidth: this.tools.lineWidth,
            color: this.tools.color,
        };
        const x = e.pageX - this.canvas.offsetLeft;
        const y = e.pageY - this.canvas.offsetTop;
        this.path = new Path(x, y, options);
        this.drawing = true;
        paint(this.ctx, this.path, this.socket);
    }

    move(e) {
        if (!this.drawing) { return; }
        this.path.addPoint(e.pageX - this.canvas.offsetLeft, e.pageY - this.canvas.offsetTop);
        paint(this.ctx, this.path, this.socket);
    }

    stop() {
        if (!this.drawing) { return; }
        this.paths.push(this.path);
        this.drawing = false;
        this.socket.emit('path-end', this.path);
        // console.log(this.socket.id);
    }

    onImageDrop(dropEvent) {
        dropEvent.preventDefault();
        const src = dropEvent.dataTransfer.files[0];
        // Prevent any non-image file type from being read.
        if (!src) { return; }
        if (!src.type.match(/image.*/)) {
            console.log('The dropped file is not an image: ', src.type);
            return;
        }
        const reader = new FileReader(); // asynchronously read the contents of file
        reader.onload = (loadEvent) => {
            renderImg(this.ctx, loadEvent.target.result);
            this.paths.push({ image: loadEvent.target.result });
            this.socket.emit('image', loadEvent.target.result);
        };
        reader.readAsDataURL(src);
    }

    onUndeClick(paths, undoPaths, incomingPaths) {
        if (paths.length !== 0) {
            undoPaths.push(paths.pop());
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            repaint(this.ctx, paths);
            repaint(this.ctx, incomingPaths); // Don't undo paths from other clients
        }
    }

    onRedoClick(paths, undoPaths, incomingPaths) {
        if (undoPaths.length !== 0) {
            paths.push(undoPaths.pop());
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            repaint(this.ctx, paths);
            repaint(this.ctx, incomingPaths); // Don't undo paths from other clients
        }
    }
}
