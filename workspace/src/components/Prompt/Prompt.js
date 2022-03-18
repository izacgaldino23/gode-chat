import { Message } from "../Message";

import './Prompt.css'

export default function Prompt ({ itens }) {
	return (
		<div className="prompt">
			{
				itens.map((item, index) => {
					if (item.type === 'message') {
						return <Message message={item.text} user='Izac' key={index} />
					}

					return null
				})
			}
		</div>
	);
}