fetch('http://vinylwhere.s3-ap-southeast-1.amazonaws.com/records.grouped.json')
	.then(response => response.json())
	.then(records => {
		renderData(records)
		return records
	})
	.then(records => {
		let lastQuery = ''
		const handler = _ => {
			const query = document.querySelector('input').value
			if (query === lastQuery) return

			lastQuery = query

			if (!query) return renderData(records)

			const queryRegexp = new RegExp(query, 'i')
			renderData(records.filter(r =>
					r.artist.match(queryRegexp) || r.album.match(queryRegexp)))
		}
		const throttledHandler = throttle(handler, 200)

		document.querySelector('#search').addEventListener('keyup', throttledHandler)
	})
	.then(_ => {
		document.querySelector('#search').disabled = false
	})

const renderData = (function () {
	let allData = []
	let offset = 0
	const COUNT = 100
	const template = document.querySelector('#template').innerHTML
	Mustache.parse(template)

	return function (data) {
		const isAppend = !data
		const hasMore = offset < allData.length

		if (isAppend && !hasMore) return

		if (!isAppend) {
			offset = 0
			allData = data
		}

		const fragment = document.createDocumentFragment()
		const ul = document.createElement('ul')

		ul.innerHTML = Mustache.render(template, {
			results: allData.slice(offset, offset + COUNT)
		})

		offset += COUNT

		while (ul.hasChildNodes()) {
			fragment.appendChild(ul.firstChild)
		}

		if (!isAppend) {
			document.querySelector('#results').innerHTML = ''
		}

		document.querySelector('#results').appendChild(fragment)

		return hasMore
	}
}())

function loadMore(event) {
	const hasMore = renderData()
	if (!hasMore) event.target.classList.add('hidden')
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
