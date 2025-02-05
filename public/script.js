const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList');
let destinatario= "Mensaje público";

//  SOLO Envia mensaje al seridor.

if (form) {
form.addEventListener ('submit', (event) => {
    event.preventDefault();
    if (input.value){
        if(destinatario == "Mensaje público"){
        socket.emit('chat message', input.value);
        
        }else{
            socket.emit('private message', { destinatario,
                message: input.value
            });
        }
    input.value='';
    }


})};

userList.addEventListener('change', (event) => {
    destinatario = event.target.value || null;

});
// SOLO Escucha mensajes del servidor

socket.on ('chat message', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

});

socket.on('private message', ({ emisor, message }) => {
    alert("emttro")
    const item = document.createElement('li');
    item.textContent = `Privado de ${emisor}: ${message}`;
    item.style.color = 'red'; // Diferenciar mensajes privados visualmente
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});



socket.on('update user list', (users)=>{
    userList.innerHTML = '';
    const option = document.createElement('option');
    option.textContent = "Mensaje público";
    userList.appendChild(option);


    Object.entries(users).forEach(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        userList.appendChild(option);
    });

});