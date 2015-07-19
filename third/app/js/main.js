var audioPlayer = {

	globals: {
		// An array for all the files loaded in the track
		allTracks: [],
		// An array for the current playlist
		playlist: [],
		temporarySearchPlaylist: [],
		// The number of the current track
		i: 0,
		// Array for last played (used when shuffling songs)
		lastPlayed: [],
		timer: 0
	},

	// drag & drop
	dragAndDrop: function() {
		var overlay = $('.overlay'),
			app = this;

		$(document).on('dragover', function(event) {
			event.stopPropagation();
			event.preventDefault();
			overlay.removeClass('hidden');
		});

		overlay.on('dragleave', function(event) {
			event.stopPropagation();
			event.preventDefault();
			overlay.addClass('hidden');
		});

		overlay.on('dragover', function(e) {
			e.stopPropagation();
			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = 'copy';
		});

		// Get file data on drop
		overlay.on('drop', function(e) {
			e.stopPropagation();
			e.preventDefault();
			var files = e.originalEvent.dataTransfer.files;
			for(var j=0; j<files.length; j++){
				if(files[j].type.match(/audio\/(mp3|mpeg)/)){
					app.getMetaData(files[j], function (song) {
						app.globals.allTracks.push(song);
						app.globals.playlist.push(song);
						$('.playList').append($(app.playListHTML(song, app.globals.playlist.length-1)));
						app.controls.updateList(app.globals.playlist.length-1, song);
					});
				}
			}
			if(app.globals.allTracks.length){
				temporarySearchPlaylist = [];
			}
			overlay.addClass('hidden');
		});
	},

	getMetaData: function(file, done) {
		var app = this;
		app.getTags(file,function(result){
			result.audioTrack = file;
			result.playing = false;
			done(result);
			$('.description').css('display', 'none');
		});
	},

	getTags: function(file,done) {
		var app = this,
			result = {};
		ID3.loadTags(file.name, function() {
			var tags = ID3.getAllTags(file.name);
			result.artist = tags.artist || "Unknown Artist";
			result.title = tags.title || "Unknown";
			result.album = tags.album || "";
			if(tags.picture && tags.picture.data && tags.picture.data.length) {
				result.picture = tags.picture;
				app.getImageSource(result.picture, function (imageSource) {
					result.picture = imageSource;
					done(result);
				});
			}
			else {
				result.picture = '../app/img/default.png';
				done(result);
			}

		}, {
			tags: ["artist", "title", "album", "picture"],
			dataReader: FileAPIReader(file)
		});
	},

	getImageSource: function (image, done) {
		var base64String = "";
		for (var j = 0; j < image.data.length; j++) {
			base64String += String.fromCharCode(image.data[j]);
		}
		done("data:" + image.format + ";base64," + window.btoa(base64String));
	},


	readFile: function (file,done) {
		var reader = new FileReader();
		reader.onload = function(data){
			done(data);
		};
		reader.readAsDataURL(file);
	},

	// playlist HTML
	playListHTML: function (song, index) {
		var html = '<li class="track';
		if(song.playing){
			html+= ' active'
		}

		html+='" data-index="'+ index +'">' +
		'<span class="songOverlay"><i class="fa fa-play"></i></span>' +
		'<div class="image">' +
		'<img src="' + song.picture + '"/>' +
		'</div>' +
		'<div class="text">'	+
		'<p class="title">'+song.title+'</p>' +
		'<p class="song">'+song.artist+'</p>'
		'</div>' +
		'</li>';

		return html;
	},

	// current song HTML
	activeSongHtml: function(song) {
		var html = '
		<div class="playerBox">
		<div class="image">
			<img src="' + song.picture + '"/>
		</div>
		<div class="song" id="song">
			<div class="songName">'+ song.artist +' — '+ song.title +'</div>
			<div class="controls">
				<div title="Equalizer"><i class="fa fa-sliders"></i></div>
				<div title="Play"><i class="fa fa-play"></i></div>
				<div title="Stop"><i class="fa fa-stop"></i></div>
			</div>
			<canvas id="wave" width="649" height="150"></canvas>
		</div>
		</div>';
		return html;
	},

	playSong: function(song,index) {
		// stop current object and init new
		this.globals.audio.pause();
		this.globals.audio = new Audio();
		var audio = audioPlayer.globals.audio,
			file = song.audioTrack,
			url = URL.createObjectURL(file);
		audio.src = url;
		audio.controls = true;
		audio.autoplay = true;
		// get html for the song
		$('.songContainer').html(this.activeSongHtml(song));
		audio.play();
		// init its buttons
		this.controls.stopTrack();
		this.controls.playTrack();
		this.controls.showEq();
		// write its index
		this.globals.i = index;
		audio.addEventListener("ended",function() { nextSong(index); } , false);
		document.title = song.artist + ' - ' + song.title;
		this.visualizer(audio,song);
		// play next song
		var nextSong = function() {
			var i = audioPlayer.globals.i,
				newSong = audioPlayer.globals.allTracks;
			if (newSong.length > 1) {
				if (newSong[i+1]) {
					newSong = newSong[i+1];
					i++;
				} else {
					newSong = newSong[0];
					i = 0;
				}
				audioPlayer.playSong(newSong,i);
			}
		}
	},

	visualizer: function(audio, song) {
		var canvas, ctx, source,
			analyser, fbc_array, bars, bar_x,
			bar_width, bar_height,
			context = this.globals.context;

		function initPlayer() {
			analyser = context.createAnalyser();
			canvas = document.getElementById('wave');
			ctx = canvas.getContext('2d');
			// Re-route audio playback into the processing graph of the AudioContext
			source = context.createMediaElementSource(audio);
			audioPlayer.globals.sourceNode = source;
			source.connect(analyser);
			analyser.connect(context.destination);
			frameLooper();
		}

		initPlayer();
		this.eq.initEq();
		this.eq.reset();
		function frameLooper() {
			// gradient
			var gradient = ctx.createLinearGradient(0,0,0,300);
			gradient.addColorStop(1,'#ff7c00');
			gradient.addColorStop(0.75,'#c15b1a');
			gradient.addColorStop(0.25,'#71303b');
			gradient.addColorStop(0,'#fe7c00');

			window.requestAnimationFrame(frameLooper);
			fbc_array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(fbc_array);
			ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
			// clear the current state
			ctx.clearRect(0, 0, 1000, 325);
			// set the fill style
			ctx.fillStyle = gradient;
			bars = 230;
			for (var i = 0; i < bars; i++) {
				bar_x = i * 3;
				bar_width = 2;
				bar_height = -(fbc_array[i] / 2);
				ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
			}
		}
	},

	eq: {
		initEq: function () {
			var context = audioPlayer.globals.context;
			var source = audioPlayer.globals.sourceNode;
			var gainDb = -40.0;
			var bandSplit = [360,3600];

			var hBand = context.createBiquadFilter();
			hBand.type = "lowshelf";
			hBand.frequency.value = bandSplit[0];
			hBand.gain.value = gainDb;

			var hInvert = context.createGain();
			hInvert.gain.value = -1.0;

			var mBand = context.createGain();

			var lBand = context.createBiquadFilter();
			lBand.type = "highshelf";
			lBand.frequency.value = bandSplit[1];
			lBand.gain.value = gainDb;

			var lInvert = context.createGain();
			lInvert.gain.value = -1.0;

			source.connect(lBand);
			source.connect(mBand);
			source.connect(hBand);

			hBand.connect(hInvert);
			lBand.connect(lInvert);

			hInvert.connect(mBand);
			lInvert.connect(mBand);

			audioPlayer.globals.lGain = context.createGain();
			audioPlayer.globals.mGain = context.createGain();
			audioPlayer.globals.hGain = context.createGain();

			lBand.connect(audioPlayer.globals.lGain);
			mBand.connect(audioPlayer.globals.mGain);
			hBand.connect(audioPlayer.globals.hGain);

			var sum = context.createGain();
			audioPlayer.globals.lGain.connect(sum);
			audioPlayer.globals.mGain.connect(sum);
			audioPlayer.globals.hGain.connect(sum);
			sum.connect(context.destination);
		},
		update: function(string,type) {
			var value = parseFloat(string) / 100.0;
			switch(type) {
				case 'lowGain': audioPlayer.globals.lGain.gain.value = value; break;
				case 'midGain': audioPlayer.globals.mGain.gain.value = value; break;
				case 'highGain': audioPlayer.globals.hGain.gain.value = value; break;
			}
		},
		reset: function() {
			$('.controls input[type="range"]').val(50);
			audioPlayer.globals.lGain.gain.value = .50;
			audioPlayer.globals.mGain.gain.value = .50;
			audioPlayer.globals.hGain.gain.value = .50;
		},
		presets: function(preset) {
			var rock = ['60','50','60'],
				pop = ['70','45','65'],
				jazz = ['50','65','65'],
				classical = ['70','45','65'],
				pop = ['70','45','55'],
				normal = ['50','50','50'],
				low = ['0','0','0'],
				top = ['100','100','100'],
				elements = [$('.lgain'),$('.mgain'),$('.hgain')],
				vars = [
					audioPlayer.globals.lGain.gain,
					audioPlayer.globals.mGain.gain,
					audioPlayer.globals.hGain.gain
				];
			function loopHelper(type) {
				for (var i = 0; i < type.length; i++) {
					elements[i].val(type[i]);
					var float = parseFloat(type[i]) / 100.0;
					vars[i].value = float;
				}
			}
			switch(preset) {
				case 'rock':
					loopHelper(rock);
				break;
				case 'pop':
					loopHelper(pop);
				break;
				case 'jazz':
					loopHelper(jazz);
				break;
				case 'classical':
					loopHelper(classical);
				break;
				case 'normal':
					loopHelper(normal);
				break;
				case 'lowest':
					loopHelper(low);
				break;
				case 'highest':
					loopHelper(top);
				break;
			}
		}
	},

	// init controls
	controls: {
		updateList: function(index, song) {
			$("[data-index='" + index + "']").click(function() {
				var el = $(this);
				if (!song.playing) {
					audioPlayer.playSong(song,index);
				}
			});
		},
		stopTrack: function() {
			$(".fa-stop").click(function() {
				audioPlayer.globals.audio.pause();
				audioPlayer.globals.audio.currentTime = 0;
			});
		},
		playTrack: function() {
			$(".playerBox .fa-play").click(function() {
				audioPlayer.globals.audio.play();
			});
		},
		showEq: function() {
			$(".playerBox .fa-sliders").click(function() {
				var eq = $('.eq');
				if (!eq.hasClass('active')) {
					eq.addClass('active');
				} else {
					eq.removeClass('active');
				}
			});
		}
	},

	init: function() {
		this.dragAndDrop();
		this.globals.audio = new Audio();
		this.globals.context = new AudioContext();
	}
}

audioPlayer.init();
