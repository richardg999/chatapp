from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__, static_folder='../client/build/static')
app.config['SECRET_KEY'] = 'secret#123'
socket = SocketIO(app)

@app.route('/')
def serve_static_index():
    return send_from_directory('../client/build/', 'index.html')

@socket.on('connect')
def on_connect():
    print('user connected')
    emit('retrieve_active_users', broadcast=True)

@socket.on('activate_user')
def on_active_user(data):
    username = data.get('username')
    print('user activated: ' + str(username))
    emit('user_activated', {'username': username}, broadcast=True)

@socket.on('deactivate_user')
def on_inactive_user(data):
    username = data.get('username')
    emit('user_deactivated', {'username': username}, broadcast=True)

@socket.on('join_room')
def on_join(data):
    room = data.get('room')
    join_room(room)
    print('new room: ' + room)
    emit('open_room', {'room': room}, broadcast=True)

@socket.on('send_message')
def send_message(data):
    room = data.get('room')
    emit('message_sent', data, room=room)

if __name__ == '__main__':
    socket.run(app)