<script>
  import { TvStore } from "./lib/store.js";
  import Player from "./layout/Player.svelte";
  import { setFullscreen } from "./lib/common";
  import Sidebar from "./layout/Sidebar.svelte";
  import { onMount } from "svelte";

  let app;
  let PlaylistUrl = "assets/tv.m3u";
  let selected = {};
  let playlist = [];
  let player;
  let status = {};

  let host = "http://xxxxxx.net";
  let username = "xxxxx";
  let password = "xxxxxxx";
  let proxy = "https://cors-anywhere.herokuapp.com/";

  onMount(async () => {
    //await TvStore.LoadPlaylistM3u(PlaylistUrl);
    TvStore.XtreamLogin(host, username, password, proxy);
    await LoadLiveMode();
  });

  const LoadLiveMode = async () => {
    await TvStore.Xtream_Load_Live();
  };

 
  const AppFullscreen = () => {
    setFullscreen(app);
  };

  const PlayerFullscreen = () => {
    player.Fullscreen();
  };

  const PlayerShutdown = () => {
    status["playing"] = false;
    player.Shutdown();
  };

  const PlayerPlay = (url) => {
    status["playing"] = true;
    player.PlayerPlay(url);
  };
</script>

<div bind:this={app} class="h-screen flex flex-row overflow-hidden">
  <div class="flex flex-col" style="width: 350px">
    <Sidebar
      {PlaylistUrl}
      {PlayerPlay}
      {AppFullscreen}
      {PlayerFullscreen}
      {PlayerShutdown}
      {status} />
  </div>

  <div class="flex-1 flex overflow-hidden w-full">
    <Player bind:this={player} channel={selected} />
  </div>
</div>
