<script>
  import { HlsPlayer } from "../lib/iptv";
  import { setFullscreen } from "../lib/common";
  import { TvStore } from "../lib/store";
  import { onMount } from "svelte";

  let selectedChannel;
  let playerId;
  let playing = "";
  let hls_player = null;

  export const Fullscreen = () => setFullscreen(playerId);
  export const Shutdown = () => hls_player.destroy();
  export const PlayerPlay = (channel) => {
    console.log(channel);
    selectedChannel = channel;

    if ($TvStore.mode === "live") {
      playing = "";
      selectedChannel = channel;
      hls_player.play(selectedChannel.url);
    } else {
      hls_player.destroy();
      playerId.src = selectedChannel.url;
    }
  };
  onMount(async () => {
    hls_player = new HlsPlayer(
      playerId,
      (e, d) => (playing = "error"),
      (e, d) => console.error(e, d)
    );
  });
</script>

<div class="flex-1 flex bg-gray-300 overflow-hidden">
  <video
    id="vod"
    type="video/mp4"
    bind:this={playerId}
    class="w-full h-full bg-black"
    controls
    disabled
    crossorigin
    volume="100"
    preload />
</div>

{#if playing === 'error'}
  <div class="absolute top-0 right-0 mt-3 w-64">
    <div
      class="bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4
        py-3 shadow-md"
      role="alert">
      <div class="flex">
        <div class="py-1">
          <svg
            class="fill-current h-6 w-6 text-teal-500 mr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"><path
              d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg>
        </div>
        <div>
          <p class="font-bold">{selectedChannel.name}</p>
          <p class="text-sm">Not working.</p>
        </div>
      </div>
    </div>
  </div>
{/if}
