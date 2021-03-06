const videoContainer = document.querySelector("#videos");

const vm = new Vue({
  el: "#app",
  data: {
    userToken: "",
    roomToken: "",
    roomId: "",
    room: undefined,
    client: undefined
  },
  computed: {
    roomURL: function() {
      return `https://${location.hostname}?room=${this.roomId}`;
    }
  },
  mounted() {
    api.setRestToken();

    //Extract roomID from URL
    const urlParams = new URLSearchParams(location.search);
    const roomId = urlParams.get("room");

    if (roomId) {
      this.roomId = roomId;
      this.joinRoom();
      console.log(roomId);
    }
  },
  methods: {
    login: function() {
      //Create a promise
      return new Promise(async resolve => {
        //Create a random userId
        const userId = (Math.random() * 10000).toFixed(0);

        //Get user Token from userId
        const userToken = await api.getUserToken(userId);
        this.userToken = userToken;

        //Connect to stringee
        const client = new StringeeClient();
        client.on("authen", result => {
          console.log("on authen", result);
          resolve(result);
        });

        client.connect(userToken);

        this.client = client;
      });
    },
    publishVideo: async function() {
      const localTrack = await StringeeVideo.createLocalVideoTrack(
        this.client,
        {
          audio: true,
          video: true,
          videoDimensions: { width: 640, height: 360 }
        }
      );

      const videoElement = localTrack.attach();
      videoContainer.appendChild(videoElement);

      //Start to join a room
      const roomData = await StringeeVideo.joinRoom(
        this.client,
        this.roomToken
      );

      const room = roomData.room;
      console.log({ roomData, room });
      this.room = room;

      room.clearAllOnMethos();

      room.on("addtrack", async event => {
        const trackInfo = event.info.track;

        if (trackInfo.serverId === localTrack.serverId) {
          return;
        }

        this.subscribeTrack(trackInfo);
      });
      room.on("removetrack", event => {
        if (!event.track) {
          return;
        }

        const elements = event.track.detach();
        elements.forEach(element => element.remove());
      });

      //Display all trackinfo in a room
      roomData.listTracksInfo.forEach(trackInfo =>
        this.subscribeTrack(trackInfo)
      );

      room.publish(localTrack);
    },
    createRoom: async function() {
      console.log("create room");
      const room = await api.createRoom();
      const roomToken = await api.getRoomToken(room.roomId);

      //Assign roomToken to data
      this.roomId = room.roomId;
      this.roomToken = roomToken;

      await this.login();
      await this.publishVideo();
    },
    joinRoom: async function(showPrompt = false) {
      if (showPrompt) {
        const roomId = prompt("Paste room Id here");
        if (!roomId) {
          return;
        }
        this.roomId = roomId;
      }

      const roomToken = await api.getRoomToken(this.roomId);
      this.roomToken = roomToken;

      await this.login();
      await this.publishVideo();
    },
    subscribeTrack: async function(trackInfo) {
      const track = await this.room.subscribe(trackInfo.serverId);

      track.on("ready", () => {
        const element = track.attach();
        videoContainer.appendChild(element);
      });
    }
  }
});
