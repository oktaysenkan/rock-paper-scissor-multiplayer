var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('uuidv4');

app.get('/', function (req, res) {
   res.sendfile('index.html');
});

const users = [];
const games = [];

io.on('connection', function (socket) {
   console.log(`Kullanıcı bağlandı: ${socket.id}.`);
   socket.emit('id', socket.id);

   socket.on('disconnect', function (reason) {
      console.log(`Kullanıcı ayrıldı: ${socket.id}`);

      const userIndex = users.indexOf(socket.id);
      if (userIndex !== -1) {
         users.splice(userIndex, 1);
         console.log(`${socket.id} eşleşme sırasından ayrıldı!`);
      }

      games.filter(game => {
         const user = game.users.filter(user => user.userid === socket.id);
         if (user){
            const user1 = game.users[0].userid;
            const user2 = game.users[1].userid;

            if (user1 === socket.id) {
               io.to(user1).emit('you-are-disconnected')
               io.to(user2).emit('rival-disconnected')
            } else if (user2 === socket.id) {
               io.to(user2).emit('you-are-disconnected')
               io.to(user1).emit('rival-disconnected')
            }

            const gameIndex = games.indexOf(game);
            games.splice(gameIndex, 1);
            console.log(`Room ID: ${game.roomid} oyuncu ayrıldığı için kapatıldı!`);
         }
      })
   });

   socket.on('start-queue', () => {
      const userIndex = users.indexOf(socket.id);
      if (userIndex !== -1) {
         return;
      }

      users.push(socket.id);
      console.log(`${socket.id} eşleşme sırasına katıldı!`);

      if (users.length >= 2) {
         const user1 = users[0];
         const user2 = users[1];
         users.splice(0, 2);

         const roomid = uuid.uuid();
         console.log(`Oyun oluşturuldu, Room ID: ${roomid}`);
         io.to(user1).emit('game-starting', roomid);
         io.to(user2).emit('game-starting', roomid);
         games.push({
            roomid: roomid,
            counter: 0,
            users: [
               {
                  userid: user1,
                  selection: null,
               },
               {
                  userid: user2,
                  selection: null,
               }
            ]
         });
      }
   });

   socket.on('selected-card', (data) => {
      console.log(`${data.roomid} numaralı oyunda ${data.userid} numaralı oyuncu ${data.selection} kartını seçti.`);

      let game = games.filter(g => g.roomid === data.roomid)[0]
      game.counter = game.counter + 1;

      let user = game.users.filter(u => u.userid === data.userid)[0]
      user.selection = data.selection;

      if (game.counter % 2 === 0) {
         const user1 = game.users[0];
         const user2 = game.users[1];

         io.to(user1.userid).emit('result', user2.selection)
         io.to(user2.userid).emit('result', user1.selection)
      }
   });
});

http.listen(3000, function () {
   console.log('listening on *:3000');
});