import { io, http } from './server'
import './socket/usuario'
try {
	http.listen(process.env.PORT, () => {
		console.log(`Servidor rodando: http://localhost:${process.env.PORT}`)
	})
}
catch (err) {
	console.log(`Verifique a conexão: ${err}`)
}

