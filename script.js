const vm = new Vue({
  el: '#app',
  data: {
    userToken: '',
    roomToken: '',
    roomId: '',
    room: undefined,
    client: undefined
  },
  mounted() {
    api.setRestToken()
  },
  methods: {
    login: function() {
      //Create a promise
      return new Promise(async resolve );
      
      //Create a random userId
      const userId = (Math.random() * 10000).toFixed(0);
      
      //Get user Token from userId
      const userToken = await api.getUserToken(userId);
      this.userToken = userToken;
      
      //Connect to stringee
      const client = new StringeeClient();
      client.on('authen', (result) => {
        console.log('on authen', result);
      });
      
      client.connect(userToken);
    },
    createRoom: async function() {
      console.log('create room');
      const room = await api.createRoom();
      const roomToken = await api.getRoomToken(room.roomId);
      
      //Assign roomToken to data
      this.roomId = room.roomId;
      this.roomToken = roomToken;
    },
    joinRoom: async function() {
      const roomId = prompt('Paste room Id here');
      
      if(!roomId) {
        return;
      }
      
      const roomToken = await api.getRoomToken(roomId);      
      this.roomId = roomId;
      this.roomToken = roomToken;
    }
  }
})