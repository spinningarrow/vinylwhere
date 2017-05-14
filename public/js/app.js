const records = get('http://vinylwhere.s3-ap-southeast-1.amazonaws.com/records.grouped.json.gz')
	.then(JSON.parse)
const blankRecords = new Promise(resolve => resolve(Array(100).fill('')))

function init() {
	document.body.classList.add('loading')
	blankRecords.then(resultsComponent.render)
	records.then(_ => document.body.classList.remove('loading'))

	records.then(records => {
		if (window.location.hash) {
			const query = router.currentRoute()
			document.querySelector('#search').value = query
			const queryRegexp = new RegExp(query, 'i')
			const filteredResult = records.filter(r =>
				r.artist.match(queryRegexp) || r.album.match(queryRegexp))

			resultsComponent.render(filteredResult)
		} else {
			resultsComponent.render(records)
		}
	})

	records.then(_ => {
		let lastQuery = ''

		router.onRouteChange(_ => {
			const query = router.currentRoute()
			if (query === lastQuery) return

			document.querySelector('#search').value =
				document.querySelector('#search').value || query

			lastQuery = query

			if (!query) return records.then(resultsComponent.render)

			const queryRegexp = new RegExp(query, 'i')

			records
				.then(records =>
					records.filter(r =>
						r.artist.match(queryRegexp) || r.album.match(queryRegexp)))
				.then(resultsComponent.render)
		})
	})

	records.then(_ => searchComponent.addHandlers().enable().focus())

	records.then(_=> resultsComponent.addHandlers())
}
