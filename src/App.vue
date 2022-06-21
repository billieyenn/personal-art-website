<template>
          <router-view></router-view>

<!--   <div class="container-fluid">
    <div class="row">
      <div v-if="!isMobile()">
        <div class="col-sm-3 col-md-3 sidebar springwood">
          <router-view name="header-top"></router-view>
          <div class="footer">
            <router-view name="header-bottom"></router-view>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="col-sm-3 col-md-3">
          <router-view name="header-top"></router-view>
          <div class="footer">
            <router-view name="header-bottom"></router-view>
          </div>
        </div>
      </div>
      <div class="col-sm-9 col-sm-offset-3 col-md-9 col-md-offset-3 main">
        <router-view></router-view>
      </div>
    </div>
  </div> -->
</template>

<script>

export default {
  name: 'App',
  components: {
  },
  methods: {
    isMobile () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style>
  body {
    font-family: 'Montserrat', sans-serif;
    /*color: black;*/
    color: #121a33;
  }

  body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .footer{
    margin-top: auto;
  }
</style>
