import React, { Component } from 'react';
import ControlBar from './ControlBar';
import ChatWindow from './ChatWindow';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			activeUsers: [],
			rooms: [],
			messageDict: {}
		};
	}

	loadMessages = () => {
		const savedMessageDict = window.localStorage.getItem('messageDict');
		if (savedMessageDict) {
			this.setState({ messageDict: JSON.parse(savedMessageDict) });
		}
	}

	setSocketListeners = () => {
		socket.on('retrieve_active_users', () => {
			const { username } = this.state;
			if (username) {
				socket.emit('activate_user', {username: username});
			}
		});

		socket.on('user_activated', (data) => {
			const username = data.username;
			const { activeUsers } = this.state;
			if (activeUsers.indexOf(username) === -1 && username !== this.state.username) {
				this.setState({ activeUsers: [...activeUsers, username] });
			}
		});

		socket.on('user_deactivated', (data) => {
			const deactivatedUser = data.username;
			const { activeUsers } = this.state;
			if (activeUsers.indexOf(deactivatedUser) !== -1) {
				this.setState({ activeUsers: activeUsers.filter((user) => {
					return user !== deactivatedUser;
				})});
			}
		});

		socket.on('open_room', (data) => {
			const { username, rooms } = this.state;
			const room = data.room;
			const userInRoom = room.split('|').indexOf(username) !== -1;
			const roomNotOpen = rooms.indexOf(room) === -1;
			if (userInRoom && roomNotOpen) {
				this.joinRoom(room, username);
			}
		});

		socket.on('message_sent', (data) => {
			const { messageDict } = this.state;
			const room = data.room;
			const messageList = [...messageDict[room], data];
			this.setState({ messageDict: {...messageDict, [room]:messageList} }, () => {
				window.localStorage.setItem('messageDict', JSON.stringify(this.state.messageDict));
			});
		});
	}

	componentDidMount() {
		this.loadMessages();
		this.setSocketListeners();
	}

	setUsername = (username) => {
		const oldName = this.state.username;
		if (oldName && oldName !== username) {
			socket.emit('deactivate_user', {username: oldName});
		}
		this.setState({ username: username}, () => {
			socket.emit('activate_user', {username: username});
		});
	}

	joinRoom = (room, username, partner) => {
		const {rooms, messageDict } = this.state;
		room = room || [username, partner].sort().join('|');
		if (rooms.indexOf(room) === -1) {
			this.setState({rooms: [...rooms, room], 
				messageDict: {...messageDict, [room]:messageDict[room] || []}}, 
				() => { socket.emit('join_room', {room: room}) });
		}
	}

	leaveRoom = (room) => {
		const { rooms } = this.state;
		this.setState({rooms: rooms.filter((name) => name !== room)});
	}

	getPartnerName = (room) => {
		const members = room.split('|');
		return members.filter((member) => member !== this.state.username)[0];
	}

	sendMessage = (message, room) => {
		socket.emit(
			'send_message',
			{
				room: room,
				author: this.state.username,
				body: message
			}
		)
	}

	render() {
		const { rooms, messageDict } = this.state;
		const chatWindows = rooms.map((room) => {
			return (
				<ChatWindow
					partner={this.getPartnerName(room)}
					messages={messageDict[room]}
					room={room}
					leaveRoom={this.leaveRoom}
					sendMessage={this.sendMessage}
				/>
			);
		});
		return (
			<div className='App'>
				<div className='title'>
					Chat Server
				</div>
				<ControlBar
					activeUsers={this.state.activeUsers}
					setUsername={this.setUsername}
					joinRoom={this.joinRoom}
				/>
				<div className='chatWindows'>
					{chatWindows}
				</div>
			</div>
		);
	}
}

export default App;
