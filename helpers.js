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
