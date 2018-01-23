import config from '../config';

export async function saveImage(data) {
    await fetch(`${config.url}:${config.port}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    }).then((res) => {
        if (!res.ok) { throw Error(res.statusText); }
        alert('Canvas saved');
        return res;
    }).catch(e => console.error(e));
}

export async function getImages() {
    const response = await fetch(`${config.url}:${config.port}/image`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    const json = await response.json();
    return json;
}

export async function getImageById(id) {
    const response = await fetch(`${config.url}:${config.port}/image/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    const json = await response.json();
    return json;
}
