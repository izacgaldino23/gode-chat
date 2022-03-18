import React from 'react';
import './Input.css';

export function Input ({ inputHandleChange, inputHandleKeyup, text }) {

	// const [audio, _] = useEffect(new Audio(song))

	// useEffect(() => {
	// }, [text])

	return (
		// <input
		// onChange={inputHandleChange}
		// onKeyUp={inputHandleKeyup}
		// value={text}
		// />
		<div className='write-box'>
			<span>{'>>'}</span>
			<input className="write" placeholder="digite algo"
				onChange={inputHandleChange}
				onKeyUp={inputHandleKeyup}
				value={text}
				autoFocus />

			{/* <audio src={audioNotificacao} id="audio_notificacao"></audio> */}
		</div>
	);
}