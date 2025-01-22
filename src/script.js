// press enter to submit
let questionDivs = document.querySelectorAll('div[wa-qa]');
let success = true;
for (let questionDiv of questionDivs) {
	let button;
	try {
		button = questionDiv.getElementsByClassName('qUtility')[0]
			.getElementsByClassName('qButtons')[0]
			.getElementsByClassName('submitSaveStandard')[0]
			.getElementsByClassName('primarySolidUnifiedButton')[0];
	}
	catch {
		success = false;
		break;
	}
	let submitScript =  button.getAttribute('onclick');
	
	let fieldSpans = questionDiv.getElementsByClassName('qTextField')
	
	for (let fieldSpan of fieldSpans) {
		inputField = fieldSpan.getElementsByTagName('input')[0];
		inputField.setAttribute('onkeypress','if (event.keyCode == 13) {' + JSON.stringify(submitScript.substring(0,submitScript.indexOf('return false'))).slice(1,-1) + '}');
	}
}
if (success ) {
	console.log("Input fields updated");
}
else {
	console.log("Failed to update input fields")
}

// preview answers
function displayPreview(inputField) {
	let box = inputField;
    let questionId = inputField.getAttribute('name');
    let container = document.getElementById(`${questionId}_container`);
    if (!box.value) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        return;
    }
    if (container.innerHTML == '') {
        container.innerHTML = 'Loading';
    }

	// webassign's parsing
	var boxVal = escape(box.value);
	while (boxVal.indexOf('+') > -1) {
		var idx = boxVal.indexOf('+');
		var boxValLength = boxVal.length;
		var bplus = boxVal.substring(0,idx);
		var aplus = boxVal.substring(idx + 1,boxValLength);
		boxVal = bplus + '%2B' + aplus;
	}

	// display preview
	let img = document.createElement('img');
    img.onload = () => {
        container.appendChild(img);
        while (container.firstChild != img) {
            container.removeChild(container.firstChild);
        }
    };
    img.src = `/cgi-perl/symimage.cgi?size=4&expr=${boxVal}`;
}

let url = "https://www.webassign.net/v4cgi/extra/symbolicPreviewer.html"
let previewButtons = document.querySelectorAll('a.smPreview');
for (let previewButton of previewButtons) {
	let inputField = previewButton.previousElementSibling.getElementsByTagName('input')[0];
	if (!inputField) {
		continue;
	}
	if (!inputField.value) {
		continue;
	}
    let questionId = inputField.getAttribute('name');
	
	// add container
    let previewContainer = document.createElement('div');
    previewContainer.setAttribute('id',`${questionId}_container`);
    document.querySelector(`input[value="${questionId.toUpperCase()}"]`)
		.insertAdjacentElement('beforebegin',previewContainer);
    let br = document.createElement('br');
    let br2 = document.createElement('br');
    previewContainer.insertAdjacentElement('beforebegin',br);
    previewContainer.insertAdjacentElement('beforebegin',br2);

	// bind live update event
	inputField.setAttribute('onkeyup','displayPreview(this)');
	displayPreview(inputField);
}