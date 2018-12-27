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
			messages: []
		};
	}

	setSocketListeners = () => {
		socket.on('user_activated', (data) => {
			const user = data['user'];
			const { activeUsers } = this.state;
			if (activeUsers.indexOf(user) === -1 && user !== this.state.username) {
				this.setState({ activeUsers: [...activeUsers, user] });
			}
		});

		socket.on('user_deactivated', (data) => {
			const deactivatedUser = data['user'];
			const { activeUsers } = this.state;
			if (activeUsers.indexOf(deactivatedUser) !== -1) {
				this.setState({ activeUsers: activeUsers.filter((user) => {
					return user !== deactivatedUser;
				})});
			}
		});

		socket.on('open_room', (data) => {
			const room = data['room'];
			const userInRoom = room.split('|').indexOf(this.state.username) !== -1;
			const roomNotOpen = this.state.rooms.indexOf(room) === -1;
			if (userInRoom && roomNotOpen) {
				this.joinRoom(room, this.state.username);
			}
		});
	}

	componentDidMount() {
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
		room = room || [username, partner].sort().join('|');
		if (this.state.rooms.indexOf(room) === -1) {
			this.setState({rooms: [...this.state.rooms, room]}, () => {
				socket.emit('join_room', {username: room});
			});
		}
	}

	render() {
		// eslint-disable-next-line
		const { username, rooms } = this.state;
		const chatWindows = rooms.map((room) => {
			return (
				<ChatWindow
					partner={room.partner}
					messages={room.messages}
				/>
			);
		});
		return (
			<div className='App'>
				<ControlBar
					activeUsers={this.state.activeUsers}
					setUsername={this.setUsername}
				/>
				<div className='chatWindows'>
					{chatWindows}
				</div>
			</div>
		);
	}
}

export default App;
