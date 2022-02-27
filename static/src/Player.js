class Player extends Phaser.GameObjects.Container{
    constructor(scene, x, y){
        super(scene, x, y)

        this.bodyWidth = 6
        this.scaleFactor = 2

        scene.anims.createFromAseprite('torso')
        scene.anims.createFromAseprite('legs')
        scene.anims.createFromAseprite('guns')

        this.legs = scene.add.sprite(0, 0, "legs", "0").setName('legs')
        this.torso = scene.add.sprite(0, 0, "torso", "0").setName('torso')
        this.gun = scene.add.sprite(0, 0, "guns", "9").setName('gun')

        this.add([this.legs, this.torso, this.gun])
        this.setSize(this.bodyWidth, 24)
        scene.physics.world.enable(this)
      
       
        scene.physics.add.collider(this, scene.ground)
        scene.add.existing(this)
    	
        scene.cameras.main.startFollow(this)

        this.setData('startQueue', [])
        this.setData('flip', false)
        this.setEquip('fire')

        this.setScale(this.scaleFactor, this.scaleFactor)
       
    }

    setEquip(equip){
        this.setData('equip', equip)
        switch (equip) {
            case "fire":
                this.removeAll()
                this.gun.setOrigin(0.48, 0.43)
                this.gun.setData({'upperBound': 1, 'lowerBound': -1})
                this.add([this.legs, this.torso, this.gun])
                break;
            case "alien":
                this.removeAll()
                this.gun.setOrigin(0.64, 0.63)
                this.gun.setData({'upperBound': 1, 'lowerBound': -1})
                this.add([this.legs, this.gun, this.torso])
                break;
            case "laser":
                this.removeAll()
                this.gun.setOrigin(0.5, 0.57)
                this.add([this.legs, this.torso, this.gun])
                this.gun.setData({'upperBound': 0.3, 'lowerBound': -0.3})
                break;
            case "rifle":
                this.removeAll()
                this.gun.setOrigin(0.5, 0.5)
                this.add([this.legs, this.torso, this.gun])
                this.gun.setData({'upperBound': 0, 'lowerBound': 0})
                break;
        
            default:
                break;
        }

        this.gun.setPosition(this.gun.displayWidth * (this.gun.originX - 0.5), this.gun.displayHeight * (this.gun.originY - 0.5))
        this.play({key: "gun_idle", repeat: 0})
        this.play({key: "torso_idle", repeat: 0})
    }

    setFlip(flip){
        
        if(flip){
            this.setScale(-this.scaleFactor, this.scaleFactor)
            this.body.setOffset(this.bodyWidth, 0)
            this.setData('flip', true)

        } else if(!flip){
            this.setScale(this.scaleFactor, this.scaleFactor)
            this.body.setOffset(0, 0)
            this.setData('flip', false)
        }
    }

    play(config, ignoreIfPlaying=false){
        this.getData('startQueue').push(config)
        switch (config.key.split("_")[0]){
            case "legs":
                this.getByName("legs").play(config, ignoreIfPlaying)
                break
            case "torso": 
                config.key = config.key + "_" + this.getData('equip')
                this.getByName("torso").play(config, ignoreIfPlaying)
                break
            case "gun":
                config.key = config.key + "_" + this.getData('equip')
                this.getByName("gun").play(config, ignoreIfPlaying)
            default:
                break
        }     
    }

}

