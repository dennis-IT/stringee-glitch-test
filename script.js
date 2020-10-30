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