<template>
  <router-view />
  <img src="./assets/images/logo.png" alt="Vue Logo" class="logo" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.logo {
  position: fixed;
  bottom: 30px;
  right: 39px;
  width: 100px;
}
</style>
