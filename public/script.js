const socket = io("/");
const myVideo = document.createElement("video");
const videoGrid = document.querySelector(".video-grid");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 3030,
  // 443
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // socket.on("user-connected", (userId) => {
    //   connectToNewUser(userId, stream);
    // });

    //
    socket.on("user-connected", (userId) => {
      // user is joining`
      setTimeout(() => {
        // user joined
        connectToNewUser(userId, stream);
      }, 1000);
    });
  })
  .catch((error) => {
    console.log(error);
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  console.log(videoGrid);

  videoGrid.appendChild(video);
};

// const scrollToBottom=()=>{
//   var d
// }

const input = document.querySelector("#chat_message");

input.addEventListener("keypress", (e) => {
  if (e.charCode == 13 && input.value != "") {
    socket.emit("message", input.value);
    input.value = "";
  }
});

let content = ``;

socket.on("createMessage", (message) => {
  const message_list = document.querySelector("#message-list");

  content += `<li>${message}</li>`;

  message_list.innerHTML = content;

  const chatWindow = document.querySelector(".main_chat_window");

  chatWindow.scrollTop = chatWindow.scrollHeight;

  // scrollToBottom();
});

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class="fa-solid fa-microphone" style="cursor: pointer" onclick="muteUnmute()"></i>`;
  document.querySelector(".mic-icon").innerHTML = html;
  document.querySelector(".mute").textContent = "Mute";
};

const setUnmuteButton = () => {
  const html = `<i class="fa-solid fa-microphone-slash" onclick="muteUnmute()" style="color:red; cursor:pointer"></i>`;
  document.querySelector(".mic-icon").innerHTML = html;
  document.querySelector(".mute").textContent = "Unmute";
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

function setPlayVideo() {
  const html = `<i class="fa-solid fa-video-slash" style="cursor: pointer; color:red" onclick="playStop()"></i>`;
  document.querySelector(".vdo-icon").innerHTML = html;
  document.querySelector(".vdo").textContent = "Play";
}

function setStopVideo() {
  const html = `<i class="fa-solid fa-video" style="cursor: pointer" onclick="playStop()"></i>`;
  document.querySelector(".vdo-icon").innerHTML = html;
  document.querySelector(".vdo").textContent = "Stop";
}
