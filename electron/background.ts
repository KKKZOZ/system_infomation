// @ts-ignore

require('ts-node').register({
    transpileOnly: true
    // insert other options with a boolean flag here
})


const {app, protocol, BrowserWindow, ipcMain} = require('electron')
const path = require('path')


function createWindow() {
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
            // preload: path.join(__dirname, 'preload.js')
        }
    })

    // 加载 index.html
    mainWindow.loadURL("http://localhost:8000") // 此处跟electron官网路径不同，需要注意
    // 打开开发工具
    // mainWindow.webContents.openDevTools()
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
        // 打开的窗口，那么程序会重新创建一个窗口。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入


const si = require('systeminformation');
const {GPUDynamicInfo,GPUStaticInfo} = require('../src/stores/SystemInfoStore')
// si.graphics().then(data => console.log(data));

// let queryObject = {
//     graphics: "controllers"
// };
//
// si.get(queryObject).then(data => {
//     console.log(data.graphics);
// });


ipcMain.handle("Get", async (event, args) => {

    if (args === "Overview") {
        console.log("Querying");
        let queryObject = {
            system:"manufacturer, version,serial,uuid,virtual",
            bios:"vendor,version,releaseDate,serial",
            baseboard:"manufacturer,model,version,serial,memSlots",
            osInfo:"platform,distro,release,kernel,arch,hostname,uefi"
        };
        let result =await si.get(queryObject);
        console.log(result)
        return result;
    }

    if (args === "System") {
        let queryObject = {
            system:"manufacturer, version,serial,uuid,virtual",
        };
        let result = await si.get(queryObject);
        return result.system;
    }

    if (args === "Bios") {
        let queryObject = {
            bios:"vendor,version,releaseDate,serial"
        };
        let result = await si.get(queryObject);
        return result.bios;
    }

    if (args==="BaseboardInfo"){
        let queryObject = {
            baseboard:"manufacturer,model,version,serial,memSlots"
        };
        let result = await si.get(queryObject);
        return result.baseboard;
    }

    if (args === "OS") {
        let queryObject = {
            os:"platform,distro,release,kernel,arch,hostname,uefi"
        };
        let result = await si.get(queryObject);
        return result.os;
    }


    if (args === "CPU") {
        let queryObject = {
            cpu: 'manufacturer,brand,cores,physicalCores,speedMax,speedMin'
        };
        let result = await si.get(queryObject);
        return result.cpu;
    }

    if (args === "Memory") {
        let queryObject = {
            mem: "total,free,used",
        };
        let result = await si.get(queryObject);
        return result.mem;
    }

    if (args === "GPUStatic") {
        let queryObject = {
            graphics: "controllers"
        };
        let result = await si.get(queryObject);
        let data = result.graphics.controllers[0];

        return new GPUStaticInfo(data.vendor, data.model, data.bus,
            data.vram, data.vramDynamic, data.driverVersion);
    }


    if (args === "GPUDynamic") {
        let queryObject = {
            graphics: "controllers"
        };
        let result = await si.get(queryObject);
        let data = result.graphics.controllers[0];

        return new GPUDynamicInfo(data.memoryTotal,data.memoryUsed,data.memoryFree,
            data.temperatureGpu,data.powerDraw,data.clockCore);
        // si.graphics().then(data => console.log(data));
        // return new GPUDynamicInfo(0,0,0,0,0,0);
    }

});