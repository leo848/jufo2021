function triggerWinAlert(){
	Swal.fire({
					icon  : 'success',
					title : '1-0 👍',
					text  :
						'Du hast gewonnen! :)',
				}).then(() => {
					newGame(0);
				});
}
function triggerDrawAlert(){
	Swal.fire({
					icon  : 'warning',
					title : '1/2-1/2 👌',
					text  :
						'Es ist ein Unentschieden. :|',
				}).then((result) => {
					newGame(1);
				});
}
function triggerLoseAlert() {
	Swal.fire({
					icon  : 'error',
					title : '0-1 👎',
					text  :
						'Du hast leider verloren. :(',
				}).then(() => {
					newGame(0);
				});
}

function triggerGameAlert(game) {
	let result;
	if (!game.game_over()) return
	if (game.in_checkmate()) {
		result = game.turn == "w" ? "1-0" : "0-1"
	} else if (game.in_draw()) {
		result = "1/2-1/2"
	}
	if (result == "1-0") {
		triggerWinAlert();
	}
	if (result == "1/2-1/2") {
		triggerDrawAlert();
		
	}
	if (result == "0-1") {
		triggerLoseAlert();
		
	}
}