class TitleScreen extends Phaser.Scene{
    constructor(){
        super("TitleScreen");
		
		this.playerController
		this.cursors
    }
    

    init(){
        this.cursors ={
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        };

    }

    preload(){
		this.load.pack("assets-pack", "static/assets/asset-pack.json");
        this.load.html('nameform', 'static/assets/text/nameform.html');
    }

    create(){
        var self = this;
		this.socket = io();

        this.registry.set('socket', this.socket);
        
        //Create the button to connect
        const room12 = this.add.text(100, 100, 'Connect to room 12!', { fill: '#0f0' });    
        room12.setInteractive();
        room12.on('pointerdown', () => this.connectToGame() );

        const room14 = this.add.text(100, 150, 'Connect to room 14!', { fill: '#0f0' });    
        room14.setInteractive();
        room14.on('pointerdown', () => this.connectToGame_test() );

        // var username = this.add.dom(400, 0).createFromCache('nameform');
        // username.addListener('click');
        // username.on('click', function(event){
        //     var inputText = this.getChildByName('nameField');
        //     console.log(inputText);
        //     if(inputText.value !== ''){
        //         this.socket.emit('connectToRoom', {id: inputText.value, username: 'Zach'});
        //     }
        // });
        

        this.socket.on('waitingRoom', function(data){

        });

        const startLevel = (room_code) => {
            console.log(room_code)
            this.scene.start('Level', {id: room_code}); 
        }

        this.socket.on('startMatch',  function(data){
            console.log(data.id)
            startLevel(data.id);
        });

        this.socket.on('unsuccessfulRoomConnection', function(data){
            const helloButton = this.add.text(100, 100, data.description, { fill: '#0f0' });    
        });
    }


    update(){
        
    }

    connectToGame(){
        console.log('connecting');
        this.socket.emit('connectToRoom', {id: '12', username: 'Zach'});
    }

    connectToGame_test(){
        console.log('connecting');
        this.socket.emit('connectToRoom', {id: '14', username: 'Zach'});
    }

    
}