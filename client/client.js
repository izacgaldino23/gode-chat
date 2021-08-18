const commands = {
	'name': 'seu_nome -> Muda seu nome',
	'list': '-> Lista todas as salas',
	'join': 'nome_da_sala -> Entra em uma sala',
	'clear': '-> Limpa janela de msgs',
	'leave': '-> Sair de uma sala',
	'help': '-> Mostrar comandos',
}

let socket = io.connect('http://192.168.111.142:9080/');
let name, room

function init () {
	help()
	if (localStorage.name) {
		name = localStorage.name
		socket.emit('in', { name })
		writeToScreen(info_template.innerHTML, { info: `Bem-vindo ${name} :D` })
	}

	socket.on('room_msg', receiveMsg)
	socket.on('join_msg', joinMsg)
	socket.on('leave_msg', leaveMsg)
	socket.on('change_name', changeName)
}

function isCommand (command = '') {
	let parts = command.split(' ')

	if (parts[ 0 ] in commands) { // Verifica se comando existe
		manageCommands(parts[ 0 ], parts)

		return true
	}

	return false
}

function manageCommands (command = '', parts = []) {
	switch (command) {
		case 'list':
			list()
			break
		case 'join':
			join(parts)
			break
		case 'name':
			setName(parts)
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
			let salas = []
			for (r of rooms) {
				salas.push({ name: r })
			}

			writeToScreen(rooms_template.innerHTML, { rooms: salas })
		}
	})
}

function join (parts = []) {
	if (!name || name == '') {
		writeToScreen(info_template.innerHTML, { info: 'Antes de entrar em uma sala escolha um nome usando o comando name seu_nome' })
		return
	}

	if (room) {
		writeToScreen(info_template.innerHTML, { info: 'Você já está em uma sala use o comando leave para sair da que você está' })
		return
	}

	if (parts.length != 2) {
		writeToScreen(info_template.innerHTML, { info: 'O formato do comando deve ser: join nome_da_sala' })
		return
	}

	if (!parts[ 1 ] || parts[ 1 ] == '') {
		writeToScreen(info_template.innerHTML, { info: 'Nome da sala inválida' })
		return
	}

	room = parts[ 1 ]

	socket.emit('join', { name, room }, ({ msg }) => {
		writeToScreen(info_template.innerHTML, { info: msg })
	})
}

function leave () {
	if (!room) {
		writeToScreen(info_template.innerHTML, { info: 'Você não está em nenhuma sala use o comando join para entrar em uma sala' })
		return
	}

	writeToScreen(info_template.innerHTML, { info: `Você saiu da sala ${room}` })

	socket.emit('leave', { user: name, room })

	room = undefined
}

function clear () {
	mensagens.innerHTML = ""
}

function help () {
	let c = []
	for (let i in commands) {
		c.push({ name: i, description: commands[ i ] })
	}

	writeToScreen(help_template.innerHTML, { commands: c })
}

function setName (parts = []) {
	if (parts.length != 2) {
		writeToScreen(info_template.innerHTML, { info: 'O formato do comando deve ser: name seu_nome' })
		return
	}

	if (!parts[ 1 ] || parts[ 1 ] == '') {
		writeToScreen(info_template.innerHTML, { info: 'Nome inválido' })
		return
	}
	let old_name = name
	name = parts[ 1 ]

	localStorage.name = name

	socket.emit('change_name', { old_name, name, room }, () => {
		writeToScreen(info_template.innerHTML, { info: `Nome alterado para ${name}` })
	})
}

// ================ listening funtions
function sendMsg (msg) {
	socket.emit('to_room', { msg, user: name, room }, ({ erro_msg }) => {
		if (erro_msg) {
			writeToScreen(info_template.innerHTML, { info: erro_msg })
		} else {
			writeToScreen(my_message_template.innerHTML, { name, msg })
			escrever.value = ''
		}
	})
}

function receiveMsg ({ msg, user }) {
	writeToScreen(other_message_template.innerHTML, { name: user, msg })
}

function joinMsg ({ msg }) {
	writeToScreen(inout_template.innerHTML, { msg })
}

function leaveMsg ({ msg }) {
	writeToScreen(inout_template.innerHTML, { msg })
}

function changeName ({ msg }) {
	writeToScreen(info_template.innerHTML, { info: msg })
}

// ================= eventos componentes
escrever.addEventListener('keyup', (e) => {
	if (e.keyCode == 13) { // Deu enter
		if (escrever.value.length == 0) return
		let is = isCommand(escrever.value)

		if (!is) {
			if (!room) {
				writeToScreen(info_template.innerHTML, "Entre em alguma sala usando join nome_da_sala")
			} else {
				sendMsg(escrever.value)
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

function writeToScreen (template, params) {
	let temp = Mustache.render(template, params)
	// console.log(temp)
	mensagens.innerHTML += temp
	mensagens.scrollTop = mensagens.scrollHeight
}

window.addEventListener("load", init, false);