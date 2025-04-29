chrome.storage.onChanged.addListener((changes,area) => {
	if (area == 'local' && changes.enabled) {
		window.dispatchEvent(new CustomEvent('extension-toggle',{
			detail: changes.enabled.newValue
		}));
	}
});

chrome.storage.local.get('enabled',({enabled}) => {
	window.dispatchEvent(new CustomEvent('extension-enable',{
		detail: Boolean(enabled)
	}));
});