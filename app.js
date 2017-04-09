const renderData = (function () {
	let allData
	let offset

	const COUNT = 100
	const hasMore = _ => offset < allData.length
	const template = document.querySelector('#template').innerHTML
	Mustache.parse(template)

	function render(isAppend) {
		const fragment = document.createDocumentFragment()
		const ul = document.createElement('ul')

		ul.innerHTML = Mustache.render(template, {
			results: allData.slice(offset, offset + COUNT)
		})

		while (ul.hasChildNodes()) {
			fragment.appendChild(ul.firstChild)
		}

		if (!isAppend) {
			document.querySelector('#results').innerHTML = ''
		}

		document.querySelector('#results').appendChild(fragment)
	}

	return data => {
		const isAppend = !data
		if (!isAppend) [offset, allData] = [0, data]

		if (isAppend && !hasMore()) return false

		render(isAppend)
		offset += COUNT

		return hasMore()
	}
}())

function renderApp(data) {
	const hasMore = renderData(data)
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

function init() {
	let blankRecords = Array(100).fill('')
	document.body.classList.add('loading')
	renderApp(blankRecords)

	get('http://vinylwhere.s3-ap-southeast-1.amazonaws.com/records.grouped.json.gz')
		.then(JSON.parse)
		.then(records => {
			if (window.location.hash) {
				const query = window.location.hash.substring(1)
				document.querySelector('#search').value = query
				const queryRegexp = new RegExp(query, 'i')
				renderApp(records.filter(r =>
					r.artist.match(queryRegexp) || r.album.match(queryRegexp)))
			} else {
				renderApp(records)
			}
			document.body.classList.remove('loading')
			return records
		})
		.then(records => {
			let lastQuery = ''

			window.addEventListener('hashchange', _ => {
				const query = location.hash.substring(1)
				if (query === lastQuery) return

				document.querySelector('input').value = query
				lastQuery = query

				if (!query) return renderApp(records)

				const queryRegexp = new RegExp(query, 'i')

				renderApp(records.filter(r =>
					r.artist.match(queryRegexp) || r.album.match(queryRegexp)))
			})
		})
		.then(records => {
			const handler = _ => {
				window.location.hash = document.querySelector('input').value
			}
			const throttledHandler = throttle(handler, 200)

			document.querySelector('#search').addEventListener('keyup', throttledHandler)
		})
		.then(_ => {
			document.querySelector('#search').disabled = false
		})
}

document.body.addEventListener('keypress', event => {
	if (String.fromCharCode(event.keyCode) === '/' && event.target.tagName !== 'INPUT') {
		document.querySelector('#search').focus()
		document.querySelector('#search').select()
		event.preventDefault()
	}
})

document.addEventListener('scroll', throttle(_ => {
	if (window.innerHeight + window.scrollY < document.body.scrollHeight - 500) return
	renderApp()
}, 50))
