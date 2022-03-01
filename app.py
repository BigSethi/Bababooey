from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms



app = Flask(__name__)
app.config['SECRET_KEY'] = 'asdfasfadkfha'
socketio = SocketIO(app)


players = {}
room_list = [
	{
		'id': '12',
		'users': ['Zach']
	},
	{
		'id': '14',
		'users': ['Bob']
	}
]

def find_room(id):
	print(id)
	filter_list = list(filter((lambda room: room['id'] == id), room_list))
	print(filter_list)
	return filter_list[0] if not filter_list == [] else None

def find_players_in_room(id, player_id):
	players_in_room = []
	print(players)
	for player in players:
		if players[player]['id'] == id and not player == player_id:
			players_in_room.append(players[player])
	return players_in_room

 
@app.route('/')
def index():
	return render_template('index.html')


def messageReceived(methods=['GET', 'POST']):
	print('client got message')


@socketio.on('connect')
def user_connected(methods=['GET', 'POST']):
	'''
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
	emit('newPlayer', players[request.sid], broadcast=True)'''
	


@socketio.on('disconnect')
def user_disconnected():
	players.pop(request.sid)
	emit('userDisconnected', {"playerID": request.sid}, broadcast = True)
	

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
		emit('newPlayerData', players[id], broadcast=True, room=movementData['id'])

@socketio.on('connectToRoom')
def connect_to_room(data, methods=['GET', 'POST']):
	print(data['id'])
	room = (find_room(data['id']))
	print(room)
	if(room):
		if(len(room['users']) == 2):
			print('It thinks Room is full')
			emit('unsuccessfulRoomConnection', {'description': 'The room you are trying to enter is currently full'})
		else:
			print('roomGood')
			join_room(room['id'])
			print(room['id'])
			emit('startMatch', {'id': room['id'], 'users': [data['username'], room['users'][0]]}, room=room['id'])
	else:
		print('It Doesnt like code')
		emit('unsuccessfulRoomConnection', {'description': 'The code you entered was not correct'})

@socketio.on('switchedScenes')
def switched_scenes(data, methods=['GET', 'POST']):
	# print(list(rooms))
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
		"playerID": request.sid,
		"id": data['id']
	}
	# , room=data['id']
	print(find_players_in_room(data['id'], request.sid))
	emit('currentPlayers', players)
	emit('newPlayer', players[request.sid], room=data['id'], skip_sid=request.sid)





if __name__ == '__main__':
	socketio.run(app, debug=True, port=5005)

# if __name__ == '__main__':
# 	socketio.run(app, debug=True, port=5003, host='0.0.0.0')
