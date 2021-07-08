import parser from 'iptv-playlist-parser'
import Hls from "hls.js/dist/hls.light";

const hls_config = {
    manifestLoadingMaxRetry: 100,
    manifestLoadingMaxRetryTimeOut: 300,
    manifestLoadingRetryDelay: 1000,
    manifestLoadingTimeOut: 30000,

    levelLoadingMaxRetry: 100,
    levelLoadingMaxRetryTimeOut: 300,
    levelLoadingRetryDelay: 1000,
    levelLoadingTimeOut: 30000,

    fragLoadingMaxRetry: 100,
    fragLoadingMaxRetryTimeOut: 300,
    fragLoadingRetryDelay: 1000,
    fragLoadingTimeOut: 600000,

    autoStartLoad: true,
    startFragPrefetch: true,
    testBandwidth: false,
    enableWorker: true,
    debug: false//options.debug,
}

export const HlsPlayer = function (playerId, critical_errorHandler, all_errorsHandler) {
    this.hls = null;
    this.old_hls = null;
    this.needAttach = true;
    this.playerId = playerId;
    this.onCrash = critical_errorHandler;
    this.onError = all_errorsHandler;
    console.log("HlsPlayer", this);
    var self = this

    this.destroy = () => {
        if (this.hls != null) {
            this.hls.destroy();
            this.hls = null
        }
    }

    this.start = () => {
        if (this.hls != null) {
            this.hls.startLoad();
        }
    }
    this.stop = () => {
        if (this.hls != null) {
            this.hls.stopLoad();
        }
    }

    this.play = (url) => {
        console.log(url, this)
        if (this.playerId === undefined || url === undefined) return;
        if (this.hls !== null) {
            this.old_hls = this.hls;
            this.old_hls.stopLoad();
            this.needAttach = true;
            console.log("stopLoad");
        }
        this.hls = new Hls(hls_config);

        this.hls.on(Hls.Events.FRAG_PARSED, function (event, data) {
            //if (self.old_hls !== null) {    console.log("detachMedia"); self.old_hls.detachMedia();       }
            if (self.needAttach || self.playerId.src === "") {
                self.hls.attachMedia(self.playerId);
                self.needAttach = false;
                console.log("attachMedia");
            }

            self.playerId.play()

            if (self.old_hls !== null) {
                self.old_hls.destroy();
            }
        })
        this.hls.on(Hls.Events.ERROR, function (event, data) {
            data.type = event
            console.error(event, data)
            self.onError(event, data);

            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error('Media error', event)
                        this.swapAudioCodec()
                        this.recoverMediaError()
                        break
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error('Network error', event)
                        this.startLoad();
                        break
                    default:
                        console.error('Unrecoverable error', event)
                        self.onCrash(event, data);
                        this.destroy();
                        self.hls = self.old_hls;
                        self.start();
                        break
                }
            }
        })
        this.hls.loadSource(url);
    }
}


const filterChannels = (p) =>
    !p.name.includes("--") &&
    !p.name.includes("==") &&
    !p.name.includes("<<") &&
    !p.name.includes(">>") &&
    !p.name.includes("##") &&
    !p.name.includes("__") &&
    !p.name.includes("%%") &&
    !p.name.includes("$$") &&
    !p.name.includes("%%") &&
    !p.name.includes("**");

export const buildPlaylist = (grs, chs) => {
    let channels = {}
    if (chs !== null && grs !== null) {
        chs.map(ch => {
            let c = "cat" + ch.category_id;
            if (!channels.hasOwnProperty(c)) channels[c] = [];
            if (filterChannels(ch)) channels[c].push({
                name: ch.name,
                stream_id: ch.stream_id,
                ext: ch.container_extension || "m3u8",
                icon: ch.stream_icon,
                epg: ch.epg_channel_id || "",
                rate: ch.rating || 0
            })
        })
        grs.forEach((g, i) => {
            let k = "cat" + g.category_id;
            if (k in channels && channels[k].length > 0) grs[i].items = channels[k];
            else delete grs[i];
        })
        console.log(grs);
        return grs;
    }
}


export async function ParseM3u(x) {
    const expiry = 7 * 24 * 60 * 60 // 7 days default
    let res = await cachedFetch(x, expiry)
    const parsed = parser.parse(res)
    let list = []
    parsed.items.forEach(p => {
        if (filterChannels(p)) {
            if (!list.hasOwnProperty(p.group.title)) list[p.group.title] = []
            list[p.group.title].push({
                url: p.url,
                name: p.name.trim(),
                logo: 'assets/channel.png'
            })
        }
    })
    let fin = []
    let idx = 0;
    Object.keys(list).forEach(g => {
        if (list[g].length > 0) {
            list[g].forEach(t => { t['id'] = idx++ })
            fin.push({ name: g, channels: list[g] })
        }

    })
    console.log("iptv", fin);
    return fin;
}
