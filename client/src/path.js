export default class Path {
    constructor(x, y, options) {
        this.options = options;
        this.points = [{ x, y }];
    }

    addPoint(x, y) {
        this.points.push({ x, y });
    }

    get currentPos() {
        return this.points[this.points.length - 1] ?
            { x: this.points[this.points.length - 1].x, y: this.points[this.points.length - 1].y }
            : null;
    }

    get previousPos() {
        return this.points[this.points.length - 2] ?
            { x: this.points[this.points.length - 2].x, y: this.points[this.points.length - 2].y }
            : { x: this.currentPos.x, y: this.currentPos.y };
    }
}
