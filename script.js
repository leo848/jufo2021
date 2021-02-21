var board = null; // starte mit einem leeren Brett
var game = new Chess(); // in diesem Objekt wird das Schachspiel behandelt
var gespeicherterZug = null; // das hier speichert den Zug, der gespielt wird
var gewuenschteTiefe = 2; // die Tiefe+1, die verwendet wird
var print = console.log; // für einfachere Ausgaben
var pfadbeginn = null; // Pfad zum richtigen Zug
var aktuelleSpielauswertung = 0; // aktuelle Bewertung des Bretts

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
	if (aktuelleSpielauswertung > -0.3) {
	}
}

function draw (){}

function newGame (){}

function draw (){}

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
	//Maximiert die aktuelle Stellung mithilfe einer Tiefe.
	if (tiefe == 0 || game.moves().length == 0) {
		//Wenn die Tiefe null ist oder keine Züge möglich sind, gib die aktuelle Stellung zurück.
		if (tiefe == gewuenschteTiefe) {
			gespeicherterZug = zuege[i];
		}
		return evalPosition(game.fen(), -1);
	}
	var maxWert = -Infinity;
	var zuege = shuffleArray(game.moves());
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
	var zuege = game.moves();
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
	// Diese Funktion wird ausgeführt, wenn eine Figur abgelegt wird.
	var move = game.move({
		// Speichere einen Zug
		from      : source,
		to        : target,
		promotion : 'q',
	});
	if (move === null) return 'snapback';
	// Wenn der Zug ungültig ist,nehme ihn zurück

	if (game.game_over()) {
		if (game.in_checkmate()) {
			Swal.fire({
				icon  : 'success',
				title : '1-0',
				text  : 'Du hast gewonnen. :D',
			});
			//Wenn der Nutzer gewonnen hat, zeige ihm dies.
		}
		if (game.in_draw()) {
			Swal.fire({
				icon  : 'warning',
				title : '1/2-1/2',
				text  :
					'Es ist ein Unentschieden. :|',
			});
			//Wenn es ein Unentschieden (z.B. durch Patt) ist, zeige dem Nutzer dies.
		}
	}
	pfad = '';
	window.setTimeout(() => {
		$('#title').html(
			'Computer denkt nach...',
		);
		bewertung = max(gewuenschteTiefe); // bewerte die aktuelle Stellung
		aktuelleSpielauswertung = bewertung;
		print('Zug: ' + gespeicherterZug); // gib aus, welcher Zug gespielt wird
		print('Am Zug:' + game.turn()); //gib aus, wer dran ist
		if (gespeicherterZug == null) {
			// wenn kein Zug verfügbar ist:
			print('Kein gültiger Zug'); // gib dies aus
		} else {
			game.move(gespeicherterZug);
			$('#title').html('Du bist dran!');
			if (game.game_over()) {
				if (game.in_checkmate()) {
					Swal.fire({
						icon  : 'error',
						title : '0-1',
						text  :
							'Du hast leider verloren. :(',
					});
				}
				if (game.in_stalemate()) {
					Swal.fire({
						icon  : 'warning',
						title : '1/2-1/2',
						text  :
							'Es ist ein Unentschieden. :|',
					});
				}
			} // spiele den Zug
		}
		$('#bar').css(
			// zeige den aktuellen Spielstand in einer Leiste über dem Brett
			'width',
			-(
				aktuelleSpielauswertung * 10 +
				100
			) + 200,
		);
	}, 10);
}

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

setInterval(board.position(game.fen()), 500); // aktualisiere das Brett jede halbe Sekunde
