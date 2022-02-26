
class PlayerController{
    constructor(player, cursors, scene){
        this.stateMachine = new StateMachine('PlayerController', this)
        this.scene = scene
        this.player  = player
        this.cursors = cursors

        let {width, height} = scene.scale

        this.pointer = {
            x: width,
            y: height / 2
        }


        scene.input.on('pointermove', (pointer) => {
			this.pointer.x = pointer.x
			this.pointer.y = pointer.y
		})


		scene.input.on('pointerdown', (pointer) => {
            console.log("go")
            this.player.play({key: "gun_fire", repeat: -1, frameRate: 15}, true)
            this.player.play({key: "torso_fire", repeat: -1, frameRate: 15}, true)
		})

        scene.input.on('pointerup', (pointer) => {
            console.log("go")
            this.player.play({key: "gun_idle", repeat: 0, frameRate: 10}, true)
            this.player.play({key: "torso_idle", repeat: 0, frameRate: 10}, true)
		})
        

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter,
            onUpdate: this.idleOnUpdate
        })

        this.stateMachine.addState('walk', {
            onEnter: this.walkOnEnter,
            onUpdate: this.walkOnUpdate
        })

        this.stateMachine.addState('jump', {
            onEnter: this.jumpOnEnter,
            onUpdate: this.jumpOnUpdate
        })

        this.stateMachine.setInitialState('idle')

    }

    update(dt){
        this.stateMachine.update(dt)

        if(this.pointer.x - (this.player.x - this.scene.cameras.main.scrollX) < 0){
            this.player.setFlip(true)
        } else {
            this.player.setFlip(false)
        }

        if(Phaser.Input.Keyboard.JustDown(this.cursors.one)){
            this.player.setEquip('fire')
            this.player.play({key: "gun_idle", repeat: -1})
            this.player.play({key: "torso_idle", repeat: -1})
        } else if(Phaser.Input.Keyboard.JustDown(this.cursors.two)){
            this.player.setEquip('alien')
            this.player.play({key: "gun_idle", repeat: -1})
            this.player.play({key: "torso_idle", repeat: -1})
        } else if(Phaser.Input.Keyboard.JustDown(this.cursors.three)){
            this.player.setEquip('laser')
            this.player.play({key: "gun_idle", repeat: -1})
            this.player.play({key: "torso_idle", repeat: -1})
        } else if(Phaser.Input.Keyboard.JustDown(this.cursors.four)){
            this.player.setEquip('rifle')
            this.player.play({key: "gun_idle", repeat: -1})
            this.player.play({key: "torso_idle", repeat: -1})
        }

    
        let gunOffsetX = (this.player.getByName('gun').originX - 0.5) * this.player.getByName('gun').displayWidth
        let gunOffsetY = (this.player.getByName('gun').originY - 0.5)* this.player.getByName('gun').displayHeight

        let deltaX = Math.abs((this.pointer.x - gunOffsetX - (this.player.x - this.scene.cameras.main.scrollX)))
        let deltaY = ((this.player.y - this.scene.cameras.main.scrollY) + gunOffsetY - this.pointer.y)

        let rotation = Math.atan(deltaY / deltaX)

     

        if(rotation >= this.player.getByName('gun').getData('upperBound')){
            rotation = this.player.getByName('gun').getData('upperBound')
        } else if (rotation <= this.player.getByName('gun').getData('lowerBound')){
            rotation = this.player.getByName('gun').getData('lowerBound')
        }

      
        this.player.getByName('gun').setRotation(-rotation)
        

        // if(Phaser.Input.Pointer.isDown){
        //     this.player.play({key: "gun_fire", repeat: 0, frameRate: 15}, true)
        //     this.player.play({key: "torso_fire", repeat: 0, frameRate: 15}, true)
        // } 
        
        

    }

    idleOnEnter(){
        this.player.play({key: 'legs_idle', repeat: -1})
        this.player.play({key: 'gun_idle', repeat: -1})
        this.player.play({key: 'torso_idle', repeat: -1})
    }

    idleOnUpdate(){

        var spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)

        if(this.cursors.left.isDown){
            this.stateMachine.setState('walk')
        } else if(this.cursors.right.isDown){
            this.stateMachine.setState('walk')
        } else if(spaceJustPressed){
            this.stateMachine.setState('jump')
        }
        if(this.player.body.onFloor()){
            this.player.body.setVelocityX(0)
        }


    }

    walkOnEnter(){
        this.player.play({key: 'legs_walk', repeat: -1})

    }

    walkOnUpdate(){
        var spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
        var speed = 100
        if(this.cursors.left.isDown){
            this.player.body.setVelocityX(-speed)
        } else if(this.cursors.right.isDown){
            this.player.body.setVelocityX(speed) 
        } else { 
            this.stateMachine.setState('idle')
        }
        
        if(spaceJustPressed){
            this.stateMachine.setState('jump')
        }
    }

    jumpOnEnter(){
        this.player.body.setVelocityY(-250)
        this.player.play({key: 'legs_jump', repeat: 0})
        this.stateMachine.states.jump.numJumps = 1
    }

    jumpOnUpdate(){
        var speed = 100
        var spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
        if(this.cursors.left.isDown){
          
            this.player.body.setVelocityX(-speed)
        } else if(this.cursors.right.isDown){
        
            this.player.body.setVelocityX(speed) 
        } 

        if(this.stateMachine.states.jump.numJumps < 2 && spaceJustPressed){
            this.player.body.setVelocityY(-250)
            this.player.play({key: 'legs_jump', repeat: 0})
            this.stateMachine.states.jump.numJumps += 1
        }

        if(this.player.body.onFloor()){
            this.player.body.setVelocityX(0)
            this.stateMachine.setState('idle')
        }

    }
   




}
