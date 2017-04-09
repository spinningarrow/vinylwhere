const router = {
	currentRoute() {
		return window.location.hash.substring(1)
	},

	route(newRoute) {
		window.location.hash = newRoute
	},

	onRouteChange(fn) {
		window.addEventListener('hashchange', fn)
	}
}

