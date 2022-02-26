
window.addEventListener('load', function () {

	var game = new Phaser.Game({
		width: 400,
		height: 300,
		type: Phaser.AUTO,
        backgroundColor: "#242424",
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH
		},
		physics: {
			default: "arcade",
			arcade: {
				debug: false,
				gravity: {y: 400}
			}
	
		},

		render: {
			pixelArt: true
		}
	});
	
	
	game.scene.add("Level", Level, true);
	
	
});


