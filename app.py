

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, rooms, leave_room



app = Flask(__name__)
app.config['SECRET_KEY'] = 'asdfasfadkfha'
socketio = SocketIO(app)

roomsDict = {'12': {},
		 	'14': {}
}


 
@app.route('/')
def index():
	return render_template('index.html')


def messageReceived(methods=['GET', 'POST']):
	print('client got message')



@socketio.on('connectToRoom')
def user_connected(data, methods=['GET', 'POST']):
	print(str(request.sid))
	join_room(data['room'])
	newPlayer = {
		request.sid: {
		"x": 200, 
		"y": 200, 
		"dx": 0,
		"dy": 0, 
		"startQueue": [],
		"flip": False,
		"gunRotation": 0,
		"equip": 'fire',
		"playerID": request.sid,
		"name": data['username']
		}
	}
	if(data['room'] not in roomsDict.keys()):
		roomsDict[data['room']] = {}
	
	newPlayer.update(roomsDict[data['room']])
	roomsDict[data['room']] = newPlayer

	emit('currentPlayers', roomsDict[data['room']], callback=messageReceived)
	emit('newPlayer', roomsDict[data['room']][request.sid], broadcast=True, to=data['room'])


@socketio.on('disconnect')
def user_disconnected():
	if(len(rooms()) > 1):
		room = rooms()[1]
		leave_room(room)
		roomsDict[room].pop(request.sid)
		emit('userDisconnected', {"playerID": request.sid}, broadcast = True, to=room)

		if(len(roomsDict[room]) == 0):
			roomsDict.pop(room)
	
	

@socketio.on('playerMoved')
def player_moved(movementData, methods=['GET', 'POST']):
	room = rooms()[1]
	id = movementData['playerID']
	player = roomsDict[room][id]
	player['x'] = movementData['x']
	player['y'] = movementData['y']
	player['dx'] = movementData['dx']
	player['dy'] = movementData['dy']
	player['startQueue'] = movementData['startQueue']
	player['flip'] = movementData['flip']
	player['gunRotation'] = movementData['gunRotation']
	player['equip'] = movementData['equip']
	if(len(roomsDict[room]) > 1):
		emit('newPlayerData', player, broadcast=True, to=room, skip_sid=request.sid)

@socketio.on('hitPlayer')
def hit_player(hitData, methods=['GET', 'POST']):
	emit('newHitData', hitData, broadcast = True, to=rooms()[1])

@socketio.on('iDied')
def i_died(killer, methods=['GET', 'POST']):
	emit('newKillData', killer, broadcast = True, to=rooms()[1])


if __name__ == '__main__':
	socketio.run(app, debug=True, port=5007)

# if __name__ == '__main__':
# 	socketio.run(app, debug=True, port=5003, host='0.0.0.0')

