window.addEventListener('extension-enable',e => {
	const isEnabled = e.detail;
	if (!isEnabled) {
		console.log('Webassign Plus is not enabled');
		return;
	}
	console.log('Webassign Plus is enabled');

	const htmlElem = document.getElementsByTagName('html')[0];

	// DOM dependent stuff
	window.onload = () => {
		focusNextQuestion();
		setUpEnterKeySubmit();
		setUpAnswerPreviews();
	};

	// pre window load

	// instant scroll
	htmlElem.style.scrollBehavior = 'auto';
	HTMLElement.prototype.scrollIntoView = () => {
		console.debug('Scroll blocked');
	};

	// focus setup
	const originalFocus = HTMLElement.prototype.focus;
	HTMLElement.prototype.focus = () => {
		console.debug('Focus blocked');
	};
	function focus(elem) {
		HTMLElement.prototype.focus = originalFocus;
		try {
			elem.focus();
		}
		catch (e) {
			console.log('focus failed. perhaps questions are unanswerable?');
			return;
		}
		if (elem.tagName == 'INPUT' && elem.type == 'text') {
			const val = elem.value;
			elem.value = '';
			elem.value = val;
		}
		HTMLElement.prototype.focus = () => {};
	}

	function focusNextQuestion() {
		const url = window.location.href;
		const i = url.indexOf('#');
		let questionDiv;
		if (i == -1) {
			return;
		}
		let inputFields;
		try {
			const id = url.substring(i + 1);
			if (id.charAt(0) == 'Q' && !isNaN(Number(id.substring(1)))) {
				questionDiv = document.getElementById(id).nextElementSibling;
			}
			else {
				questionDiv = document.querySelector(`div[wa-qa="${id}_container"]`);
			}
			inputFields = questionDiv.querySelectorAll('input[type="text"]');
		}
		catch {
			console.log('Failed to focus question; this is not necessarily a problem');
			return;
		}

		let focused = false;
		for (const inputField of inputFields) {
			const mark = document.getElementById(`${inputField.name}_mark`);
			if (!mark || mark.classList.contains('mIncorrect')) {
				focus(inputField);
				focused = true;
				break;
			}
		}
		if (!focused) { // question is complete; move on to next
			let questionNumber = parseInt(questionDiv.getAttribute('data-view-position'));
			const newQuestionDiv = document.querySelector(`div[data-view-position="${questionNumber + 1}"]`);
			focus(newQuestionDiv.querySelector('input[type="text"]'));
		}
		else {
			console.log('Question focused');
		}
	}

	function setUpEnterKeySubmit() {
		const questionDivs = document.querySelectorAll('div[wa-qa]');
		let success = true;
		for (const questionDiv of questionDivs) {
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
			const submitScript =  button.getAttribute('onclick');
			
			const fieldSpans = questionDiv.getElementsByClassName('qTextField');
			for (const fieldSpan of fieldSpans) {
				inputField = fieldSpan.getElementsByTagName('input')[0];
				inputField.setAttribute('onkeypress','if (event.keyCode == 13) {' + JSON.stringify(submitScript.substring(0,submitScript.indexOf('return false'))).slice(1,-1) + '}');
			}
		}
		if (success ) {
			console.log("Input fields updated");
		}
		else {
			console.log("Failed to update input fields; questions not submittable?")
		}
	}

	function setUpAnswerPreviews() {
		const previewButtons = document.querySelectorAll('a.smPreview');
		for (const previewButton of previewButtons) {
			const inputField = previewButton.previousElementSibling.getElementsByTagName('input')[0];
			if (!inputField) {
				continue;
			}
			const questionId = inputField.getAttribute('name');
			
			// add container
			const previewContainer = document.createElement('div');
			previewContainer.setAttribute('id',`${questionId}_container`);
			document.querySelector(`input[value="${questionId.toUpperCase()}"]`)
				.insertAdjacentElement('beforebegin',previewContainer);
			const br = document.createElement('br');
			const br2 = document.createElement('br');
			previewContainer.insertAdjacentElement('beforebegin',br);
			previewContainer.insertAdjacentElement('beforebegin',br2);

			// bind live update event
			inputField.onkeyup = () => {
				displayPreview(inputField);
			};
			displayPreview(inputField);
		}
	}

	function displayPreview (inputField) {
		const box = inputField;
		const questionId = inputField.getAttribute('name');
		const container = document.getElementById(`${questionId}_container`);
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
		const img = document.createElement('img');
		img.onload = () => {
			container.appendChild(img);
			while (container.firstChild != img) {
				container.removeChild(container.firstChild);
			}
		};
		img.src = `/cgi-perl/symimage.cgi?size=4&expr=${boxVal}`;
	}
});

window.addEventListener('extension-toggle',e => {
	window.location.reload();
});