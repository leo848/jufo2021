// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null;
var game = new Chess();
var gespeicherterZug = null;
var gewuenschteTiefe = 2;
var print = console.log;
var pfadbeginn = null;
var aktuelleSpielauswertung = 0;

function shuffleArray (array){
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

function changePlayer (fen){
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
	let chess = new Chess(position);
	let fen = chess.fen();
	//let turn = chess.turn() == 'b' ? -1 : 1;

	let eval = 0;

	if (chess.game_over()) {
		if (chess.in_checkmate()) {
			return spieler * Infinity;
		}
		if (
			chess.in_draw() ||
			chess.in_stalemate()
		) {
			return 0;
		}
		return 'What just happened?';
	}

	pos = fen.split(' ')[0];
	pcs = pos.match(/[a-zA-Z]/g);

	for (let i = 0; i < pcs.length; i++) {
		eval += PIECE_VALUES[pcs[i]];
		eval = Number(eval.toFixed(2));
	}
	return eval;
}

function max (tiefe){
	if (tiefe == 0 || game.moves().length == 0) {
		return evalPosition(game.fen(), -1);
	}
	var maxWert = -Infinity;
	var zuege = shuffleArray(game.moves());
	for (let i = 0; i < zuege.length; i++) {
		//print("MAX(Tiefe="+tiefe+",i="+i + ","  + game.turn() + ")");
		game.move(zuege[i]);
		var wert = min(tiefe - 1);
		game.undo();
		if (wert > maxWert) {
			if (tiefe == gewuenschteTiefe) {
				gespeicherterZug = zuege[i];
			}
			maxWert = wert;
		}
	}
	return maxWert;
}

function min (tiefe){
	if (tiefe == 0 || game.moves().length == 0) {
		return evalPosition(game.fen(), -1);
	}
	var minWert = Infinity;
	var zuege = game.moves();
	for (let i = 0; i < zuege.length; i++) {
		//print("MIN(Tiefe="+tiefe+",i="+i + ","  + game.turn() + ")");
		game.move(zuege[i]);
		var wert = max(tiefe - 1);
		game.undo();
		if (wert < minWert) {
			minWert = wert;
		}
	}
	return minWert;
}

function onDrop (source, target){
	// see if the move is legal
	var move = game.move({
		from      : source,
		to        : target,
		promotion : 'q', // NOTE: always promote to a queen for example simplicity
	});
	// illegal move
	if (move === null) return 'snapback';

	if (game.game_over()) {
		alert('Du hast gewonnen!');
	}
	pfad = '';
	window.setTimeout(() => {
		bewertung = max(gewuenschteTiefe);
		aktuelleSpielauswertung = bewertung;
		print('Zug: ' + gespeicherterZug);
		print('Am Zug:' + game.turn());
		if (gespeicherterZug == null) {
			print('Kein gültiger Zug');
		} else {
			game.move(gespeicherterZug);
		}
	}, 0);
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd (){
	board.position(game.fen());
}

var config = {
	draggable   : true,
	position    : 'start',
	onDragStart : onDragStart,
	onDrop      : onDrop,
	onSnapEnd   : onSnapEnd,
};
board = Chessboard('board', config);
