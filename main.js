// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let workerWinow;

function createMain() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 375,
    height: 667,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'mainWindow/preload.js'),
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('mainWindow/index.html', {})

  mainWindow.on('ready-to-show', () => {
    
  })
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

function addView(parent) {
  let view = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'miniapp/render/preload.js'),
    }
  });
  parent.addBrowserView(view);
  view.setBounds({ 
    x: 0, 
    y: 0, 
    width: 375, 
    height: 667
  });
  // view.webContents.loadFile('miniapp/render/index.html');
  view.webContents.loadURL('file:///Users/xxx/Documents/demo/miniapp-desktop/miniapp/render/index.html#pages/index/index')

  view.webContents.openDevTools();
}

function initWoker() {
  workerWinow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'miniapp/worker/preload.js')
    }
  })

  workerWinow.loadFile('miniapp/worker/index.html')
  workerWinow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  initWoker();
  createMain();

  addView(mainWindow);
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!mainWindow) createMain()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const renderViewMap = {};

// 接收worker port发来的消息
ipcMain.on('port-message', (e, msg) => {
  const { guid, data } = msg;
  renderViewMap[guid].send('port-message', { ...data });
})

// 实现bridge api
ipcMain.on('postMessage', (e, msg) => {
  const { type, guid } = msg.data;
  // 带有type的属于render 和 worker 通信
  if (!type || type !== 'messagePort') {
    renderViewMap[guid] = e.sender;
  }
  workerWinow.webContents.send('port-message', { ...msg.data })
})

ipcMain.on('registerWorker', (e, data) => {
  const { data: options, requestId } = data;
  const { worker } = options; 
  workerWinow.webContents.executeJavaScript(`self._importScripts('${worker}')`).then((result) => {
    // todo 触发render 回调
    wrapCallBack(e.sender, requestId);
  }).catch(error => {
    wrapCallBack(e.sender, requestId, { error });
  });
})


function wrapCallBack(webContent, requestId, param = {}) {
  const data = {
    requestId,
    param,
  }
  webContent.executeJavaScript(`self.trigger(${JSON.stringify(data)})`);
}
