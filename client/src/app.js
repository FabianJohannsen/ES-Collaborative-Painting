import ColorPicker from 'simple-color-picker';
import 'simple-color-picker/src/simple-color-picker.css';
import io from 'socket.io-client';

// Get canvas element and set context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Socket
const socket = io('http://localhost:3000');
socket.on('drawing-data', data => paint(data.currentPos, data.previousPos, data.pathOpt, false));
socket.on('image-data', data => renderImg(data));

let drawing = false;
let currentPos = {};
let previousPos = {};
let points = [];
let pathOpt = {};
let undoPaths = [];

const paths = [];

// Canvas event listeners
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('dragover', (e) => { e.preventDefault(); }, true);
canvas.addEventListener('drop', onImageDrop, true);
// Makes the drawing smoother
ctx.lineCap = ctx.lineJoin = 'round';

/* -- TOOLS -- */
document.getElementById('undo').addEventListener('click', onUndoClick, false);
document.getElementById('redo').addEventListener('click', onRedoClick, false);
const lineWidthSlider = document.getElementById('line-width');
// Init color picker
const colorPicker = new ColorPicker({
    color: '#ff0000',
    background: '#454545',
    el: document.getElementById('color-picker'),
    width: 200,
    height: 200,
});

// Canvas event listener functions
function onMouseDown(e) {
    undoPaths = [];
    initNewPath(e);
    drawing = true;
    paint(currentPos, previousPos, pathOpt, true); // Paint the dot
}

function onMouseMove(e) {
    if (!drawing) { return; }
    setCoordinates(e);
    points.push(currentPos);
    paint(currentPos, previousPos, pathOpt, true);
}

function onMouseUp() {
    if (!drawing) { return; }
    paths.push({
        path: points,
        options: pathOpt,
    });
    drawing = false;
}

// Paint & Repaint
const paint = (currPos, prevPos, opt, emit) => {
    ctx.lineWidth = opt.lineWidth;
    ctx.strokeStyle = opt.color;
    ctx.beginPath();
    ctx.moveTo(currPos.x, currPos.y);
    ctx.lineTo(prevPos.x, prevPos.y);
    ctx.stroke();
    if (emit) { // Prevents constant loop of recieving and emmiting
        socket.emit('drawing', { currentPos, previousPos, pathOpt });
    }
};

const repaint = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (const pathObj of paths) {
        if (pathObj.image) {
            renderImg(pathObj.image);
            ctx.stroke();
        } else {
            ctx.strokeStyle = pathObj.options.color;
            ctx.lineWidth = pathObj.options.lineWidth;
            ctx.beginPath();
            ctx.moveTo(pathObj.path[0].x, pathObj.path[0].y);
            for (const point of pathObj.path) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
    }
};

// Tools event listener functions
function onImageDrop(e) {
    e.preventDefault();
    loadImage(e.dataTransfer.files[0]); // dataTransfer holds the drag and drop operation data
}

const loadImage = (src) => {
    // Prevent any non-image file type from being read.
    if (!src) { return; }
    if (!src.type.match(/image.*/)) {
        console.log('The dropped file is not an image: ', src.type);
        return;
    }
    const reader = new FileReader(); // asynchronously read the contents of file
    reader.onload = (e) => {
        renderImg(e.target.result);
        paths.push({ image: e.target.result });
        socket.emit('image', e.target.result);
    };
    reader.readAsDataURL(src);
};

const renderImg = (src) => {
    const image = new Image();
    image.onload = () => {
        ctx.drawImage(image, 0, 0, image.width, image.height);
    };
    image.src = src;
};

function onUndoClick() {
    if (paths.length !== 0) {
        undoPaths.push(paths.pop());
        repaint();
    }
}

function onRedoClick() {
    if (undoPaths.length !== 0) {
        paths.push(undoPaths.pop());
        repaint();
    }
}

// Helper functions
const initNewPath = (e) => {
    points = [];
    // Set path options
    pathOpt = {
        lineWidth: lineWidthSlider.value,
        color: colorPicker.getHexString(),
    };
    setCoordinates(e);
    ctx.moveTo(currentPos.x, currentPos.y);
    points.push(currentPos);
};

const setCoordinates = (e) => {
    previousPos = {
        x: points.length > 0 ? currentPos.x : e.pageX - canvas.offsetLeft,
        y: points.length > 0 ? currentPos.y : e.pageY - canvas.offsetTop,
    };
    currentPos = {
        x: e.pageX - canvas.offsetLeft,
        y: e.pageY - canvas.offsetTop,
    };
};

