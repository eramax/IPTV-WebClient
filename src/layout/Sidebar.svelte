<script>
  import { TvStore } from "./../lib/store.js";
  export let AppFullscreen;
  export let PlayerFullscreen;
  export let PlayerShutdown;
  export let PlayerPlay;
  export let status;

  let playingId = "";
  let selectedId = 0;
  let selectedGroup = 0;
  let playlist = [];
  let playlistLength = 0;
  let groupsLength = 0;
  let groupName = "";
  let selectedChannelName = "";

  const NextGroup = () => {
    if (selectedGroup < groupsLength - 1) {
      selectedGroup++;
    }
  };

  const PrevGroup = () => {
    if (selectedGroup > 0) {
      selectedGroup--;
    }
  };

  const Shutdow = () => {
    PlayerShutdown();
    playingId = "";
  };

  const handleKeydown = (event) => {
    let keyCode = event.keyCode;
    //console.log("keyCode", keyCode);
    event.preventDefault();
    event.stopPropagation();

    if (keyCode == 39) NextGroup();
    if (keyCode == 37) PrevGroup();
    if (keyCode == 40) ScrollNext();
    if (keyCode == 38) ScrollPrev();
    if (keyCode == 13) PlayChannel(selectedId);
    if (keyCode == 96) AppFullscreen();
  };

  const ScrollNext = () => {
    let el = document.getElementById("ch-" + (selectedId + 1));
    if (el != null) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      selectedId++;
    }
  };

  const ScrollPrev = () => {
    if (selectedId === 0) return;
    let el = document.getElementById("ch-" + (selectedId - 1));
    if (el != null) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      selectedId--;
    }
  };

  const PlayChannel = (sid) => {
    let el = document.getElementById("ch-" + sid);
    if (el != null) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      selectedId = sid;

      let channel = $TvStore.groups[selectedGroup].items[sid];
      if (playingId === channel.stream_id) {
        PlayerFullscreen();
      } else {
        selectedChannelName = channel.name;
        channel.url = TvStore.Xtream_get_link(channel);
        console.log("play", channel);
        PlayerPlay(channel);
        playingId = channel.stream_id;
      }
    }
  };
  const loadChannels = (grs, gid) => {
    if (grs[gid] === undefined) return;
    groupName = grs[gid].category_name;
    playlist = grs[gid].items;
    playlistLength = playlist.length;
    selectedId = 0;
    let plist = document.getElementById("plist");
    if (plist) plist.scrollTo(0, 0);
  };

  const initGroup = (grs) => {
    selectedGroup = 0;
    groupsLength = grs.length;
  };

  const loadVod = () => {
    TvStore.Xtream_Load_Vod();
  };

  const loadLive = () => {
    TvStore.Xtream_Load_Live();
  };

  $: initGroup($TvStore.groups);
  $: loadChannels($TvStore.groups, selectedGroup);
</script>

<svelte:window on:keydown={handleKeydown} />

<div
  class="flex flex-row overflow-hidden w-full select-none bg-gray-800
    border-gray-800 h-screen">
  <ul class="h-full bg-gray-700" style="width:50px">
    <li on:click={loadLive}>
      <img
        src="assets/tv.png"
        class={`text-white font-bold p-2 rounded mb-2  ${$TvStore.mode == 'live' ? 'bg-orange-700' : 'hover:bg-gray-500'} `}
        alt="" />
    </li>
    <li on:click={loadVod}>
      <img
        src="assets/movies.png"
        class={`text-white font-bold p-2 rounded mb-2  ${$TvStore.mode == 'vod' ? 'bg-orange-700' : 'hover:bg-gray-500'} `}
        alt="" />
    </li>
    <li>
      <img
        src="assets/tvseries.png"
        class={`text-white font-bold p-2 rounded mb-2  ${$TvStore.mode == 'series' ? 'bg-orange-700' : 'hover:bg-gray-500'} `}
        alt="" />
    </li>
    <li>
      <img
        src="assets/youtube.png"
        class={`text-white font-bold p-2 rounded mb-2 ${$TvStore.mode == 'youtube' ? 'bg-orange-700' : 'hover:bg-gray-500'} `}
        alt="" />
    </li>
    <li>
      <img
        src="assets/fullscreen.png"
        class={` text-white font-bold p-2 rounded mb-2 hover:bg-gray-500 `}
        alt=""
        on:click={() => AppFullscreen()} />
    </li>
    <li>
      <img
        src="assets/off.png"
        class={` text-white font-bold p-2 rounded mb-2 ${status['playing'] ? 'hover:bg-gray-500' : 'bg-red-500'} `}
        alt=""
        on:click={() => Shutdow()} />
    </li>
  </ul>
  <div
    class="h-full bg-gray-900 flex flex-col w-full text-white cursor-pointer
      no-underline whitespace-no-wrap truncate">
    {#if playlistLength > 0}
      <div
        class="flex flex-row text-lg font-extrabold text-center justify-between
          bg-gray-700 p-2">
        <span on:click={PrevGroup} >
          <img
            src="assets/next.png"
            class={`hover:bg-gray-500  bg-gray-600 w-6 h-6  rounded-full flex items-center justify-center shadow-md } `}
            style="transform: scaleX(-1);"
            alt="" />
        </span>
        <h1 class="items-center align-middle h-6 whitespace-no-wrap truncate">
          {groupName}
        </h1>
        <span on:click={NextGroup} >
          <img
            src="assets/next.png"
            class={`hover:bg-gray-500 bg-gray-600 w-6 h-6  rounded-full flex items-center justify-center shadow-md } `}
            alt="" /></span>
      </div>

      <div
        class="h-full overflow-y-scroll overflow-x-hidden text-gray-300"
        id="plist">
        <ul class="list-reset flex flex-col text-center">
          {#each playlist as item, idx}
            <li
              id={'ch-' + idx}
              class={`block py-2 pl-1 align-middle  border-b-2  pl-3 ${selectedId == idx ? 'border-4 border-orange-700' : ''} ${playingId == item.stream_id ? 'bg-orange-800' : ''}`}
              on:click={() => PlayChannel(idx)}>
              <div class="flex">
                <img
                  src="assets/channel.png"
                  loading="lazy"
                  alt=""
                  class="w-6 h-6" />
                <span
                  class="w-auto pl-4 font-semibold truncate">{item.name}</span>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>


