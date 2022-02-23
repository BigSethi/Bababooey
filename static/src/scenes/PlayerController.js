
class PlayerController{
    constructor(sprite, cursors){
        this.stateMachine = new StateMachine('PlayerController', this)
        this.sprite  = sprite
        this.sprite.setData('flip', false)
        this.cursors = cursors
        

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
    }

    idleOnEnter(){
        this.sprite.play('idle')
        this.sprite.setData('start', 'idle')
    }

    idleOnUpdate(){

        var spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)

        if(this.cursors.left.isDown){
            this.stateMachine.setState('walk')
        } else if(this.cursors.right.isDown){
            this.stateMachine.setState('walk')
        } else if(spaceJustPressed){
            this.stateMachine.setState('jump')
        }   
        
        if(this.sprite.body.onFloor()){
            this.sprite.setVelocityX(0)
        }

    }

    walkOnEnter(){
        this.sprite.play('walk')
        this.sprite.setData('start', 'walk')
    }

    walkOnUpdate(){
        var spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)
        var speed = 250
        if(this.cursors.left.isDown){
            this.sprite.flipX = true
            this.sprite.setData('flip', true)
            this.sprite.setVelocityX(-speed)
        } else if(this.cursors.right.isDown){
            this.sprite.flipX = false
            this.sprite.setData('flip', false)
            this.sprite.setVelocityX(speed) 
        } else { 
            this.stateMachine.setState('idle')
        }
        
        if(spaceJustPressed){
            this.stateMachine.setState('jump')
        }
    }

    jumpOnEnter(){
        this.sprite.setVelocityY(-350)
        this.sprite.play('jump')
        this.sprite.setData('start', 'jump')
        this.stateMachine.states.jump.numJumps = 1
    }

    jumpOnUpdate(){
        var speed = 250
        var spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)
        if(this.cursors.left.isDown){
            this.sprite.flipX = true
            this.sprite.setData('flip', true)
            this.sprite.setVelocityX(-speed)
        } else if(this.cursors.right.isDown){
            this.sprite.flipX = false
            this.sprite.setData('flip', false)
            this.sprite.setVelocityX(speed) 
        } 

        if(this.stateMachine.states.jump.numJumps < 2 && spaceJustPressed){
            this.sprite.setVelocityY(-350)
            this.sprite.play('jump')
            this.sprite.setData('start', 'jump')
            this.stateMachine.states.jump.numJumps += 1
        }

        if(this.sprite.body.onFloor()){
            this.sprite.setVelocityX(0)
            this.stateMachine.setState('idle')
        }

    }
   




}