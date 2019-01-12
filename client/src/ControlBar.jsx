import React, { Component } from 'react';

class ControlBar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			partner: ''
		};
	}

	handleUsernameSubmit = (event) => {
		event.preventDefault();
		const username = this.state.username;
		if (username) {
			this.props.setUsername(username);
		}
	}

	handlePartnerSubmit = (event) => {
		event.preventDefault();
		const {username, partner} = this.state;
		if (username && partner) {
			this.props.joinRoom(null, username, partner);
		}
	}

	handleChange = (event) => {
		const {name, value} = event.target;
		this.setState({ [name]: value });
	}

	render() {
		const usersList = this.props.activeUsers.map((user) => {
			return <option value={user}>{user}</option>;
		});
		return (
			<div className='ControlBar'>

				<form onSubmit={this.handleUsernameSubmit}>
						<label>
							<strong>Username:</strong>
							<input
								id='username-input'
								name='username'
								type='text'
								placeholder='e.g. Alice'
								onChange={this.handleChange}
							/>
						</label>
						<button type='submit'>Register</button>
				</form>

				<form onSubmit={this.handlePartnerSubmit}>
          <div>
            <label>
              <strong>Partner:</strong>
              <select
                id='partner-select'
                name='partner'
                value={this.state.partner}
								onChange={this.handleChange}
							>
                {this.props.activeUsers.length > 0
                  ? <option value=''>Select a user...</option>
                  : <option value=''>Waiting for others...</option>
                }
                {usersList}
              </select>
            </label>
            <button type='submit'>Chat</button>
          </div>
        </form>

			</div>
		)
	}

}

export default ControlBar;