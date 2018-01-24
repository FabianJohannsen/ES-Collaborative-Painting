export default class Path {
    constructor(x, y, options) {
        this.options = options;
        this.currentPos = this.previousPos = { x, y };
        this.points = [{ x, y }];
    }

    addPoint(x, y) {
        this.previousPos = { x: this.currentPos.x, y: this.currentPos.y };
        this.currentPos = { x, y };
        this.points.push({ x, y });
    }

    get getCurrentPos() {
        return this.currentPos;
    }

    get getPreviousPos() {
        return this.previousPos;
    }
}
