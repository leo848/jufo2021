function triggerWinAlert (){
	Swal.fire({
		icon  : 'success',
		title : '1-0 👍',
		text  : 'Du hast gewonnen! :)',
	}).then(() => {
		newGame(0);
	});
} // Löse den Alert für ein Gewinn aus.

function triggerDrawAlert (){
	Swal.fire({
		icon  : 'warning',
		title : '1/2-1/2 👌',
		text  : 'Es ist ein Unentschieden. :|',
	}).then((result) => {
		newGame(1);
	});
} // Löse den Alert für ein Unentschieden aus.

function triggerLoseAlert (){
	Swal.fire({
		icon  : 'error',
		title : '0-1 👎',
		text  : 'Du hast leider verloren. :(',
	}).then(() => {
		newGame(0);
	});
} // Löse den Alert für einen Verlust aus.

function triggerPGNReaderAlert (pgnContent){
	let game = new Chess();
	game.load_pgn(pgnContent);
	print(game.history());
	Swal.fire({
		title             : 'Möchtest du diese PGN-Datei öffnen?',
		text              : `${game.history().length}`,
		showDenyButton    : true,
		confirmButtonText : `Öffnen`,
		denyButtonText    : `Verwerfen`,
	});
} // Löse den Alert dafür aus, eine PGN-Datei zu öffnen.

function triggerGameAlert (game){
	result = determineResult(game);

	if (result == '1-0') {
		triggerWinAlert();
	}
	if (result == '1/2-1/2') {
		triggerDrawAlert();
	}
	if (result == '0-1') {
		triggerLoseAlert();
	}
} // Entscheidungsfunktion, die einen Alert für ein Spiel auslöst.

function determineResult (game){
	let result;
	if (!game.game_over()) return '?-?';
	if (game.in_checkmate()) {
		result = game.turn() == 'b' ? '1-0' : '0-1';
	} else if (game.in_draw()) {
		result = '1/2-1/2';
	}
	return result;
}

async function promptText (promptStart, placeholder = 'Type something...'){
	let result = await Swal.fire({
		title            : promptStart,
		input            : 'text',
		inputPlaceholder : placeholder,
	});
	return result;
} // Frage den Nutzer nach einem Text und gebe ihn zurück.

function download (filename, content){
	var element = document.createElement('a');
	element.setAttribute(
		'href',
		'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
	);
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
} // Lade eine Datei mit dem Dateinamen filename und dem Inhalt content herunter.

document.getElementById('pgn_input').addEventListener('change', getFile);

function getFile (event){
	const input = event.target;
	if ('files' in input && input.files.length > 0) {
		placeFileContent(input.files[0]);
	}
}

function placeFileContent (file){
	readFileContent(file)
		.then((content) => {
			//target.value = content;
			triggerPGNReaderAlert(content);
		})
		.catch((error) => console.log(error));
}

function readFileContent (file){
	const reader = new FileReader();
	return new Promise((resolve, reject) => {
		reader.onload = (event) => resolve(event.target.result);
		reader.onerror = (error) => reject(error);
		reader.readAsText(file);
	});
}

function pgnSplit (pgn){
	let split = pgn.split(' ');
}


function proposeDraw (){
	// Funktion dafür, Remis anzubieten.
	Swal.fire({
		title              : 'Möchtest Du Remis anbieten?',
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
			if (currentEvaluation < -0.2) {
				draw();
			} else {
				Swal.fire({
					icon  : 'info',
					title : 'Nicht akzeptiert',
					text  : 'Dein Remisangebot wurde abgelehnt.',
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
		title              : 'Möchtest Du aufgeben?',
		text               : 'Aufgeben muss immer die letzte Option sein.',
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
				text  : 'Du hast leider verloren. :(',
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
			for (let i = 0; i < gameStack.length; i += 2) {
				gameStack[i] = (i + 2) / 2 + '. ' + gameStack[i] + ' ';
				if (
					gameStack[i] !== undefined &&
					gameStack[i + 1] !== undefined
				) {
					gameStack[i + 1] = gameStack[i + 1] + '\n';
				}
			}
			print(gameStack);
			d = new Date();
			jointpgn =
				`\
[White "Nutzer"]
[Black "MinimaxBot Stufe ${gewuenschteTiefe}"]
[Result "${RESULTS[rresult]}"]
[Variant "Standard"]
[Date "${d.getUTCFullYear()}.${(d.getUTCMonth() + 1).toString().length == 1
					? '0' + (d.getUTCMonth() + 1)
					: d.getUTCMonth() + 1}"]
[Time "${d.toUTCString().split(' ')[4]}"]
` + gameStack.join('');

			print(jointpgn);
			promptText('Enter your game file name', 'game').then((res) => {
				fileName =
					(res.value.replace(/\.pgn/gi, '') || 'game') + '.pgn';
				download(fileName, jointpgn);
				gameStack = [];
				game = new Chess();
				board.position(game.fen());
			});

			// board = Chessboard('board', config);
		} else {
			gameStack = [];
			game = new Chess();
			board.position(game.fen());
			// board = Chessboard('board', config);
		}
	});
}