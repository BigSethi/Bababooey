this.socket.on('userDisconnected', function(json){
    self.otherSprites.getChildren().forEach(function(player){
        if(player.playerID === json.playerID){
            player.destroy()
        }
    })
})

