function Test () {
  this.cache = {
    txt: "hello"
  }
  this.set = function () {
    this.cache.txt = "world"
  }
}

