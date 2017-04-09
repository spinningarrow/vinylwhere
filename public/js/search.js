const Search = searchElement => ({
	handleSearch: throttle(event => {
		router.route(event.target.value)
	}, 200),

	handleActivation(event) {
		if (String.fromCharCode(event.keyCode) === '/' &&
			event.target.tagName !== 'INPUT') {

			this.focus()
			event.preventDefault()
		}
	},

	addHandlers() {
		searchElement.addEventListener('keyup', this.handleSearch)
		document.body.addEventListener('keypress', this.handleActivation.bind(this))

		return this
	},

	enable() {
		searchElement.disabled = false
		return this
	},

	focus() {
		searchElement.focus()
		return this
	}
})
