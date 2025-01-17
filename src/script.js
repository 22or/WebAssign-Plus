let questionDivs = document.querySelectorAll('div[wa-qa]');
for (questionDiv of questionDivs) {
	let button = questionDiv.getElementsByClassName('qUtility')[0]
		.getElementsByClassName('qButtons')[0]
		.getElementsByClassName('submitSaveStandard')[0]
		.getElementsByClassName('primarySolidUnifiedButton')[0];
	let submitScript =  button.getAttribute('onclick');
	
	let fieldSpans = questionDiv.getElementsByClassName('qTextField')
	
	for (let fieldSpan of fieldSpans) {
		inputField = fieldSpan.getElementsByTagName('input')[0];
		inputField.setAttribute('onkeypress','if (event.keyCode == 13) {' + JSON.stringify(submitScript.substring(0,submitScript.indexOf('return false'))).slice(1,-1) + '}');
	}
}
console.log("WebAssign fields updated");