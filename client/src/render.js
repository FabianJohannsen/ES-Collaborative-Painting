export function paint(ctx, path) {
    ctx.beginPath();
    ctx.lineWidth = path.options.lineWidth;
    ctx.strokeStyle = path.options.color;
    ctx.moveTo(path.currentPos.x, path.currentPos.y);
    ctx.lineTo(path.previousPos.x, path.previousPos.y);
    ctx.stroke();
}

export async function repaint(ctx, paths) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (const pathObj of paths) {
        if (pathObj.image) {
            await renderImg(ctx, pathObj.image); // Could maybe be done in a nicer way
        } else {
            ctx.strokeStyle = pathObj.path.options.color;
            ctx.lineWidth = pathObj.path.options.lineWidth;
            ctx.beginPath();
            ctx.moveTo(pathObj.path.points[0].x, pathObj.path.points[0].y);
            for (const point of pathObj.path.points) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
    }
}

export function renderImg(ctx, src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(ctx.drawImage(image, 0, 0, image.width, image.height));
        image.onerror = reject;
        image.src = src;
    });
}
