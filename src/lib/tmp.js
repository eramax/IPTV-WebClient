import { writable, get } from 'svelte/store'
import { ParseM3u, buildPlaylist } from "./iptv";
import { XtreamCodesApi } from "./XtreamCodesApi";

export const Groups = writable({ groups: [], mode: "live" })
export const XtreamClient = writable({ xtreamclient : null })
export const PlayLink = writable({ playLink: null })
export const Mode = writable({mode: "live" })

export const LoadPlaylistM3u =  async (url) => {
 /* const data = await ParseM3u(url);
  let items = get(TvStore)
  items.playlist = data;
  Tv.set(items);*/
}
export const LoadPlaylistJson =  async (url) => {
  /*let items = get(TvStore)
  const data = await (await fetch(url)).body();
  items.playlist = data;
  Tv.set(items);*/
}
export const  XtreamLogin = (host, username, password, proxy = "") => {
  $XtreamClient = new XtreamCodesApi(host, username, password, proxy);
}
export const  Xtream_Load_Live = async () => {
  let grs = await items.xtreamclient.get_live_categories();
  let chs = await items.xtreamclient.get_live_streams();
  console.log(grs,chs)
  $Groups = buildPlaylist(grs, chs);
  $Mode = "live";
}
export const Xtream_Load_Vod = async () => {
  let items = get(TvStore)
  let grs = await items.xtreamclient.get_vod_categories();
  let chs = await items.xtreamclient.get_vod_streams();
  console.log(grs,chs)
  $Groups = buildPlaylist(grs, chs);
  $Mode = "vod";
}
export const Xtream_get_link = (channel) => {
  return $XtreamClient.get_link(channel, $Mode.mode);
}
