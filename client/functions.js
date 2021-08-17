export function isCommand (text = '') {
	if (text.substr(0, 1) == '!') { // É um comando
		let command = text.split(' ')[ 0 ]

		command = command.substr(1, command.length - 1)

		if (command in commands) { // Verifica se comando existe
			manageCommands(command)

			return true
		}
	}

	return false
}

function manageCommands (command = '') {
	switch (command) {
		case 'list':
			socket.emit('list_rooms', {}, (rooms) => {
				console.log(rooms)
			})
			break
	}
}

function writeToScreen (message) {
	var pre = document.createElement("p");
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