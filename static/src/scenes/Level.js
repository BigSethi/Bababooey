
class Level extends Phaser.Scene {


	constructor() {
		super("Level");

		
		this.playerController
		this.cursors
		this.player

	}

	init(data){
		this.cursors = {
			left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
			up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
			two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
			three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
			four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
			space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
			reload: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)

		}

		this.room = data.room
		this.username = data.username

	}

	preload(){
		this.load.pack("assets-pack", "static/assets/asset-pack.json")
		
	}

	create() {
		
		for(let i = -1; i < 4; i++){
			for(let j = -1; j < 4; j++){
				const image = this.add.image(i*720, j*480, 'clouds')
				image.setOrigin(0,0)
			}
		}
		const map = this.make.tilemap({key: "pixel_map"})
		const tileset = map.addTilesetImage("pixel", "pixel_tileset")

		this.ground = map.createLayer("ground", tileset)
		this.ground.setCollisionByProperty({collides: true})

		this.leaderboard = []
		

		var self = this
		this.socket = this.registry.get('socket');
		this.players = this.add.group()


		this.socket.on('currentPlayers', (players) => {
			Object.keys(players).forEach((id) => {
				if(players[id].playerID === this.socket.id){
					this.addPlayer(players[id])

				} else {
					this.addOtherPlayer(players[id])
				}

				this.addToLeaderboard()
				this.drawLeaderboard()
			})
		})

		this.socket.on('newPlayer', (player) => {
			if(player.playerID != this.socket.id){
				this.addOtherPlayer(player)
				
				this.addToLeaderboard()
				this.drawLeaderboard()
			}
	
		})
		
		this.socket.emit('connectToRoom', {room: this.room, username: this.username}) 

		this.socket.on('userDisconnected', (json) => {
			self.players.getChildren().forEach((player) => {
				if(player.getData('playerID') === json.playerID){
					player.healthUI.destroy()
					player.healthBarUI.destroy()
					player.removeAll([true, true, true])
					player.destroy()
				}
			})
		})

		this.socket.on('newHitData', (data) => {
			if(data.hID === this.socket.id){
				if(this.player.takeDamage(data.t)){
					this.socket.emit('iDied', data.sID)
				}
				
			} 
		})

		this.socket.on('newKillData', (killer) => {
			this.players.getChildren().forEach((player) => {
				if(player.getData('playerID') == killer){
					player.data.values.kills += 1
					console.log(player.getData('name'))
					console.log(player.data.values.kills)
					this.drawLeaderboard(this)
				}
			})
		})

		this.socket.on('newPlayerData', function(player){
			self.players.getChildren().forEach(function(childPlayer){
				if(childPlayer.getData('playerID') === player.playerID){
					childPlayer.setPosition(player.x, player.y)
					childPlayer.body.setVelocityX(player.dx)
					childPlayer.body.setVelocityY(player.dy)

					childPlayer.setFlip(player.flip)
					childPlayer.setEquip(player.equip)
					childPlayer.getByName('gun').setRotation(player.gunRotation)

					player.startQueue.forEach((startEvent) => {

						if(startEvent == 'shoot'){
							childPlayer.shoot()
						} else {
							childPlayer.play(startEvent)
						}
						
					})
					

				}	
			})
		})

	
	}

	update(t, dt){

		if(!this.player){
			return
		}
		
		
		this.playerController.update(dt)
	
		
			this.socket.emit('playerMoved', {
				x: this.player.x,
				y: this.player.y,
				dx: this.player.body.velocity.x,
				dy: this.player.body.velocity.y,
				playerID: this.socket.id,
				startQueue: this.player.getData('startQueue'),
				gunRotation: this.player.getByName('gun').rotation,
				equip: this.player.getData('equip'),
				flip: this.player.getData('flip')
			})

			this.player.setData('startQueue', [])

			



	}

	drawLeaderboard(){
		console.log('hello')
		console.log(this.leaderboard.length)
        for(let i = 0; i < this.leaderboard.length; i++){
			console.log('bobos')
			console.log(this.players.getChildren()[i])
			let string =  this.players.getChildren()[i].getData('name') + '  ' + this.players.getChildren()[i].getData('kills')
            this.leaderboard[i].setText(string)
        }
    }

	addToLeaderboard(){
		let length = this.players.getChildren().length
		let y = length * 20 + 30
		this.leaderboard.push(this.add.text(300, y, '').setScrollFactor(0, 0))
	}


	addPlayer(player){
		this.player = new Player(this, player.x, player.y)
		
		this.playerController = new PlayerController(this.player, this.cursors, this)
		this.player.setData('playerID', player.playerID)
		this.player.setData('name', player.name)
		this.players.add(this.player)

		
	}

	addOtherPlayer(player){
		let otherPlayer = new Opponent(this, player.x, player.y)

		otherPlayer.setData('playerID', player.playerID)
		otherPlayer.setData('name', player.name)
		this.players.add(otherPlayer)
	}

	
}

