export const cachedFetch = async (url, expiry) => {
    let cacheKey = url
    let cached = localStorage.getItem(cacheKey)
    let whenCached = localStorage.getItem(cacheKey + ':ts')
    if (cached !== null && whenCached !== null) {
        let age = (Date.now() - whenCached) / 1000
        if (age < expiry) {
            return Promise.resolve(cached)
        } else {
            localStorage.removeItem(cacheKey)
            localStorage.removeItem(cacheKey + ':ts')
        }
    }
    console.log("Fetching")
    let req = await fetch(url, { cache: "force-cache", referrer: "" })
    let res = await req.text()
    if (res.length <= 5000000) {
        localStorage.setItem(cacheKey, res)
        localStorage.setItem(cacheKey + ':ts', Date.now())
    }
    return res;
}

export const cacheIt = (url, data) => {
    let objectLength = Object.keys(data).length
    if (objectLength <= 5000000)  localStorage.setItem(url, JSON.stringify(data))
}

export const checkCache = (url) => {
    let x = localStorage.getItem(url);
    if(x === null)return null;
    return JSON.parse(x);
}


export const setFullscreen = (elem) => {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}