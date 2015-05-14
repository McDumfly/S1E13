var game = new Phaser.Game(800, 600, Phaser.AUTO, '', null, true, false);

var WebtudorGame = function(game) {};

WebtudorGame.Boot = function(game) {};

var isoGroup, player;
var directions = [
	'down',
	'downleft',
	'downright',
	'up',
	'upleft',
	'upright',
	'left',
	'right'
];

WebtudorGame.Boot.prototype = {
	preload: function() {
		console.log(game.load.atlasJSONHash('assets', 'img/assets.png', 'js/assets.json'));

		game.time.advancedTiming = true;
		game.plugins.add(new Phaser.Plugin.Isometric(game));
		game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
		game.iso.anchor.setTo(0.5, 0.2);
	},
	create: function() {
		isoGroup = game.add.group();

		this.cursors = game.input.keyboard.createCursorKeys();

		this.game.input.keyboard.addKeyCapture([
			Phaser.Keyboard.LEFT,
			Phaser.Keyboard.RIGHT,
			Phaser.Keyboard.UP,
			Phaser.Keyboard.DOWN
		]);

		player = {
			state: 'idle',
			stateChanged: false,
			direction: {
				horizontal: '',
				vertical: 'down',
				changed: false
			},
			changeHorizontalDirection: function(direction) {
				if (player.direction.horizontal != direction) {
					player.direction.horizontal = direction;

					//Reset vertical
					player.direction.vertical = '';

					player.direction.changed = true;
				}
			},
			changeVerticalDirection: function(direction) {
				if (player.direction.vertical != direction) {
					// Reset horizontal
					if (!player.direction.changed) {
						player.direction.horizontal = '';
					}

					player.direction.vertical = direction;
					player.direction.changed = true;
				}
			},
			changeState: function(state) {
				if (player.state != state) {
					player.stateChanged = true;
					player.state = state;
				}
			},
			sprite: game.add.isoSprite(128,128, 0, 'assets', 0, isoGroup)
		};
		player.sprite.scale.set(0.25, 0.25);

		for (var i in directions) {
			if (directions.hasOwnProperty(i)) {
				player.sprite.animations.add('idle-' + directions[i], ['warrior/idle/' + directions[i] + '/00'], 1, true);
				player.sprite.animations.add('walk-' + directions[i], Phaser.Animation.generateFrameNames('warrior/walk/' + directions[i] + '/', 0, 14, 2), 5, true);
				player.sprite.animations.add('attack01-' + directions[i], Phaser.Animation.generateFrameNames('warrior/attack01/' + directions[i] + '/', 0, 14, 2), 5, true);
				player.sprite.animations.add('attack02-' + directions[i], Phaser.Animation.generateFrameNames('warrior/attack02/' + directions[i] + '/', 0, 14, 2), 5, true);
				player.sprite.animations.add('death-' + directions[i], Phaser.Animation.generateFrameNames('warrior/death/' + directions[i] + '/', 0, 14, 2), 5, true);
			}
		}
		player.sprite.animations.play(player.state + '-down');

		player.sprite.anchor.set = 0.5;
		game.physics.isoArcade.enable(player.sprite);
		player.sprite.body.collideWorldBounds = true;
	},

	update: function() {
		var speed = 100;
		if (this.cursors.up.isDown) {
			player.sprite.body.velocity.y = -speed;
			player.changeVerticalDirection('up');
		} else if (this.cursors.down.isDown) {
			player.sprite.body.velocity.y = speed;
			player.changeVerticalDirection('down');
		} else {
			player.sprite.body.velocity.y = 0;
		}

		if (this.cursors.left.isDown) {
			player.sprite.body.velocity.x = -speed;
			player.changeHorizontalDirection('left');
		} else if (this.cursors.right.isDown) {
			player.sprite.body.velocity.x = speed;
			player.changeHorizontalDirection('right');
		} else {
			player.sprite.body.velocity.x = 0;
		}

		if (player.sprite.body.velocity.y == 0 && player.sprite.body.velocity.x == 0) {
			player.changeState('idle');
		} else {
			player.changeState('walk');
		}

		if (player.direction.changed || player.stateChanged) {
			player.sprite.animations.play(player.state + '-' + player.direction.vertical + player.direction.horizontal);
			player.direction.changed = false;
			player.stateChanged = false;
		}

		game.physics.isoArcade.collide(isoGroup);
		game.iso.topologicalSort(isoGroup);
	},

	render: function() {
		game.debug.text(game.time.fps || '--', 2, 14, '#a7aebe');
	}
};

game.state.add('Boot', WebtudorGame.Boot);
game.state.start('Boot');
