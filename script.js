var board = null; // starte mit einem leeren Brett
var game = new Chess(); // in diesem Objekt wird das Schachspiel behandelt
var savedMove = null; // das hier speichert den Zug, der gespielt wird
var gewuenschteTiefe = 2; // die Tiefe+1, die verwendet wird
var print = console.log; // für einfachere Ausgaben
var pathStart = null; // Pfad zum richtigen Zug
var currentEvaluation = 0; // aktuelle Bewertung des Bretts
var backgroundRotation = 0;
var gameStack = [];
var redoStack = [];

var $board = $('#board');
var boardElem = document.getElementById('board');
var boardAnimCounter = 0;
var currentlyInTransition = false;
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

$('#btn_undo').click(undoLastMove);
$('#btn_redo').click(redoLastMove);
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
			$('#options:not(:hover)').css('opacity', 0);
			setTimeout(() => {
				$('#options:not(:hover)').attr('hidden', 'hidden');
			}, 2930);
		}, 930);
	},
);

$('#cbx_redanim').click(() => {
	// Einstellung: Animationen reduzieren
	reducedAnimations = !reducedAnimations;
	if (!reducedAnimations) {
		$('#option_container,#bar,ul#options').css('transition', '2s');
		$('button,select').css('transition', '.93s');
		$('#board *').css('transition', '.5s');
	} else {
		$('#option_container,#bar,ul#options').css('transition', '.01s');
		$('button,select').css('transition', '.01s');
		$('#board *').css('transition', '.01s');
	}
});
$('#cbx_showlegals').click(() => {
	// Einstellung: legale Züge anzeigen
	showLegalMoves = !showLegalMoves;
	removeGreySquares();

	if (showLegalMoves) {
		greySquare = function (square, self){
			var $square = $('#board .square-' + square);

			var background = whiteSquareGrey;
			if ($square.hasClass('black-3c85d')) {
				background = blackSquareGrey;
			}

			$square.css('background', background);
			if (!self) {
				$square.css('transform', 'scale(0.5)');
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
		$('.highlight-black').css('box-shadow', 'inset 0 0 3px 3px white');
	} else {
		$('.highlight-black').css('box-shadow', 'none');
	}
});
$('#cbx_taptm').click(() => {
	tapToMove = !tapToMove;
});
setInterval(() => {
	if (!reducedAnimations) {
		$(document.body).css(
			'background',
			`linear-gradient(${backgroundRotation % 360}deg,#707070,#070717)`,
		);
		backgroundRotation++;
	}
}, 200);

function onDragStart (source, piece, position, orientation){
	// wenn ein Zug anfängt, dann...
	if (game.game_over()) return false; // keinen Zug spielen, wenn das Spiel vorbei ist
	if (piece.search(/^b/) !== -1) return false; // nur mit den weißen Figuren spielen
	if (currentlyInTransition) return false;
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

function checkEvalPosition (position, spieler){
	// console.time('total');
	// console.time('chess+fen');
	let chess = new Chess(position);
	let fen = chess.fen();

	let positionEvaluation = 0; // Anfangswert ist 0
	// console.timeEnd('chess+fen');

	// console.time('gameOver');

	
		if (chess.in_checkmate())
			return spieler * 10000; // gib den Gewinn für diesen Spieler aus
		
		else if (
			chess.in_draw()
		) return 0
	

	// console.timeEnd('gameOver');

	// console.time('rest');

	pos = fen.split(' ')[0]; // Position wird aufgeteilt
	pcs = pos.match(/[a-zA-Z]/g); // Figuren werden geladen

	for (let i = 0; i < pcs.length; i++) {
		// Für jede Figur:
		positionEvaluation += PIECE_VALUES[pcs[i]]; // Der Wert wird berechnet und addiert
		positionEvaluation = Number(positionEvaluation.toFixed(2)); // und der Floating-Point-Fehler (0.1 + 0.2 == 0.30000000000000004)
	}

	// console.timeEnd('rest');
	// console.timeEnd('total');
	return positionEvaluation;
}

function evalPosition (position, spieler){
	// Evaluiere eine Stellung und gib den berechneten Wert wieder.
	let chess = new Chess(position);
	let fen = chess.fen();

	let positionEvaluation = 0; // Anfangswert ist 0

	if (chess.game_over()) {
		// wenn das Spiel vorbei ist, dann...
		if (chess.in_checkmate()) {
			// wenn es Schachmatt ist,
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

	for (let i = 0; i < pcs.length; i++) {
		// Für jede Figur:
		positionEvaluation += PIECE_VALUES[pcs[i]]; // Der Wert wird berechnet und addiert
	}
	return Number(positionEvaluation.toFixed(2)); // am Ende wird die Summe
}

function max (tiefe){
	//Maximiert die aktuelle Stellung mithilfe einer Tiefe.
	if (tiefe == 0 || game.moves().length == 0) {
		//Wenn die Tiefe null ist oder keine Züge möglich sind, gib die aktuelle Stellung zurück.
		if (tiefe == gewuenschteTiefe) {
			try {
				savedMove = zuege[i];
			} catch (e) {}
		}
		return evalPosition(game.fen(), -1);
	}
	var maxWert = -Infinity;
	var zuege = shuffleMoves ? shuffleArray(game.moves()) : game.moves();
	for (let i = 0; i < zuege.length; i++) {
		// sonst wird für jeden Zug ausgeführt:
		game.move(zuege[i]); // ziehe den Zug
		var wert = min(tiefe - 1); // berechne den Wert dessen mit der min-Funktoon
		game.undo(); // nehme den Zug zurück
		if (wert >= maxWert) {
			//wenn der Zug besser als der bisher beste war:
			if (tiefe == gewuenschteTiefe) {
				// speichere den Zug, falls die Tiefe so gewünscht ist
				savedMove = zuege[i];
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
	var zuege = shuffleMoves ? shuffleArray(game.moves()) : game.moves();
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
		promotion : $('#drpd_figure option:selected').val(),
	});
	if (move === null) return 'snapback';
	// Wenn der Zug ungültig ist,nehme ihn zurück

	$board.find('.square-' + move.to).on('transitionend', () => {
		currentlyInTransition = true;

		$board.find('.square-' + move.to).off('transitionend');
		gameStack.push(move.san);
		// speichere den Zug für das spätere Herunterladen

		if (game.game_over()) {
			currentlyInTransition = false;
			triggerGameAlert(game);
			return;
			//Wenn es ein Unentschieden (z.B. durch Patt) ist, zeige dem Nutzer dies.
		}

		pfad = '';
		$('#title').html('Computer denkt nach...');
		$('#favicon').prop(
			'href',
			'https://lichess1.org/assets/_MGIaHK/piece/merida/bP.svg',
		);

		console.time('Zugzeit');

		bewertung = max(gewuenschteTiefe); // bewerte die aktuelle Stellung
		console.timeEnd('Zugzeit');
		currentEvaluation = bewertung;
		//print('Zug: ' + savedMove); // gib aus, welcher Zug gespielt wird
		//print('Am Zug:' + game.turn()); //gib aus, wer dran ist
		if (savedMove == null) {
			// wenn kein Zug verfügbar ist:
			print('Kein gültiger Zug'); // gib dies aus
		} else {
			let zug = game.move(savedMove);

			if (zug !== null) {
				$board.find('.' + squareClass).removeClass('highlight-black');
				$board.find('.square-' + zug.from).addClass('highlight-black');
				squareToHighlight = zug.to;
				colorToHighlight = 'black';

				gameStack.push(zug.san);
				$('#title').html('Du bist am Zug!');
				$('#favicon').prop(
					'href',
					'https://lichess1.org/assets/_MGIaHK/piece/merida/wP.svg',
				);
			}
			if (game.game_over()) {
				triggerGameAlert(game);
			} // spiele den Zug
		}
		$('#bar').css(
			// zeige den aktuellen Spielstand in einer Leiste über dem Brett
			'width',
			(-currentEvaluation + 10) / 20 * 100 + '%',
		);
		board.position(game.fen());
		currentlyInTransition = false;
	});
}

function onSnapEnd (){
	board.position(game.fen());
}

function removeGreySquares (){
	$('#board .square-55d63').css('background', '');
	$('#board .square-55d63').css('transform', 'none');
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
		.addClass('highlight-' + colorToHighlight);
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
