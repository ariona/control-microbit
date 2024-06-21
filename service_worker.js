// Cached core static resources
self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open("static").then(cache=>{
      return cache.addAll(["./",'./img/icon.png']);
    })
  );
});