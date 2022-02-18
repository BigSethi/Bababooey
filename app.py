
from flask import Flask, render_template
from flask_socketio import SocketIO, emit



app = Flask(__name__)
app.config['SECRET_KEY'] = 'asdfasfadkfha'
socketio = SocketIO(app)


players = {}
counter = 0

 
@app.route('/')
def index():
	return render_template('index.html')


def messageReceived(methods=['GET', 'POST']):
	print('client got message')

@socketio.on('userConnect')
def user_connected(json, methods=['GET', 'POST']):
	print(str(json))
	global counter; counter += 1
	players[json['userID']] = {
		"x": 200 * counter, 
		"y": 200, 
		"dx": 0,
		"dy": 0, 
		"playerID": json['userID']
	}
	emit('currentPlayers', players, callback=messageReceived)
	emit('newPlayer', players[json['userID']], broadcast=True)

@socketio.on('playerMoved')
def player_moved(movementData, methods=['GET', 'POST']):
	id = movementData['playerID']
	players[id]['x'] = movementData['x']
	players[id]['y'] = movementData['y']
	players[id]['dx'] = movementData['dx']
	players[id]['dy'] = movementData['dy']
	if(len(players) > 1):
		emit('newPlayerData', players[id], broadcast=True)


# if __name__ == '__main__':
# 	socketio.run(app, debug=True, port=5003)

if __name__ == '__main__':
	socketio.run(app, debug=True, port=5003, host='0.0.0.0')
