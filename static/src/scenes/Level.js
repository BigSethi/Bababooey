
class Level extends Phaser.Scene {


	constructor() {
		super("Level");
		
		this.playerController
		this.cursors

	}

	init(){
		this.cursors = {
			left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
			up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
			two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
			three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
			four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
			fire: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)

		}

		

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
		


		var self = this
		this.socket = io()
		this.otherPlayers = this.add.group()


		this.socket.on('currentPlayers', (players) => {
			Object.keys(players).forEach((id) => {
				if(players[id].playerID === this.socket.id){
					this.addPlayer(players[id])

					// this.oldPosition = {
					// 	x: this.player.x,
					// 	y: this.player.y,
					// 	dx: this.player.body.velocity.x,
					// 	dy: this.player.body.velocity.y,
					// 	startQueue: this.player.getData('startQueue'),
					// 	flip: this.player.getData('flip')
						
					// }

				} else {
					this.addOtherPlayer(players[id])
				}
			})
		})

		this.socket.on('newPlayer', function(player){
			if(player.playerID != self.socket.id)
				self.addOtherPlayer(player)
		})
		
		this.socket.on('userDisconnected', (json) => {
			self.otherPlayers.getChildren().forEach((player) => {
				if(player.getData('playerID') === json.playerID){
					player.removeAll([true, true, true])
					player.destroy()
				}
			})
		})

		this.socket.on('newPlayerData', function(player){
			self.otherPlayers.getChildren().forEach(function(childPlayer){
				if(childPlayer.getData('playerID') === player.playerID){
					childPlayer.setPosition(player.x, player.y)
					childPlayer.body.setVelocityX(player.dx)
					childPlayer.body.setVelocityY(player.dy)

					childPlayer.setFlip(player.flip)
					childPlayer.setEquip(player.equip)
					childPlayer.getByName('gun').setRotation(player.gunRotation)

					player.startQueue.forEach((startEvent) => {
						childPlayer.play(startEvent)
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
	
		// var x = this.player.x
		// var y = this.player.y
		// var dx = this.player.body.velocity.x
		// var dy = this.player.body.velocity.y


		// if(this.oldPosition.x != x || this.oldPosition.y != y || this.oldPosition.dx != dx || this.oldPosition.dy != dy){
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

			// this.oldPosition = {
			// 	x: this.player.x,
			// 	y: this.player.y,
			// 	dx: this.player.body.velocity.x,
			// 	dy: this.player.body.velocity.y,
			// 	start: this.player.getData('start'),
			// 	flip: this.player.getData('flip')
			// 	}
			// }	
			



	}

	addPlayer(player){
		this.player = new Player(this, player.x, player.y)
		
		this.playerController = new PlayerController(this.player, this.cursors, this)

		
	}

	addOtherPlayer(player){
		const otherPlayer = new Opponent(this, player.x, player.y)

		otherPlayer.setData('playerID', player.playerID)
		this.otherPlayers.add(otherPlayer)
	}

	
}

