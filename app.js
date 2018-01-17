// Color picker
import ColorPicker from 'simple-color-picker';
import 'simple-color-picker/src/simple-color-picker.css';

// Get canvas element and set context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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
    paint();
}

function onMouseMove(e) {
    if (!drawing) { return; }
    setCoordinates(e);
    points.push({ x: currentPos.x, y: currentPos.y });
    paint();
}

function onMouseUp() {
    if (!drawing) { return; }
    paths.push({
        path: points,
        options: Object.assign({}, pathOpt),
    });
    drawing = false;
}

// Paint & Repaint
const paint = () => {
    ctx.beginPath();
    ctx.moveTo(currentPos.x, currentPos.y);
    ctx.lineTo(previousPos.x, previousPos.y);
    ctx.stroke();
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

function onImageDrop(e) {
    e.preventDefault();
    loadImage(e.dataTransfer.files[0]);
}

const loadImage = (src) => {
    // Prevent any non-image file type from being read.
    if (!src) { return; }
    if (!src.type.match(/image.*/)) {
        console.log('The dropped file is not an image: ', src.type);
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        renderImg(e.target.result);
        paths.push({ image: e.target.result });
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

// Tools event listener functions
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
    ctx.lineWidth = pathOpt.lineWidth;
    ctx.strokeStyle = pathOpt.color;
    setCoordinates(e);
    ctx.moveTo(currentPos.x, currentPos.y);
    points.push({ x: currentPos.x, y: currentPos.y });
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
