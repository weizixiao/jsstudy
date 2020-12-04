### 概念

`WebSocket`的服务端和客户端可以双向进行通讯，并且允许跨域通讯。由`HTTP/1.1`的`Upgrade`机制支持，通过`ws`(非加密)或`wss`(加密)协议进行通讯

### 连接方式

websocket是经过四次握手（也有称为五次握手的）

- 首先由客户端向服务端发送一个请求

  ```
  new  WebSocket("ws://localhost:8080");
  ```

  以上实际在网络中发送协议已经改变，打开请求头，可以发现会多了以下参数

  ```
  Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
  Sec-WebSocket-Key: c3MolK1iTMB7Fk1rXK0pew==
  Sec-WebSocket-Version: 13
  Upgrade: websocket
  Connection: Upgrade
  ```

  以上参数大意为

  ```
  Sec-WebSocket-Extensions: 扩展协议
  Sec-WebSocket-Key：发送的秘钥（动态变化）
  Sec-WebSocket-Version：版本号
  Connection：连接方式为升级协议（Upgrade表示升级协议）
  Upgrade：（websocket）升级为websocket协议
  ```

- 在服务端接收到了新的协议，要对接收到的协议进行连接方式的确定，判断是不是websocket协议

  然后匹配版本号，对应完是同一个版本号，那么就对客户端发送过来的key进行和***固定参数***进行拼接，进行sha1的加密，再转化成base64位返回客户端才能建立好连接

  ```
  固定参数：可以通过rfc网站进行查找https://tools.ietf.org/html/rfc6455
  13版本的是：258EAFA5-E914-47DA-
     95CA-C5AB0DC85B11
  返回客户端也要拼接好格式才能建立连接（base64Key就是转换过的key）：
  `HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Accept:${base64Key}\r\n\r\n`
  ```

### websocketAPI

- 构造函数

  ```
  WebSocket(url[, protocols])
  ```

- 属性

  ```
  // 使用二进制的数据类型连接，选择值有两个"blob"，"arraybuffer"
  WebSocket.binaryType
  
  // 当前链接状态，0 (CONNECTING)，1 (OPEN)，2 (CLOSING)，3 (CLOSED)
  WebSocket.readyState
  
  // websocket绝对路径
  WebSocket.url
  
  // 获取下属协议(在连接成功后才能获取到)
  WebSocket.protocol
  ```

- 属性方法

  ```
  // 用于指定连接关闭后的回调函数
  WebSocket.onclose
  
  // 用于指定连接失败后的回调函数
  WebSocket.onerror
  
  // 用于指定连接成功后的回调函数
  WebSocket.onopen
  
  // 用于指定当从服务器接受到信息时的回调函数
  WebSocket.onmessage
  ```

- 方法

  ```
  // 关闭当前链接
  /* 
  	code: 数字状态码，解释连接关闭的原因
  	reason： 字符串关闭原因 （地址：https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes）
  **/
  WebSocket.close([code[, reason]])
  
  // 向服务端发送数据
  WebSocket.send(data)
  ```



### 服务端获取

以nodejs为例子，用的是net模块进行获取websocket连接，详情见示例



### 常用库

socket.io

