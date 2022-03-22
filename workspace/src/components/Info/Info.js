export function Info ({ tag, info }) {
	return (
		<p className="info">
			{tag ? tag : '>>>'} <span>{info}</span>
		</p>
	)
}