// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require('electron');

function isFunction(f) {
  return typeof f === 'function';
}

const g = self || window;

let globalRequestId = 0;
g.RequestIDCacheMap = {};

g.JSBridge = {
  call: function(apiName, options, callback) {
    const params = { 
      apiName, 
      options, 
      callback 
    };

    const requestId = ++globalRequestId;
    const actionData = {
      data: params.options,
      requestId,
    };
    // 正常调用
    if (params.apiName) {
      actionData.action = params.apiName;
    }
    if (params.callback) {
      RequestIDCacheMap[`${requestId}`] = params.callback;
    }

    actionData.to='TO_NATIVE';

    const { action, ...rest } = actionData;
    ipcRenderer.send(action, {
      ...rest
    })
  }
}

g.trigger = function trigger(data) {
  console.log('render: receive trigger data', data);

  let requestId = data && data.requestId;
  
  if (requestId != null) {
    requestId += '';
    // android JSAPI 回调
    if (isFunction(RequestIDCacheMap[requestId])) {
      RequestIDCacheMap[requestId](data.param);
      delete RequestIDCacheMap[requestId];
    } else {
      console.log('unknown requestId', data);
    }
  } else {
    console.error('unknown trigger data', data);
  }
}

ipcRenderer.on('port-message', (e, msg) => {
  const { data, type } = msg
  const evt = new MessageEvent('message', {
    data: {
      data,
      type,
    }
  });
  self.dispatchEvent(evt)
})
