function triggerWinAlert (){
	Swal.fire({
		icon  : 'success',
		title : '1-0 👍',
		text  : 'Du hast gewonnen! :)',
	}).then(() => {
		newGame(0);
	});
}
function triggerDrawAlert (){
	Swal.fire({
		icon  : 'warning',
		title : '1/2-1/2 👌',
		text  : 'Es ist ein Unentschieden. :|',
	}).then((result) => {
		newGame(1);
	});
}
function triggerLoseAlert (){
	Swal.fire({
		icon  : 'error',
		title : '0-1 👎',
		text  : 'Du hast leider verloren. :(',
	}).then(() => {
		newGame(0);
	});
}

function triggerGameAlert (game){
	print(game.turn());
	let result;
	if (!game.game_over()) return;
	if (game.in_checkmate()) {
		result = game.turn() == 'b' ? '1-0' : '0-1';
	} else if (game.in_draw()) {
		result = '1/2-1/2';
	}
	if (result == '1-0') {
		triggerWinAlert();
	}
	if (result == '1/2-1/2') {
		triggerDrawAlert();
	}
	if (result == '0-1') {
		triggerLoseAlert();
	}
}

async function promptText (promptStart, placeholder = 'Type something...'){
	let result = await Swal.fire({
		title            : promptStart,
		input            : 'text',
		inputPlaceholder : placeholder,
	});
	return result;
}

function download (filename, text){
	var element = document.createElement('a');
	element.setAttribute(
		'href',
		'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
	);
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}
