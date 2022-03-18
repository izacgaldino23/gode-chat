import { useState } from "react";
import { Input } from "../../components/Input";

import Prompt from "../../components/Prompt/Prompt";


import './Home.css'

export function Home () {
	const [ text, setText ] = useState("");
	const [ itens, setItens ] = useState([]);

	function inputHandleChange (event) {
		setText(event.target.value);
	}

	function inputHandleKeyup (event) {
		if (event.keyCode === 13 && text !== '') {
			setItens([ ...itens, {
				type: 'message',
				text,
			} ]);
			setText("");
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