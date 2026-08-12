// Elit Sepet Market — basit service worker
// Şimdilik sadece "uygulama olarak kurulabilir" işaretini vermek için var.
// İleride offline destek eklemek istersen buraya cache mantığı eklenebilir.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", () => {
  // Şimdilik dokunmuyoruz, her istek normal şekilde ağdan gidiyor.
});
