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

function renderApp(recordsData) {
	recordsData.then(renderData)
}

const records = get('http://vinylwhere.s3-ap-southeast-1.amazonaws.com/records.grouped.json.gz')
	.then(JSON.parse)

const blankRecords = new Promise(resolve => resolve(Array(100).fill('')))

function init() {
	document.body.classList.add('loading')
	renderApp(blankRecords)

	records.then(_ => document.body.classList.remove('loading'))

	records.then(records => {
		if (window.location.hash) {
			const query = router.currentRoute()
			document.querySelector('#search').value = query
			const queryRegexp = new RegExp(query, 'i')
			renderApp(new Promise(resolve => resolve(records.filter(r =>
				r.artist.match(queryRegexp) || r.album.match(queryRegexp)))))
		} else {
			renderApp(new Promise(resolve => resolve(records)))
		}
	})

	records.then(_ => {
		let lastQuery = ''

		router.onRouteChange(_ => {
			const query = router.currentRoute()
			if (query === lastQuery) return

			document.querySelector('input').value = query
			lastQuery = query

			if (!query) return renderApp(records)

			const queryRegexp = new RegExp(query, 'i')

			renderApp(records.then(records => records.filter(r =>
				r.artist.match(queryRegexp) || r.album.match(queryRegexp))))
		})
	})

	records.then(_ => search.addHandlers().enable().focus())
}

document.addEventListener('scroll', throttle(_ => {
	if (window.innerHeight + window.scrollY < document.body.scrollHeight - 500) return
	renderApp(Promise.resolve())
}, 50))
