chrome.runtime.onInstalled.addListener(async () => {
	const currentState = (await chrome.storage.local.get('enabled')).enabled;
	if (currentState === undefined) {
		chrome.storage.local.set({'enabled': true});
	}
});

chrome.action.onClicked.addListener(async tab => {
	const currentState = (await chrome.storage.local.get('enabled')).enabled;
	const newState = !currentState;
	await chrome.storage.local.set({'enabled': newState});
	chrome.action.setIcon({
		path: newState ? "icon.png":"icon_disabled.png"
	});
});