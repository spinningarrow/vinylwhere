function throttle(fn, minTime) {
	let currentTimer
	let callCount = 0

	return function () {
		if (callCount === 0) {
			fn()
		}

		if (currentTimer) {
			clearTimeout(currentTimer)
		}

		callCount++

		currentTimer = window.setTimeout(_ => {
			if (callCount > 1) {
				fn()
			}
			currentTimer = null
			callCount = 0
		}, minTime)
	}
}

// Damn you, Safari ;_;
function get(url, method) {
	return new Promise((resolve, reject) => {
		const httpRequest = new XMLHttpRequest()
		httpRequest.onreadystatechange = _ => {
			if (httpRequest.readyState === XMLHttpRequest.DONE) {
				if (httpRequest.status === 200) {
					resolve(httpRequest.responseText)
				} else {
					reject(httpRequest)
				}
			}
		}
		httpRequest.open(method || 'GET', url)
		httpRequest.send()
	})
}
