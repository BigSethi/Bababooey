
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit



app = Flask(__name__)
app.config['SECRET_KEY'] = 'asdfasfadkfha'
socketio = SocketIO(app)


players = {}

 
@app.route('/')
def index():
	return render_template('index.html')


def messageReceived(methods=['GET', 'POST']):
	print('client got message')


@socketio.on('connect')
def user_connected(methods=['GET', 'POST']):
	print(str(request.sid))
	players[request.sid] = {
		"x": 200, 
		"y": 200, 
		"dx": 0,
		"dy": 0, 
		"startQueue": [],
		"flip": False,
		"gunRotation": 0,
		"equip": 'fire',
		"playerID": request.sid
	}
	emit('currentPlayers', players, callback=messageReceived)
	emit('newPlayer', players[request.sid], broadcast=True)


@socketio.on('disconnect')
def user_disconnected():
	players.pop(request.sid)
	emit('userDisconnected', {"playerID": request.sid}, broadcast=True)

@socketio.on('playerMoved')
def player_moved(movementData, methods=['GET', 'POST']):
	id = movementData['playerID']
	players[id]['x'] = movementData['x']
	players[id]['y'] = movementData['y']
	players[id]['dx'] = movementData['dx']
	players[id]['dy'] = movementData['dy']
	players[id]['startQueue'] = movementData['startQueue']
	players[id]['flip'] = movementData['flip']
	players[id]['gunRotation'] = movementData['gunRotation']
	players[id]['equip'] = movementData['equip']
	if(len(players) > 1):
		emit('newPlayerData', players[id], broadcast=True)


if __name__ == '__main__':
	socketio.run(app, debug=True, port=5005)

# if __name__ == '__main__':
# 	socketio.run(app, debug=True, port=5003, host='0.0.0.0')
