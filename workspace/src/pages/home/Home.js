import { useEffect, useState } from "react";
// import aes from 'crypto-js/aes'
// import socketIOClient from "socket.io-client"

import { Input } from "../../components/Input";
import Prompt from "../../components/Prompt/Prompt";
import env from '../../Environment'
import Socket from '../../utils/Socket'

import './Home.css'

export function Home () {
	const [ text, setText ] = useState("");
	const [ itens, setItens ] = useState([ { type: 'commands' } ]);
	const [ response, setResponse ] = useState("");
	const [ name, setName ] = useState();
	const [ room, setRoom ] = useState();
	const [ key, setKey ] = useState()

	let socket = null

	useEffect(() => {
		if (localStorage.name) {
			setName(localStorage.name)
			Socket.conn.emit('in', { name }, () => {
				addItem({ type: 'info', info: `Bem-vindo ${name} :D` })
			})
		}

		Socket.conn.on('join', join)
	}, [])

	function setServerName (parts = []) {
		if (parts.length != 2) {
			addItem({ type: 'info', info: 'O formato do comando deve ser: name seu_nome' })
			return
		}

		if (!parts[ 1 ] || parts[ 1 ] == '') {
			addItem({ type: 'info', info: 'Nome inválido' })
			return
		}
		let oldName = name
		let newName = parts[ 1 ]

		Socket.conn.emit('change_name', { old_name: oldName, name: newName, room }, ({ erro_msg }) => {
			if (erro_msg) {
				addItem({ type: 'info', info: erro_msg })
				return
			}
			setName(newName)
			localStorage.name = newName

			addItem({ type: 'info', info: `Nome alterado para ${newName}` })
		})
	}

	function join (parts = []) {
		if (!name || name == '') {
			addItem({ info: 'Antes de entrar em uma sala escolha um nome usando o comando name seu_nome' })
			return
		}

		if (room) {
			addItem({ info: 'Você já está em uma sala use o comando leave para sair da que você está' })
			return
		}

		if (parts.length != 2) {
			addItem({ info: 'O formato do comando deve ser: join nome_da_sala' })
			return
		}

		if (!parts[ 1 ] || parts[ 1 ] == '') {
			addItem({ info: 'Nome da sala inválida' })
			return
		}

		room = parts[ 1 ]

		socket.emit('join', { name, room }, ({ msg, k }) => {
			setItens([ ...itens, {
				info: msg,
				tag: '+++'
			} ])
			setKey(k)
		})
	}

	function isCommand (command = '') {
		let parts = command.split(' ')

		for (let value of env.commands) {
			if (parts[ 0 ] === value.command) { // Verifica se comando existe
				manageCommands(parts[ 0 ], parts)

				return true
			}
		}

		return false
	}

	function manageCommands (command = '', parts = []) {
		switch (command) {
			case 'list':
				// list()
				break
			case 'join':
				// join(parts)
				break
			case 'name':
				setServerName(parts)
				break
			case 'clear':
				// clear()
				break
			case 'leave':
				// leave()
				break
			case 'help':
				// help()
				break
			case 'image':
				// image(parts)
				break
			case 'users':
				// listUsers()
				break
		}
	}

	function addItem (obj) {
		setItens([ ...itens, obj ])
	}

	function sendMsg (msg) {
		// let crypted = crypt(msg)

		// socket.emit('to_room', { msg: crypted, user: name, room }, ({ erro_msg }) => {
		// 	if (erro_msg) {
		// 		writeToScreen(info_template, { info: erro_msg })
		// 	} else {
		// 		writeToScreen(my_message_template, { name, msg, is_image: false })
		// 		escrever.value = ''
		// 	}
		// })
	}

	function inputHandleChange (event) {
		setText(event.target.value);
	}

	function inputHandleKeyup (event) {
		if (event.keyCode === 13) { // Deu enter
			if (text.length === 0) return
			let is = isCommand(text)
			let room = true

			if (!is) {
				if (!room) {
					addItem({ info: "Entre em alguma sala usando join nome_da_sala" })
				} else {
					sendMsg(text)
				}
			} else {
				setText('')
			}
		}
	}

	return (
		<div className="home">
			<Prompt itens={itens} />
			<Input
				text={text}
				inputHandleChange={inputHandleChange}
				inputHandleKeyup={inputHandleKeyup}
			/>
		</div>
	)
}