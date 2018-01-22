const url = 'http://localhost:3000';

export async function saveImage(data) {
    await fetch(`${url}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    }).then((res) => {
        if (!res.ok) { throw Error(res.statusText); }
        return res;
    }).catch(e => console.error(e));
}

export function getImage(id) {
    return 0;
}
