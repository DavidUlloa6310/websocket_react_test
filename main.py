from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins = "*", logger = False, engineio_logger=False)

@socketio.on("connect")
def connect(auth):
    print(auth)
    emit("user_connected", broadcast = True)

@socketio.on("message")
def handle_message(data):
    send(data, broadcast = True)

if __name__ == '__main__':
    socketio.run(app)