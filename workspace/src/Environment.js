const env = {
	commands: [
		{ command: 'name', args: 'seu_nome', description: 'Muda seu nome' },
		{ command: 'list', args: '', description: 'Lista todas as salas' },
		{ command: 'join', args: 'nome_da_sala', description: 'Cria/Entra em uma sala' },
		{ command: 'image', args: 'link', description: 'Envia uma imagem' },
		{ command: 'users', args: '', description: 'Lista usuários de uma sala' },
		{ command: 'clear', args: '', description: 'Limpa janela de msgs' },
		{ command: 'leave', args: '', description: 'Sai de uma sala' },
		{ command: 'help', args: '', description: 'Mostra comandos' },
	],
	ENDPOINT: "192.168.1.120:9080",
}

export default env