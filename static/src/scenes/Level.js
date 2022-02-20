

class Level extends Phaser.Scene {


	constructor() {
		super("Level");
		
		this.playerController
		this.cursors
	}


	init(){
		this.cursors = this.input.keyboard.createCursorKeys()
	}

	preload(){
		this.load.pack("assets-pack", "static/assets/asset-pack.json")
		
	}

	create() {
		this.createNinjaAnimations()

		for(let i = -1; i < 4; i++){
			for(let j = -1; j < 2; j++){
				const image = this.add.image(i*1200, j*800, 'background')
				image.setOrigin(0,0)
			}
		}

		const map = this.make.tilemap({key: "map"})
		const tileset = map.addTilesetImage("woodland", "tileset_basic")

		this.ground = map.createLayer("ground", tileset)
		this.ground.setCollisionByProperty({collides: true})
		

		// this.physics.world.con
		// this.physics.world.convertTilemapLayer(ground)

		const {width, height} = this.scale


		var self = this
		// this.socket = io.connect('http://' + document.domain + ':' + location.port)
		this.socket = io()
		this.otherSprites = this.add.group()


		this.socket.on('currentPlayers', function(players){
			Object.keys(players).forEach(function(id) {
				if(players[id].playerID === self.socket.id){
					self.addPlayer(self, players[id])

					self.oldPosition = {
						x: self.sprite.x,
						y: self.sprite.y,
						dx: self.sprite.body.velocity.x,
						dy: self.sprite.body.velocity.y
					}

				} else {
					self.addOtherPlayer(self, players[id])
				}
			})
		})

		this.socket.on('newPlayer', function(player){
			if(player.playerID != self.socket.id)
				self.addOtherPlayer(self, player)
		})
		
		this.socket.on('userDisconnected', function(json){
			self.otherSprites.getChildren().forEach(function(player){
				if(player.playerID === json.playerID){
					player.destroy()
				}
			})
		})

		this.socket.on('newPlayerData', function(player){
			self.otherSprites.getChildren().forEach(function(childSprite){
				if(childSprite.playerID === player.playerID){
					childSprite.setPosition(player.x, player.y)
					childSprite.setVelocityX(player.dx)
					childSprite.setVelocityY(player.dy)
				}
			})
		})
		
	
	}

	update(t, dt){

		if(!this.sprite){
			return
		}
		
		this.playerController.update(dt)
	
	

			var x = this.sprite.x
			var y = this.sprite.y
			var dx = this.sprite.body.velocity.x
			var dy = this.sprite.body.velocity.y


			if(this.oldPosition.x != x || this.oldPosition.y != y || this.oldPosition.dx != dx || this.oldPosition.dy != dy){
				this.socket.emit('playerMoved', {
					x: this.sprite.x,
				    y: this.sprite.y,
					dx: this.sprite.body.velocity.x,
					dy: this.sprite.body.velocity.y,
					playerID: this.socket.id
				})

				this.oldPosition = {
					x: this.sprite.x,
					y: this.sprite.y,
					dx: this.sprite.body.velocity.x,
					dy: this.sprite.body.velocity.y
				}
			}	



	}

	addPlayer(self, player){

		self.sprite = self.physics.add.sprite(player.x, player.y, 'ninja', 'Standing/NinjaCat_idle_01.png')
		self.playerController = new PlayerController(self.sprite, self.cursors)
		self.sprite.setTint(0x0000ff)
		self.sprite.setScale(0.4)
		self.physics.add.collider(self.sprite, self.ground)

		self.cameras.main.startFollow(self.sprite)
		
	}

	addOtherPlayer(self, player){
		const otherSprite = self.physics.add.sprite(player.x, player.y, 'ninja', 'Standing/NinjaCat_idle_01.png')
		otherSprite.setTint(0xff0000)
		otherSprite.setScale(0.4)
		self.physics.add.collider(otherSprite, self.ground)
		// otherSprite.setFixedRotation()

		otherSprite.playerID = player.playerID
		self.otherSprites.add(otherSprite)
	}

	createNinjaAnimations(){
		this.anims.create(
			{
				repeat: -1,
				key: "idle",
				frameRate: 1,
				frames: this.anims.generateFrameNames('ninja', {
					prefix: "Standing/NinjaCat_idle_0",
					start: 1,
					end: 2,
					suffix: ".png"
				})
			}
		)
		

		this.anims.create(
			{
				repeat: 0,
				key: "jump",
				frameRate: 10,
				frames: this.anims.generateFrameNames('ninja', {
					prefix: "Jump/NinjaCat_jump_0",
					start: 1,
					end: 6,
					suffix: ".png"
				})
			}
		)
		this.anims.create(
			{
				repeat: 0,
				key: "attack_kick",
				frameRate: 5,
				frames: this.anims.generateFrameNames('ninja', {
					prefix: "Attack_kick/NinjaCat_attack_kick_0",
					start: 1,
					end: 4,
					suffix: ".png"
				})
			}
		)

		this.anims.create(
			{
				repeat: -1,
				key: "walk",
				frameRate: 10,
				frames: this.anims.generateFrameNames('ninja', {
					prefix: "Walk/NinjaCat_walk_0",
					start: 1,
					end: 8,
					suffix: ".png"
				})
			}
		)
	}
}

