fetch('/records.grouped.json.gz')
	.then(response => response.json())
	.then(records => {
		renderData(records)
		return records
	})
	.then(records => {
		const handler = _ => {
			const query = document.querySelector('input').value
			if (!query) return renderData(records)

			const queryRegexp = new RegExp(query, 'i')
			renderData(records.filter(r =>
					r.artist.match(queryRegexp) || r.album.match(queryRegexp)))
		}
		const throttledHandler = throttle(handler, 200)

		document.querySelector('input').addEventListener('keyup', throttledHandler)
	})

function renderData(data) {
	const template = document.querySelector('#template').innerHTML
	Mustache.parse(template)
	document.querySelector('#output').innerHTML = Mustache.render(template, {results: data})
}

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
