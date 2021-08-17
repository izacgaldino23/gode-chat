import { Socket } from 'socket.io'
import { io } from '../server'

let users: { [key: string]: any } = {}
let rooms: Array<string> = []

io.on('connect', (socket: Socket) => {
	// console.log('Se conectou' + socket.id)

	socket.on('list_rooms', (params, callback) => {
		callback(rooms)
	})

	socket.on('join', (params, callback) => {
		const { name, room } = params
		var msg = `Entrou na sala ${room}`

		if (room in io.sockets.adapter.rooms) {
			msg = `Entrou na sala ${room}`
		}

		socket.to(room).emit('join_msg', { msg: `${name} entrou na sala` })

		socket.join(room)
		users[name] = socket.id

		if (rooms.indexOf(room) === -1) {
			rooms.push(room)
		}

		callback({ msg })
	})

	socket.on('leave', (params) => {
		const { user, room } = params

		socket.to(room).emit('leave_msg', { msg: `${user} saiu da sala` })

		socket.leave(room)
	})

	socket.on('to_room', (params, callback) => {
		const { user, msg, room } = params

		if (msg.length > 256) {
			callback({ erro_msg: 'Mensagem não pode ter mais de 256 caracteres' })
		}

		if (!verifyUserLogin(user)) {
			callback({ erro_msg: 'Você não está em nenhuma sala!' })
		}

		socket.to(room).emit('room_msg', { msg, user })
		callback({})
	})

	socket.on('to_user', (params) => {
		const { user, to, msg } = params

		if (!verifyUserLogin(user)) {
			return { msg: 'Você não está em nenhuma sala!' }
		}

		if (!verifyUserLogin(to)) {
			return { msg: "Usuário não encontrado" }
		}

		socket.to(users[to]).emit('private_msg', { msg })
	})
})

function verifyUserLogin(user_name: string) {
	if (!(user_name in users)) {
		return false
	}

	return true
}