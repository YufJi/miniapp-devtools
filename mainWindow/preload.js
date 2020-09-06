// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer } = require('electron');


ipcRenderer.on('port', (e, msg) => {
  console.log(12313);
  const [port] = e.ports;

  port.onmessage = ()=> {
    console.log('onmessage 1');
  }

  setTimeout(() => {
    port.postMessage('asdfsa')
  }, 5000)
})