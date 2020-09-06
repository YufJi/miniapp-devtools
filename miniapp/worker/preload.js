// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require('electron');

const msgPortMap = {};

ipcRenderer.on('port-message', (e, msg) => {
  const { type, data, guid } = msg;

  if (type && type === 'messagePort') {
    msgPortMap[guid].postMessage(data);
  } else {
    const { port1, port2 } = new MessageChannel();
    msgPortMap[guid] = port1;
    port1.onmessage = function(evt) {
      const data = JSON.parse(evt.data);
      ipcRenderer.send('port-message', {
        data: {
          ...data,
          type: 'messagePort',
        },
        guid,
      });
    }
  
    const evt = new MessageEvent("message", {
      data,
      ports: [port2]
    });
    self.dispatchEvent(evt);
  }
})

self.importScripts = function(url) {
  console.warn('当前环境的importScripts只支持一个参数');
  var script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);
}

self._importScripts = function(url) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      resolve({
        success: true,
      })
    }
    script.onerror = (error) => {
      reject(error)
    }
    document.body.appendChild(script);
  })
}

self.Kira = {
  call: function(payloadString) {
    // action: "toast"
    // applicationId: 1000000
    // data: {type: "done", content: "操作成功", duration: 3000}
    // requestId: 2
    const payload = JSON.parse(payloadString)
    const { action, ...rest } = payload; 
    ipcRenderer.send(action, {
      ...rest,
    });
  },
  callSync: function(payloadString) {
    const payload = JSON.parse(payloadString)

    const { action, ...rest } = payload;
    return ipcRenderer.sendSync(action, {
      ...rest,
    })
  }
}
