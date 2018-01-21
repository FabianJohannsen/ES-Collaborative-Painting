import Canvas from './src/canvas';

// Get canvas element and set context
const canvasElement = document.getElementById('canvas');
const ctx = canvasElement.getContext('2d');

// Initialize the application
const canvas = new Canvas(canvasElement, ctx);
canvas.init();
