import { Commands } from "../Commands";
import { Message } from "../Message";
import { Info } from "../Info";

import './Prompt.css'

export default function Prompt ({ itens }) {
	function generateComponent (item, index) {
		const components = {
			message: <Message message={item.text} user={item.user} key={index} />,
			commands: <Commands key={index} />,
			info: <Info key={index} info={item.info} />,
		}

		return components[ item.type ]
	}

	return (
		<div className="prompt">
			{
				itens.map((item, index) => generateComponent(item, index))
			}
		</div>
	);
}