const http = require("http");
const addonInterface = require("./index");

http.createServer((req, res) => {
  addonInterface(req, res);
}).listen(7000, () => {
  console.log("✅ Addon beží na http://localhost:7000");
});
