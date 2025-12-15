let currentSong = new Audio();
let songs;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00 ";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder = "") {
  let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/Songs/")[1]);
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = "/Songs/" + track;
  if (!pause) {
    currentSong.play();
    play.src = "SVG/pause.svg";
  }

  // Clean song name (decode %20 and remove .mp3)
  let cleanName = decodeURIComponent(track).replace(".mp3", "");
  document.querySelector(".song-info").innerHTML = cleanName;
  document.querySelector(".song-time").innerHTML = "00:00 / 00:00";

  // Showing in Now Playing card
  document.getElementById("now-playing-card").style.display = "block";
  document.getElementById("song-title").innerText = cleanName;
};

async function main() {
  // Getting list of all the songs
  songs = await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // Showing all the songs in the playlist
  let songUl = document
    .querySelector(".lib-cards")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML += `
      <li>
        <img class="invert" width="34" src="" alt="">
        <div class="info">
          <div class="song-title">${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="" alt="">
        </div>
      </li>`;
  }

  Array.from(
    document.querySelector(".lib-cards").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      const songName = e.querySelector(".song-title").innerText.trim();
      console.log(songName);
      playMusic(songName);
    });
  });

  // Attaching an event listener to play, next & previous.
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "SVG/pause.svg";
    } else {
      currentSong.pause();
      play.src = "SVG/play.svg";
    }
  });

  // Listen for timeupdate event.
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Adding an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Adding an event listener for previous button.
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Adding an event listener for next button.
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  Array.from(document.getElementsByClassName("box")).forEach((box) => {
    box.addEventListener("click", async () => {
      const folder = box.dataset.folder;
      songs = await getSongs(folder);

      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });
}

main();
