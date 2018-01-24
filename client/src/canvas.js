import io from 'socket.io-client';
import config from '../config';

import Path from './path';
import Brush from './brush';
import { paint, repaint, renderImg, renderSavedCanvas } from './render';
import { saveImage, getImages, getImageById } from './http';

export default class Canvas {
    constructor(canvas, ctx) {
        // Set canvas and context
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.lineCap = this.ctx.lineJoin = 'round'; // Makes the painting smoother
        // Class variables
        this.drawing = false;
        this.path = null;
        // Initlialize Brush
        this.brush = new Brush();
        // Socket events
        this.socket = io(`${config.url}:${config.port}`);
        this.socket.on('drawing-data', data => paint(this.ctx, data));
        this.socket.on('image-data', data => renderImg(this.ctx, data.image));
        this.socket.on('repaint', data => repaint(this.ctx, data));
        this.socket.on('render-canvas', data => renderSavedCanvas(this.ctx, data));
        this.socket.on('list-canvases', () => this.listImages());
        // Undo & Redo buttons
        this.undoBtn = document.getElementById('undo');
        this.redoBtn = document.getElementById('redo');
        // Save button
        this.saveBtn = document.getElementById('save');
        // List saved images
        this.list = document.getElementById('images');
        this.listImages();
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
        this.undoBtn.addEventListener('click', () => this.socket.emit('undo', this.socket.id));
        this.redoBtn.addEventListener('click', () => this.socket.emit('redo', this.socket.id));
        // Save button event listener
        this.saveBtn.addEventListener('click', () => saveImage(this.canvas.toDataURL())
            .then(() => this.socket.emit('canvas-saved')));
    }

    start(e) {
        const options = {
            lineWidth: this.brush.lineWidth,
            color: this.brush.color,
        };
        const x = e.pageX - this.canvas.offsetLeft;
        const y = e.pageY - this.canvas.offsetTop;
        this.path = new Path(x, y, options);
        this.drawing = true;
        this.socket.emit('drawing', {
            currentPos: this.path.getCurrentPos,
            previousPos: this.path.getPreviousPos,
            options: this.path.options,
        });
    }

    move(e) {
        if (!this.drawing) { return; }
        this.path.addPoint(e.pageX - this.canvas.offsetLeft, e.pageY - this.canvas.offsetTop);
        this.socket.emit('drawing', {
            currentPos: this.path.getCurrentPos,
            previousPos: this.path.getPreviousPos,
            options: this.path.options,
        });
    }

    stop() {
        if (!this.drawing) { return; }
        this.drawing = false;
        this.socket.emit('path-end', { path: this.path, id: this.socket.id });
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
            this.socket.emit('image', { image: loadEvent.target.result, id: this.socket.id });
        };
        reader.readAsDataURL(src);
    }

    listImages() {
        // Empty list
        this.list.innerHTML = '';
        getImages().then((ids) => {
            for (const id of ids) {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.textContent = id;
                a.setAttribute('href', '#');
                a.onclick = () => {
                    getImageById(a.innerHTML).then((res) => {
                        this.socket.emit('load-canvas', { image: res.data, id: this.socket.id });
                    });
                };
                li.appendChild(a);
                this.list.appendChild(li);
            }
        });
    }
}
