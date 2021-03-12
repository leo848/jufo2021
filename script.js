var board = null; // starte mit einem leeren Brett
var game = new Chess(); // in diesem Objekt wird das Schachspiel behandelt
var gespeicherterZug = null; // das hier speichert den Zug, der gespielt wird
var gewuenschteTiefe = 2; // die Tiefe+1, die verwendet wird
var print = console.log; // für einfachere Ausgaben
var pfadbeginn = null; // Pfad zum richtigen Zug
var aktuelleSpielauswertung = 0; // aktuelle Bewertung des Bretts
var hintergrundDrehung = 0;
var spiel = [];

var $board = $('#board');
var squareClass = 'square-55d63';
var squareToHighlight = null;
var colorToHighlight = null; // dafür, dass der Zug des Computers markiert wird

var reducedAnimations = false; // Animationen deaktivieren
var showLegalMoves = true; // legale Züge anzeigen
var betterSpeed = true; // schnellere Geschwindigkeit (für Geräte mit schlechter Leistung nicht empfohlen)
var shuffleMoves = true; // Züge werden für mehr Varianten durchgemischt
var showLastMove = true; // zeige den letzten Zug des Computers
var tapToMove = false;

$('#btn_remis').click(proposeDraw);
$('#btn_resign').click(proposeResign);
// beim Klicken auf die einzelnen Knöpfe Remis anbieten bzw. aufgeben

$('#options_container').hover(
	// Einstellungen zeigen und ausblenden.
	() => {
		$('#options').removeAttr('hidden');
		$('#options').css('opacity', '0');
		$('#options').css('opacity', '1');
	},
	() => {
		setTimeout(() => {
			$('#options:not(:hover)').css(
				'opacity',
				0,
			);
			setTimeout(() => {
				$('#options:not(:hover)').attr(
					'hidden',
					'hidden',
				);
			}, 2930);
		}, 930);
	},
);

$('#cbx_redanim').click(() => {
	// Einstellung: Animationen reduzieren
	reducedAnimations = !reducedAnimations;
	if (!reducedAnimations) {
		$(
			'#option_container,#bar,ul#options',
		).css('transition', '2s');
		$('button,select').css(
			'transition',
			'.93s',
		);
		$('#board *').css('transition', '.5s');
	} else {
		$(
			'#option_container,#bar,ul#options',
		).css('transition', 'none');
		$('button,select').css(
			'transition',
			'none',
		);
		$('#board *').css('transition', 'none');
	}
});
$('#cbx_showlegals').click(() => {
	// Einstellung: legale Züge anzeigen
	showLegalMoves = !showLegalMoves;
	removeGreySquares();

	if (showLegalMoves) {
		greySquare = function (square, self){
			var $square = $(
				'#board .square-' + square,
			);

			var background = whiteSquareGrey;
			if ($square.hasClass('black-3c85d')) {
				background = blackSquareGrey;
			}

			$square.css('background', background);
			if (!self) {
				$square.css(
					'transform',
					'scale(0.5)',
				);
			}
		};
	} else {
		greySquare = function (){};
	}
});
$('#cbx_btspeed').click(() => {
	// Einstellung: bessere Geschwindigkeit
	betterSpeed = !betterSpeed;
});
$('#cbx_shuffle').click(() => {
	// Einstellung: Züge mischen
	shuffleMoves = !shuffleMoves;
});
$('#cbx_slastm').click(() => {
	// Einstellung: letzten Zug des PCs zeigen
	showLastMove = !showLastMove;
	if (showLastMove) {
		$('.highlight-black').css(
			'box-shadow',
			'inset 0 0 3px 3px white',
		);
	} else {
		$('.highlight-black').css(
			'box-shadow',
			'none',
		);
	}
});
$('#cbx_taptm').click(()=>{
	tapToMove = !tapToMove;
	
})
setInterval(() => {
	if (!reducedAnimations) {
		$(document.body).css(
			'background',
			`linear-gradient(${hintergrundDrehung %
				360}deg,#707070,#070717)`,
		);
		hintergrundDrehung++;
	}
}, 200);

function shuffleArray (array){
	// Funktion, um alle Elemente in einem Array zufällig zu vertauschen.
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(
			Math.random() * (i + 1),
		);
		[ array[i], array[j] ] = [
			array[j],
			array[i],
		];
	}
	return array;
}

