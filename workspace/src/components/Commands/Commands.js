import './Commands.css'
import env from '../../Environment'

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

export function Commands () {
	return (
		<div className='commands'>
			<p>=============== COMANDOS - {dateFormat()} ===============</p>
			<br />
			<table>
				<tbody>
					{env.commands.map((cmd, index) => {
						return (
							<tr key={index}>
								<td><strong>{cmd.command}</strong></td>
								<td>{cmd.args}</td>
								<td className='celula_opacity'>{` -> ${cmd.description}`}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			<br />
			<p>====================================================</p>
		</div>
	)
}