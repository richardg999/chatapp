import React, { Component } from 'react';

function Message (props) {
	const {author, body} = props.message;
	return <p><strong>{author}: </strong>{body}</p>;
}

class ChatWindow extends Component {
	constructor(props) {
		super(props);
		this.state = { message: '' };
	}

	handleSubmit = (event) => {
		event.preventDefault();
		if (this.state.message) {
			this.props.sendMessage(this.state.message, this.props.room);
			this.setState({ message: '' });
		}
	}

	handleChange = (event) => {
		this.setState({ message: event.target.value });
	}

	closeWindow = (event) => {
		this.props.leaveRoom(this.props.room);
	}

	componentDidMount = () => {
		this.messageWindow.scrollTop = this.messageWindow.scrollHeight;
	}

	componentDidUpdate = () => {
		this.messageWindow.scrollTop = this.messageWindow.scrollHeight;
	}

	render() {
		const { partner, messages } = this.props;
		const messageList = messages.map((message) => {
			return (
				<Message
					message={message}
				/>
			);
		});
		return (
			<div className='ChatWindow'>
				<div className='chat-header'>
					<h2>{partner}</h2>
					<button onClick={this.closeWindow}>X</button>
				</div>
				<div className='chat-body' ref={(win) => { this.messageWindow = win }}>
					{messageList}
				</div>
				<div className='chat-input'>
					<form onSubmit={this.handleSubmit}>
						<input
							type='text'
							name='message'
							className='chat-message'
							placeholder='your message here...'
							value={this.state.message}
							onChange={this.handleChange}
						/>
					</form>
				</div>
			</div>
		)
	}
}

export default ChatWindow;