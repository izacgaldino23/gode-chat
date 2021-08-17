const commands = {
	'list': 'Lista todas as salas',
	'join': 'Entra em uma sala',
	'clear': 'Limpa janela de msgs',
	'leave': 'Sair de uma sala',
	'help': 'Mostrar comandos',
}

let socket = io.connect('http://192.168.111.142:9080/');
let name, room

function init () {
	help()

	socket.on('room_msg', receiveMsg)
	socket.on('join_msg', joinMsg)
	socket.on('leave_msg', leaveMsg)
}

function isCommand (command = '') {
	if (command in commands) { // Verifica se comando existe
		manageCommands(command)

		return true
	}

	return false
}

function manageCommands (command = '') {
	switch (command) {
		case 'list':
			list()
			break
		case 'join':
			join()
			break
		case 'clear':
			clear()
			break
		case 'leave':
			leave()
			break
		case 'help':
			help()
			break
	}
}

// ================ action funtions 
function list () {
	socket.emit('list_rooms', {}, (rooms) => {
		if (rooms.length > 0) {
			writeToScreen("========= SALAS =========<br><br>")
			for (i in rooms) {
				writeToScreen(`${rooms[ i ]}`)
			}
			writeToScreen("<br/>=========================<br/><br/>")
		}
	})
}

function join () {
	if (room) {
		writeToScreen('<span class="msg">Você já está em uma sala use o comando <strong>leave</strong> para sair da que você está</span><br/><br/>')
		return
	}

	name = prompt("Name")
	room = prompt("Room")

	if (!name || !room || room == '' || name == '') {
		writeToScreen(`<span class='msg'>Nome ou sala inválida</span>`)
	}

	socket.emit('join', { name, room }, ({ msg }) => {
		writeToScreen(`<span class='msg'>${msg}</span>`)
	})
}

function leave () {
	if (!room) {
		writeToScreen('<span class="msg">Você não está em nenhuma sala use o comando <strong>join</strong> para entrar em uma sala</span><br/><br/>')
		return
	}

	room = undefined

	writeToScreen(`<span class='msg'>Você saiu da sala ${room}</span>`)

	socket.emit('leave', { user: name, room })
}

function clear () {
	mensagens.innerHTML = ""
}

function help () {
	writeToScreen('======== COMMANDS ======== <br /><br />')

	for (let i in commands) {
		writeToScreen(`<strong>${i}</strong> ${commands[ i ]}`)
	}

	writeToScreen('<br>==========================<br/><br/>')
}

// ================ listening funtions
function sendMsg (msg) {
	socket.emit('to_room', { msg, user: name, room }, ({ erro_msg }) => {
		if (erro_msg) {
			writeToScreen(`<span class='msg'>${erro_msg}</span>`)
		} else {
			writeToScreen(`#<span class="me">${name}</span>: <span class='msg'>${msg}</span>`)
			escrever.value = ''
		}
	})
}

function receiveMsg ({ msg, user }) {
	writeToScreen(`#<span>${user}</span>: <span class='msg'>${msg}</span>`)
}

function joinMsg ({ msg }) {
	writeToScreen(`>>> <span class='msg'>${msg}</span>`)
}

function leaveMsg ({ msg }) {
	writeToScreen(`>>> <span class='msg'>${msg}</span>`)
}

// ================= eventos componentes
escrever.addEventListener('keyup', (e) => {
	if (e.keyCode == 13) { // Deu enter
		let is = isCommand(escrever.value)

		if (!is) {
			if (room) {
				sendMsg(escrever.value)
			} else {
				writeToScreen("<span class='msg'>Entre em alguma sala usando <strong>!join</strong></span>")
			}
		} else {
			escrever.value = ''
		}
	}
})

escrever.addEventListener('focusout', () => {
	escrever.focus()
})

window.addEventListener('focusin', (e) => {
	escrever.focus()
})

function writeToScreen (message) {
	var pre = document.createElement("p")
	pre.style.wordWrap = "break-word";
	pre.innerHTML = message;
	mensagens.appendChild(pre);
}

function testSocket () {
	socket.on('test', onMessage);
	socket.on('connect', onConnect);
	socket.on('disconnect', onDisconnect);
	socket.on('connect_error', onError);
	socket.on('reconnect_error', onError);
	socket.on('room_msg', ({ msg }) => {
		doSend(msg)
	})

	function onConnect (evt) {
		writeToScreen("CONNECTED");
		// doSend("Allo?");
	}

	function onDisconnect (evt) {
		writeToScreen("DISCONNECTED");
	}

	function onMessage (data) {
		writeToScreen('<span style="color: blue;">RESPONSE: ' + data + '</span>');
		socket.close();
	}

	function onError (message) {
		writeToScreen('<span style="color: red;">ERROR:</span> ' + message);
	}

	function doSend (message) {
		writeToScreen("SENT: " + message);
		socket.emit('test', message);
	}
}

window.addEventListener("load", init, false);