function download (filename, text){
	var element = document.createElement('a');
	element.setAttribute(
		'href',
		'data:text/plain;charset=utf-8,' +
			encodeURIComponent(text),
	);
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function onDragStart (
	source,
	piece,
	position,
	orientation,
){
	// wenn ein Zug anfängt, dann...
	if (game.game_over()) return false; // keinen Zug spielen, wenn das Spiel vorbei ist
	if (piece.search(/^b/) !== -1) return false; // nur mit den weißen Figuren spielen
}

function proposeDraw (){
	// Funktion dafür, Remis anzubieten.
	Swal.fire({
		title              :
			'Möchtest Du Remis anbieten?',
		text               :
			'Falls das Remis angenommen wird, kannst du diese Partie nicht wiederherstellen.',
		icon               : 'question',
		showCancelButton   : true,
		confirmButtonColor : '#3085d6',
		cancelButtonColor  : '#d33',
		confirmButtonText  : 'Ja',
		cancelButtonText   : 'Nein',
	}).then((result) => {
		if (result.isConfirmed) {
			if (aktuelleSpielauswertung < -0.2) {
				draw();
			} else {
				Swal.fire({
					icon  : 'info',
					title : 'Nicht akzeptiert',
					text  :
						'Dein Remisangebot wurde abgelehnt.',
				});
			}
		}
	});
}

function draw (){
	Swal.fire({
		icon  : 'warning',
		title : '1/2-1/2',
		text  : 'Es ist ein Unentschieden. :|',
	}).then((result) => {
		newGame(1);
	});
}

function proposeResign (){
	// Partie aufgeben
	Swal.fire({
		title              :
			'Möchtest Du aufgeben?',
		text               :
			'Aufgeben muss immer die letzte Option sein.',
		icon               : 'question',
		showCancelButton   : true,
		confirmButtonColor : '#3085d6',
		cancelButtonColor  : '#d33',
		confirmButtonText  : 'Ja',
		cancelButtonText   : 'Nein',
	}).then((result) => {
		if (result.isConfirmed) {
			Swal.fire({
				icon  : 'error',
				title : '0-1',
				text  :
					'Du hast leider verloren. :(',
			});
			newGame(0);
		}
	});
}

function newGame (rresult){
	Swal.fire({
		title              : 'Speichern?',
		text               :
			'Du kannst dieses Spiel herunterladen und speichern.',
		icon               : 'question',
		showCancelButton   : true,
		confirmButtonColor : '#3085d6',
		cancelButtonColor  : '#d33',
		confirmButtonText  : 'Ja',
		cancelButtonText   : 'Nein',
	}).then((result) => {
		if (result.isConfirmed) {
			for (
				let i = 0;
				i < spiel.length;
				i += 2
			) {
				spiel[i] =
					(i + 2) / 2 +
					'. ' +
					spiel[i] +
					' ';
				if (spiel[i] !== undefined) {
					spiel[i + 1] =
						spiel[i + 1] + '\n';
				}
			}
			print(spiel);
			d = new Date();
			jointpgn =
				`\
			[White "Nutzer"]
			[Black "MinimaxBot Stufe ${gewuenschteTiefe}"]
			[Result "${RESULTS[rresult]}"]
			[Variant "Standard"]
			[Date "${d.getUTCFullYear()}.${(d.getUTCMonth() +
					1).toString().length == 1
					? '0' + (d.getUTCMonth() + 1)
					: d.getUTCMonth() + 1}"]
			[Time "${d.toUTCString().split(' ')[4]}"]
			` + spiel.join('');

			print(jointpgn);
			download('game.pgn', jointpgn);
			spiel = [];
			game = new Chess();
			board.position(game.fen());
			// board = Chessboard('board', config);
		} else {
			spiel = [];
			game = new Chess();
			board.position(game.fen());
			// board = Chessboard('board', config);
		}
	});
}

function changePlayer (fen){
	// Wechsle den Spieler.
	parts = fen.split(' ');
	player = parts[1];
	if (player == 'w') {
		return (
			parts[0] +
			' ' +
			'b' +
			' ' +
			parts[2] +
			' ' +
			parts[3] +
			' ' +
			parts[4] +
			' ' +
			parts[5]
		);
	} else {
		return (
			parts[0] +
			' ' +
			'w' +
			' ' +
			parts[2] +
			' ' +
			parts[3] +
			' ' +
			parts[4] +
			' ' +
			parts[5]
		);
	}
}

function evalPosition (position, spieler){
	// Evaluiere eine Stellung und gib den berechneten Wert wieder.
	let chess = new Chess(position);
	let fen = chess.fen();

	let eval = 0; // Anfangswert ist 0

	if (chess.game_over()) { // wenn das Spiel vorbei ist, dann...
		if (chess.in_checkmate()) { // wenn es Schachmatt ist,
			return spieler * 10000; // gib den Gewinn für diesen Spieler aus
		}
		if (
			chess.in_draw() || // bei Remis oder Patt,
			chess.in_stalemate()
		) {
			return 0; // gib 0 als Remiswert zurück
		}
	}

	pos = fen.split(' ')[0]; // Position wird aufgeteilt
	pcs = pos.match(/[a-zA-Z]/g); // Figuren werden geladen

	for (let i = 0; i < pcs.length; i++) { // Für jede Figur:
		eval += PIECE_VALUES[pcs[i]]; // Der Wert wird berechnet und addiert
		eval = Number(eval.toFixed(2)); // und der Floating-Point-Fehler (0.1 + 0.2 == 0.30000000000000004)
	}
	return eval; // am Ende wird die Summe 
}

function max (tiefe){
	//Maximiert die aktuelle Stellung mithilfe einer Tiefe.
	if (tiefe == 0 || game.moves().length == 0) {
		//Wenn die Tiefe null ist oder keine Züge möglich sind, gib die aktuelle Stellung zurück.
		if (tiefe == gewuenschteTiefe) {
			try {
				gespeicherterZug = zuege[i];
			} catch (e) {}
		}
		return evalPosition(game.fen(), -1);
	}
	var maxWert = -Infinity;
	var zuege = shuffleMoves
		? shuffleArray(game.moves())
		: game.moves();
	for (let i = 0; i < zuege.length; i++) {
		// sonst wird für jeden Zug ausgeführt:
		game.move(zuege[i]); // ziehe den Zug
		var wert = min(tiefe - 1); // berechne den Wert dessen mit der min-Funktoon
		game.undo(); // nehme den Zug zurück
		if (wert >= maxWert) {
			//wenn der Zug besser als der bisher beste war:
			if (tiefe == gewuenschteTiefe) {
				// speichere den Zug, falls die Tiefe so gewünscht ist
				gespeicherterZug = zuege[i];
			}
			maxWert = wert; // stelle die beste Bewertung auf die aktuelle
		}
	}
	return maxWert; //gib die beste Bewertung zurück
}

function min (tiefe){
	// im Prinzip genau gleich wie die max-Funktion, nur mit Minimierung statt Maximierung
	if (tiefe == 0 || game.moves().length == 0) {
		return evalPosition(game.fen(), 1);
	}
	var minWert = Infinity;
	var zuege = shuffleMoves
		? shuffleArray(game.moves())
		: game.moves();
	for (let i = 0; i < zuege.length; i++) {
		game.move(zuege[i]);
		var wert = max(tiefe - 1);
		game.undo();
		if (wert <= minWert) {
			minWert = wert;
		}
	}
	return minWert;
}

function onDrop (source, target){
	removeGreySquares();
	// Diese Funktion wird ausgeführt, wenn eine Figur abgelegt wird.
	var move = game.move({
		// Speichere einen Zug
		from      : source,
		to        : target,
		promotion : $(
			'#drpd_figure option:selected',
		).val(),
	});
	if (move === null) return 'snapback';
	// Wenn der Zug ungültig ist,nehme ihn zurück
	spiel.push(move.san);
	// speichere den Zug für das spätere Herunterladen

	if (game.game_over()) {
		if (game.in_checkmate()) {
			Swal.fire({
				icon  : 'success',
				title : '1-0 👍',
				text  : 'Du hast gewonnen. :)',
			}).then((result) => {
				newGame(2);
			});
			//Wenn der Nutzer gewonnen hat, zeige ihm dies.
		}
		if (game.in_draw()) {
			Swal.fire({
				icon  : 'warning',
				title : '1/2-1/2 👌',
				text  :
					'Es ist ein Unentschieden. :|',
			}).then((result) => {
				newGame(1);
			});
			//Wenn es ein Unentschieden (z.B. durch Patt) ist, zeige dem Nutzer dies.
		}
	}
	pfad = '';
	$('#title').html('Computer denkt nach...');
	$('#favicon').prop(
		'href',
		'https://lichess1.org/assets/_MGIaHK/piece/merida/bP.svg',
	);

	bewertung = max(gewuenschteTiefe); // bewerte die aktuelle Stellung
	aktuelleSpielauswertung = bewertung;
	print('Zug: ' + gespeicherterZug); // gib aus, welcher Zug gespielt wird
	print('Am Zug:' + game.turn()); //gib aus, wer dran ist
	if (gespeicherterZug == null) {
		// wenn kein Zug verfügbar ist:
		print('Kein gültiger Zug'); // gib dies aus
	} else {
		let zug = game.move(gespeicherterZug);

		if (zug !== null) {
			$board
				.find('.' + squareClass)
				.removeClass('highlight-black');
			$board
				.find('.square-' + zug.from)
				.addClass('highlight-black');
			squareToHighlight = zug.to;
			colorToHighlight = 'black';

			spiel.push(zug.san);
			$('#title').html('Du bist am Zug!');
			$('#favicon').prop(
				'href',
				'https://lichess1.org/assets/_MGIaHK/piece/merida/wP.svg',
			);
		}
		if (game.game_over()) {
			print("lol", game.turn())
			if (game.in_checkmate()) {
				if (game.turn() == "w"){
				Swal.fire({
					icon  : 'error',
					title : '0-1 👎',
					text  :
						'Du hast leider verloren. :(',
				}).then(() => {
					newGame(0);
				});} else {
					Swal.fire({
					icon  : 'success',
					title : '1-0 👍',
					text  :
						'Du hast gewonnen! :)',
				}).then(() => {
					newGame(0);
				});
				}
			}
			if (game.in_stalemate()) {
				Swal.fire({
					icon  : 'warning',
					title : '1/2-1/2 👌',
					text  :
						'Es ist ein Unentschieden. :|',
				}).then((result) => {
					newGame(1);
				});
			}
		} // spiele den Zug
	}
	$('#bar').css(
		// zeige den aktuellen Spielstand in einer Leiste über dem Brett
		'width',
		(-aktuelleSpielauswertung + 10) /
			20 *
			100 +
			'%',
	);
}

function onSnapEnd (){
	board.position(game.fen());
}

function removeGreySquares (){
	$('#board .square-55d63').css(
		'background',
		'',
	);
	$('#board .square-55d63').css(
		'transform',
		'none',
	);
}

function greySquare (square, self){
	var $square = $('#board .square-' + square);

	var background = whiteSquareGrey;
	if ($square.hasClass('black-3c85d')) {
		background = blackSquareGrey;
	}

	$square.css('background', background);
	if (!self) {
		$square.css('transform', 'scale(0.5)');
	}
}

function onMouseoverSquare (square, piece){
	var moves = game.moves({
		square  : square,
		verbose : true,
	});
	if (moves.length === 0) return;

	greySquare(square, true);

	for (var i = 0; i < moves.length; i++) {
		greySquare(moves[i].to, false);
	}
}

function onMouseoutSquare (square, piece){
	removeGreySquares();
}

function onMoveEnd (){
	$board
		.find('.square-' + squareToHighlight)
		.addClass(
			'highlight-' + colorToHighlight,
		);
}

var config = {
	draggable         : true,
	position          : 'start',
	onDragStart       : onDragStart,
	onDrop            : onDrop,
	onMouseoutSquare  : onMouseoutSquare,
	onMouseoverSquare : onMouseoverSquare,
	onSnapEnd         : onSnapEnd,
	onMoveEnd         : onMoveEnd,
	moveSpeed         : 'slow',
};
board = Chessboard('board', config);

setInterval(board.position(game.fen()), 500); // aktualisiere das Brett jede halbe Sekunde
