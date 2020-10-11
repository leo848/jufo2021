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

	let eval = 0;

	if (chess.game_over()) {
		if (chess.in_checkmate()) {
			return -turn * Infinity;
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

function minimaxEngine (position, depth){
	let chess = new Chess(position);
	let turn = chess.turn() == 'b' ? -1 : 1;
	let maximizer =
		chess.turn() == 'b' ? false : true;
	let moves = chess.moves();

	if (chess.in_draw()) {
		return [ 'DRAW', 0 ];
	}

	if (chess.in_checkmate()) {
		return [ 'MATE', -turn * Infinity ];
	}

	eval = -Infinity;

	scores = [];
	if (depth >= 1) {
		for (let i = 0; i < moves.length; i++) {
			chess.move(moves[i]);
			scores.push(
				minimaxEngine(
					chess.fen(),
					depth - 1,
				),
			);

			chess.undo();

			for (
				let i = 0;
				i < scores.length;
				i++
			) {
				if (
					(maximizer &&
						scores[i][1] ==
							Infinity) ||
					(!maximizer &&
						scores[i][1] == -Infinity)
				) {
					return [
						scores[i][0],
						scores[i][1],
					];
				}
			}
		}
		let bestMove;
		let eval = maximizer
			? -Infinity
			: Infinity;
		for (let i = 0; i < scores.length; i++) {
			if (
				(scores[i][1] > eval &&
					maximizer) ||
				(scores[i][1] < eval &&
					!maximizer)
			) {
				eval = scores[i][1];
				bestMove = scores[i][0];
			}
		}
		print(bestMove, eval);
		return [ bestMove, eval ];
	} else {
		for (let i = 0; i < moves.length; i++) {
			chess.move(moves[i]);
			scores.push([
				moves[i],
				evalPosition(chess.fen()),
			]);

			chess.undo();

			for (
				let i = 0;
				i < scores.length;
				i++
			) {
				if (
					(maximizer &&
						scores[i][1] ==
							Infinity) ||
					(!maximizer &&
						scores[i][1] == -Infinity)
				) {
					break;
				}
			}

			// if (
			// 	(maximizer &&
			// 		Math.max(...scores) ==
			// 			Infinity) ||
			// 	(!maximizer &&
			// 		Math.min(...scores) ==
			// 			-Infinity)
			// ) {
			// 	break;
			// }
		}
		bestMove = 0;
		eval = -100;

		for (let i = 0; i < scores.length; i++) {
			if (
				(scores[i][1] > eval &&
					maximizer) ||
				(scores[i][1] < eval &&
					!maximizer)
			) {
				eval = scores[i][1];
				bestMove = scores[i][0];
			}
		}

		return [ bestMove, eval ];
	}
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
		game.move(
			minimaxEngine(game.fen(), 2)[0],
		);
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
