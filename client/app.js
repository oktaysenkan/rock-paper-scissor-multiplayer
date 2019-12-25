const socket = io('http://localhost:3000');

let roomid;
let uuid;

socket.on('connect', () => {
   console.log('Connected');
});

socket.on('id', (test) => {
   uuid = test;
   console.log('your id ' + uuid);
});

socket.on('game-starting', (uuid) => {
   roomid = uuid;
});

socket.on('result', (selection) => {
   console.log('rakip şunu seçti ' + selection);
});

const startButton = document.querySelector('.start');
startButton.addEventListener('click', () => {
   socket.emit('start-queue', '121212121a36s4dasdalsjdhnasd');
});

const rockButton = document.querySelector('.rock');
rockButton.addEventListener('click', () => {
   socket.emit('selected-card', {roomid: roomid, userid: uuid, selection: 'rock'});
});

const paperButton = document.querySelector('.paper');
paperButton.addEventListener('click', () => {
   socket.emit('selected-card', {roomid: roomid, userid: uuid, selection: 'paper'});
});

const scissorButton = document.querySelector('.scissor');
scissorButton.addEventListener('click', () => {
   socket.emit('selected-card', {roomid: roomid, userid: uuid, selection: 'scissor'});
});
