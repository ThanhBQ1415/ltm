const express = require('express');
const http = require('http');
const {
    v4: uuid
} = require('uuid');
const socketIO = require('socket.io')
const app = express();
const expressHTTPServer = http.createServer(app);
const io = new socketIO.Server(expressHTTPServer);
const helmet = require('helmet');
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.redirect(`/${uuid()}`)
})
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],  // Chỉ cho phép tài nguyên từ cùng domain
        scriptSrc: ["'self'", "https://vercel.live"], // Cho phép tải script từ chính domain và vercel.live (hoặc chặn nó)
        connectSrc: ["'self'", "https://vercel.live"],  // Cho phép các kết nối WebSocket nếu cần (hoặc loại bỏ vercel.live)
        // Bạn có thể cấu hình các phần khác như imgSrc, styleSrc tùy theo nhu cầu
      }
    })
  );

app.get("/:roomId", (req, res) => {
    const roomId = req.params.roomId;
    res.render('index', {
        roomId
    });

})




io.on('connection', (socket) => {

    // joining a new room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);

        // notify others about the new joining in the room
        socket.to(roomId).emit("newJoining")
    })


    // send the offer 
    socket.on("sendTheOffer", (offer, roomId) => {
        socket.to(roomId).emit("receiveOffer", offer)
    })

    // send the answer 
    socket.on("sendTheAnswer", (answer, roomId) => {
        socket.to(roomId).emit("receiveAnswer", answer)
    })


    // send Ice candidate 
    socket.on("sendIceCandidate", (candidate, roomId) => {
        socket.to(roomId).emit("receiveCandidate", candidate)
    })




    console.log("Socket connected!");
})

const port = process.env.PORT || 3000;
expressHTTPServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
