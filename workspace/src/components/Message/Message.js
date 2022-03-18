import './Message.css'

export function Message ({ user, message, index }) {
    return (
        <div className='msg me'>
            <strong>#{user}</strong>:
            <span className='message'>{message}</span>
        </div>
    )
    // return (
    //     <div className="message"> {
    //         messages.map((message, index) => {
    //         })
    //     } </ div>
    // )
}