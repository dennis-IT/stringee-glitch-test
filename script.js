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
  }
})