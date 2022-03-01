class WaitingRoom extends Phaser.scene{
    constructor(){
        super('Waiting Room')

        this.playerController
		this.cursors
    }

    init(){

    }

    preload(){

    }

    create(){
        const helloButton = this.add.text(100, 100, 'You are trapped in the waiting room!', { fill: '#0f0' });    
    }

    update(){

    }
}