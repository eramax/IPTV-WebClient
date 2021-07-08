import { writable, get } from 'svelte/store'
import { ParseM3u, buildPlaylist } from "./iptv";
import { XtreamCodesApi } from "./XtreamCodesApi";

const Tv = writable({ groups: [], mode: "live", xtreamclient: null, playLink: null })

export const TvStore = {
  subscribe: Tv.subscribe,
  LoadPlaylistM3u: async (url) => {
    const data = await ParseM3u(url);
    let items = get(TvStore)
    items.playlist = data;
    Tv.set(items);
  },
  LoadPlaylistJson: async (url) => {
    let items = get(TvStore)
    const data = await (await fetch(url)).body();
    items.playlist = data;
    Tv.set(items);
  },
  XtreamLogin: (host, username, password, proxy = "") => {
    let items = get(TvStore)
    let dd = new XtreamCodesApi(host, username, password, proxy);
    items.xtreamclient = dd;
    Tv.set(items);
  },
  Xtream_Load_Live: async () => {
    let items = get(TvStore)
    let grs = await items.xtreamclient.get_live_categories();
    let chs = await items.xtreamclient.get_live_streams();
    console.log(grs,chs)
    items.groups = buildPlaylist(grs, chs);
    items.mode = "live";
    Tv.set(items);
  },
  Xtream_Load_Vod: async () => {
    let items = get(TvStore)
    let grs = await items.xtreamclient.get_vod_categories();
    let chs = await items.xtreamclient.get_vod_streams();
    console.log(grs,chs)
    items.groups = buildPlaylist(grs, chs);
    items.mode = "vod";
    Tv.set(items);
  },
  Xtream_get_link: (channel) => {
    let items = get(TvStore)
    return items.xtreamclient.get_link(channel, items.mode);
  }
}
