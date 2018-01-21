export function paint(ctx, path, socket) {
    ctx.beginPath();
    ctx.lineWidth = path.options.lineWidth;
    ctx.strokeStyle = path.options.color;
    ctx.moveTo(path.currentPos.x, path.currentPos.y);
    ctx.lineTo(path.previousPos.x, path.previousPos.y);
    ctx.stroke();
    if (socket) {
        socket.emit('drawing', {
            currentPos: path.currentPos,
            previousPos: path.previousPos,
            options: path.options,
        });
    }
}

export async function repaint(ctx, paths) {
    for (const path of paths) {
        if (path.image) {
            await renderImg(ctx, path.image); // Could maybe be done in a nicer way
        } else {
            ctx.strokeStyle = path.options.color;
            ctx.lineWidth = path.options.lineWidth;
            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (const point of path.points) {
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
