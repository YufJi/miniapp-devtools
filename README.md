# Mini-Electron
> 注意有2个里的路径引用改成你自己本地的路径

这个项目是一个使用electron提供了一个小程序的宿主运行环境，提供了类多线程的方式，借助electron的BrowserWindow（多BrowserView） + BrowserWindow（模拟worker）；

## 目录说明

- demo 小程序业务方源码
- dist 小程序framework源码
- mainWindow electron主渲染
- miniapp 小程序运行环境（render + worker）


## 运行项目

```sh
npm i

npm start
```


