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

function randomEngine (position){
	let chess = new Chess(position);
	print(chess.fen());
	print(position);

	let moves = chess.moves();
	var index = Math.floor(
		Math.random() * moves.length,
	);

	return moves[index];
}

function evalPosition (position){
	let chess = new Chess(position);
	let fen = chess.fen();
	let turn = chess.turn() == 'b' ? -1 : 1;

	if (chess.game_over()) {
		if (chess.in_checkmate()) {
			return turn * Infinity;
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
	print(pos.match(/[A-Z]/g));
}

function minimaxEngine (position){
	let chess = new Chess(position);
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
	window.setTimeout(() => {
		game.move(randomEngine(game.fen()));
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
