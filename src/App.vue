<template>
  <div class="container-fluid">
    <div class="row">
      <div v-if="!isMobile()">
        <div class="col-sm-3 col-md-3 sidebar gray">
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
  </div>
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
  }

  body {
  }

  .sidebar {
    position: fixed;
    top: 0px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
    border-right: 1px solid #eee;
  }

  .sidebar {
    width: 400px;
  }

  .gray {
    background-color: #F5F5F5;
  }

  .main {
    padding-top: 100px;
  }

  @media (min-width: 768px) {
    .main {
      padding-right: 40px;
      padding-left: 440px; /* 180 + 40 */
    }
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
