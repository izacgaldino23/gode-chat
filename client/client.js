const commands = {
	'name': { args: 'seu_nome', description: 'Muda seu nome' },
	'list': { args: '', description: 'Lista todas as salas' },
	'join': { args: 'nome_da_sala', description: 'Cria/Entra em uma sala' },
	'image': { args: 'link', description: 'Envia uma imagem' },
	'users': { args: '', description: 'Lista usuários de uma sala' },
	'clear': { args: '', description: 'Limpa janela de msgs' },
	'leave': { args: '', description: 'Sai de uma sala' },
	'help': { args: '', description: 'Mostra comandos' },
}



const dataNow = dateFormat()

let socket = io.connect('http://192.168.1.120:9080/');
let name, room, key
let primeira_vez = true

function init () {
	help()
	if (localStorage.name) {
		name = localStorage.name
		socket.emit('in', { name }, () => { })
		writeToScreen(info_template, { info: `Bem-vindo ${name} :D` })
	}

	socket.on('room_msg', receiveMsg)
	socket.on('join_msg', joinMsg)
	socket.on('leave_msg', leaveMsg)
	socket.on('change_name', changeName)
	socket.on('room_image', roomImage)

	socket.on('reload', reload)
	socket.on('disconnect', disconnect)
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
		case 'image':
			image(parts)
			break
		case 'users':
			listUsers()
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

			writeToScreen(rooms_template, { rooms: salas })
		}
	})
}

function join (parts = []) {
	if (!name || name == '') {
		writeToScreen(info_template, { info: 'Antes de entrar em uma sala escolha um nome usando o comando name seu_nome' })
		return
	}

	if (room) {
		writeToScreen(info_template, { info: 'Você já está em uma sala use o comando leave para sair da que você está' })
		return
	}

	if (parts.length != 2) {
		writeToScreen(info_template, { info: 'O formato do comando deve ser: join nome_da_sala' })
		return
	}

	if (!parts[ 1 ] || parts[ 1 ] == '') {
		writeToScreen(info_template, { info: 'Nome da sala inválida' })
		return
	}

	room = parts[ 1 ]

	socket.emit('join', { name, room }, ({ msg, k }) => {
		writeToScreen(info_template, { info: msg, tag: '+++' })
		key = k
	})
}

function leave () {
	if (!room) {
		writeToScreen(info_template, { info: 'Você não está em nenhuma sala use o comando join para entrar em uma sala' })
		return
	}

	writeToScreen(info_template, { info: `Você saiu da sala ${room}`, tag: '---' })

	socket.emit('leave', { user: name, room })

	room = undefined
}

function clear () {
	mensagens.innerHTML = ""
}

function help () {
	let c = []
	for (let i in commands) {
		c.push({ name: i, args: commands[ i ].args, description: commands[ i ].description })
	}

	writeToScreen(help_template, { commands: c, data: dataNow })
}

function setName (parts = []) {
	if (parts.length != 2) {
		writeToScreen(info_template, { info: 'O formato do comando deve ser: name seu_nome' })
		return
	}

	if (!parts[ 1 ] || parts[ 1 ] == '') {
		writeToScreen(info_template, { info: 'Nome inválido' })
		return
	}
	let old_name = name
	let new_name = parts[ 1 ]

	socket.emit('change_name', { old_name, name: new_name, room }, ({ erro_msg }) => {
		if (erro_msg) {
			writeToScreen(info_template, { info: erro_msg })
			return
		}
		name = new_name
		localStorage.name = name

		writeToScreen(info_template, { info: `Nome alterado para ${name}` })
	})
}

function image (parts = []) {
	if (!room) {
		writeToScreen(info_template, "Entre em alguma sala usando join nome_da_sala")
	} else {
		if (parts.length != 2) {
			writeToScreen(info_template, { info: 'O formato do comando deve ser: image link' })
			return
		}

		let link = parts[ 1 ]

		let crypted = crypt(link)
		socket.emit('image_to_room', { user: name, room, link: crypted }, () => {
			writeToScreen(my_message_template, { name, link, is_image: true })
		})
	}
}

function listUsers () {
	if (!room) {
		writeToScreen(info_template, { info: 'Entre em uma sala usando join nome_da_dala' })
		return
	}
	socket.emit('list_users', { room }, ({ users_in_room }) => {
		writeToScreen(users_template, { users: users_in_room })
	})
}

// ================ listening funtions
function sendMsg (msg) {
	let crypted = crypt(msg)

	socket.emit('to_room', { msg: crypted, user: name, room }, ({ erro_msg }) => {
		if (erro_msg) {
			writeToScreen(info_template, { info: erro_msg })
		} else {
			writeToScreen(my_message_template, { name, msg, is_image: false })
			escrever.value = ''
		}
	})
}

function receiveMsg ({ msg, user }) {
	let decrypted = decrypt(msg)
	audio_notificacao.play()
	writeToScreen(other_message_template, { name: user, msg: decrypted, is_image: false })
}

function joinMsg ({ msg }) {
	writeToScreen(inout_template, { msg, tag: '+++' })
}

function leaveMsg ({ msg }) {
	writeToScreen(inout_template, { msg, tag: '---' })
}

function changeName ({ msg }) {
	writeToScreen(info_template, { info: msg })
}

function roomImage ({ user, link }) {
	let decrypted = decrypt(link)
	audio_notificacao.play()
	console.log(link, decrypted)
	writeToScreen(other_message_template, { name: user, link: decrypted, is_image: true })
}

function crypt (msg = '') {
	let encrypted = CryptoJS.AES.encrypt(msg, key).toString()

	return encrypted
}

function decrypt (msg = '') {
	let decrypted = CryptoJS.AES.decrypt(msg, key).toString(CryptoJS.enc.Utf8)

	return decrypted
}

function reload ({ }) {
	writeToScreen(info_template, { info: "Servidor voltou :D" })

	if (localStorage.name) {
		name = localStorage.name

		socket.emit('in', { name }, () => {
			if (room) {
				let temp = room
				room = undefined
				join([ 'join', temp ])
			}
		})
	}
}

function disconnect () {
	writeToScreen(info_template, { info: "Servidor caiu, restaurando..." })
}

// ================= eventos componentes
escrever.addEventListener('keyup', (e) => {
	if (e.keyCode == 13) { // Deu enter
		if (escrever.value.length == 0) return
		let is = isCommand(escrever.value)

		if (!is) {
			if (!room) {
				console.log('teste')
				writeToScreen(info_template, { info: "Entre em alguma sala usando join nome_da_sala" })
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

function loadedImage () {
	mensagens.scrollTop = mensagens.scrollHeight
}

function writeToScreen (template, params) {
	let temp = Mustache.render(template.innerHTML, params)

	mensagens.innerHTML += temp
	mensagens.scrollTop = mensagens.scrollHeight
}

function dateFormat () {
	function adicionaZeroData (numero) {
		return numero <= 9 ? "0" + numero : numero;
	}

	let dataAtual = new Date();
	let dataAtualFormatada = (
		adicionaZeroData(dataAtual.getDate().toString()) + "/" +
		(adicionaZeroData(dataAtual.getMonth() + 1).toString()) + "/" +
		dataAtual.getFullYear()
	);

	return dataAtualFormatada
}

window.addEventListener("load", init, false);

