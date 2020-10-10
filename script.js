// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null;
var game = new Chess();
var print = console.log;

function onDragStart (
	source,
	piece,
	position,
	orientation,
){
	// do not pick up pieces if the game is over
	if (game.game_over()) return false;

	// only pick up pieces for White
	if (piece.search(/^b/) !== -1) return false;
}

function makeRandomMove (){
	var possibleMoves = game.moves();

	// game over
	if (possibleMoves.length === 0) return;

	var randomIdx = Math.floor(
		Math.random() * possibleMoves.length,
	);
	game.move(possibleMoves[randomIdx]);
	board.position(game.fen());
}

function engine (position){
	let chess = new Chess(position);
	print(chess.fen());
	print(position);

	let moves = chess.moves();
	print(moves);
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

	console.log(game.pgn());

	// make random legal move for black
	window.setTimeout(makeRandomMove, 250);
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
