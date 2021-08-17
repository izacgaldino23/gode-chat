import { http } from './server'
import './socket/usuario'

http.listen(process.env.PORT, () => {
	console.log(`Servidor rodando na porta ${process.env.PORT}`)
})