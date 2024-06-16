const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 提供静态文件
app.use(express.static(__dirname));

// 记录当前上色状况的Map
const faceColorMap = new Map();

// 处理与客户端的连接
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // 发送当前上色情况
  socket.emit('colorData', Array.from(faceColorMap.values()));

  setInterval(() => {
    const nsp = io.of('/');
    let playerList = [];

    for (let id in io.sockets.sockets) {
      const socket = nsp.connected[id];
      const playerData = {
          id: socket.id,
          x: socket.userData.x,
          y: socket.userData.y,
          z: socket.userData.z
        };
        playerList.push(playerData);
    }

    io.emit('remoteData', playerList);
  }, 40);

  // 监听客户端上色请求
  socket.on('colorFace', (data) => {
    const key = JSON.stringify(data.points); // 使用points作为key
    faceColorMap.set(key, {
      points: data.points,
      color: data.color
    });

    // 转发给所有其他用户
    io.emit('colorData', [{
      points: data.points,
      color: data.color
    }]);

    console.log(data.points, data.color);
  });

  // 监听客户端断开连接
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 启动服务器
server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
