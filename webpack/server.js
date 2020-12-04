const net = require("net");
const crypto = require("crypto");
// https://tools.ietf.org/html/rfc6455
//创建一个TCP服务器
const server = net.createServer((socket) => {
  console.log("有人连接了");
  // console.log(socket)
  // 在这里http三次连接完成，但是websocket连接还没建立
  // 处理完websocket头才能建立连接
  // 只执行一次握手校验，所以用once
  socket.once("data", (onceData) => {
    // 第一次发送，onceData是个Buffer
    // console.log(onceData);
    // 转义出字符串是协议
    const getHeader = onceData.toString();
    // console.log(getHeader);
    // 第一次数据是http头getHeader数据
    /**
            GET / HTTP/1.1
            Host: localhost:8080
            Connection: Upgrade
            Pragma: no-cache
            Cache-Control: no-cache
            User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36
            Upgrade: websocket
            Origin: file://
            Sec-WebSocket-Version: 13
            Accept-Encoding: gzip, deflate, br
            Accept-Language: zh-CN,zh;q=0.9
            Cookie: _ga=GA1.1.1363855253.1526653728
            Sec-WebSocket-Key: w/PxVBLd8Or/WgKNyBzZlA==
            Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
         */
    // 解析头
    const getHeadersArray = getHeader.split("\r\n");
    // console.log(getHeadersArray);
    /**
            [ 'GET / HTTP/1.1',
            'Host: localhost:8080',
            'Connection: Upgrade',
            'Pragma: no-cache',
            'Cache-Control: no-cache',
            'User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
            'Upgrade: websocket',
            'Origin: file://',
            'Sec-WebSocket-Version: 13',
            'Accept-Encoding: gzip, deflate, br',
            'Accept-Language: zh-CN,zh;q=0.9',
            'Cookie: _ga=GA1.1.1363855253.1526653728',
            'Sec-WebSocket-Key: ah9tp3SeMN0xMANaMUdkWw==',
            'Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits',
            '',
            '' ]
         */
    getHeadersArray.shift();
    getHeadersArray.pop();
    getHeadersArray.pop();
    // 转换成json
    const getHeadersObj = {};
    getHeadersArray.forEach((item) => {
      const [name, value] = item.split(":");
      getHeadersObj[name] = value;
    });
    // console.log(getHeadersObj);
    /**
         * { Host: ' localhost',
            Connection: ' Upgrade',
            Pragma: ' no-cache',
            'Cache-Control': ' no-cache',
            'User-Agent':
            ' Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
            Upgrade: ' websocket',
            Origin: ' file',
            'Sec-WebSocket-Version': ' 13',
            'Accept-Encoding': ' gzip, deflate, br',
            'Accept-Language': ' zh-CN,zh;q=0.9',
            Cookie: ' _ga=GA1.1.1363855253.1526653728',
            'Sec-WebSocket-Key': ' J1Jw1K+vI6I8nfh3slp+ZA==',
            'Sec-WebSocket-Extensions': ' permessage-deflate; client_max_window_bits' }
         */
    // 验证是否是websocket协议
    if (
      getHeadersObj["Connection"].trim() !== "Upgrade" ||
      getHeadersObj["Upgrade"].trim() !== "websocket"
    ) {
      // 判断不是websocket，断开连接
      console.log("不是websocket升级协议");
      socket.end();
    } else {
      // 判断版本号
      if (+getHeadersObj["Sec-WebSocket-Version"].trim() !== 13) {
        console.log("非13的版本不处理");
        socket.end();
      } else {
        const key = getHeadersObj["Sec-WebSocket-Key"].trim();
        //校验完版本号后，正式进行对key验证
        // console.log(key);
        // 这个是固定的拼接key，不同版本的websocket不一样
        const BASE_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        //校验的拼接key(258EAFA5-E914-47DA-95CA-C5AB0DC85B11(RFC拿的))
        //J1Jw1K+vI6I8nfh3slp+ZA==258EAFA5-E914-47DA-95CA-C5AB0DC85B11
        //需求做一次sha1加密，然后做一次base64转换
        const hash = crypto.createHash("sha1");
        hash.update(key + BASE_KEY);
        // 用base64方式输出转化过的key
        const base64Key = hash.digest("base64");
        // console.log("base64Key", base64Key);
        // SMERl6JxQJPyh+Zu9UXrsTkcep4=
        // 返回给客户端,得返回http协议头
        const responseHttp = `HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nSec-WebSocket-Protocol:1111\r\nUpgrade: websocket\r\nSec-WebSocket-Accept:${base64Key}\r\n\r\n`;
        socket.write(responseHttp);
        console.log("握手完成");
      }
      // 监听数据
      socket.on("data", (data) => {
        console.log("监听到数据", data);
        // <Buffer 81 83 4d 0b 0c 0b 2c 69 6f>  二进制数据
      });
    }
  });
  socket.on("end", () => {
    // 断开连接会触发
    console.log("连接已断开");
  });
});
server.listen(8080);
