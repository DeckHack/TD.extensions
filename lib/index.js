/* global TD */
var TD = {};
TD.extensions = {};
TD.extensions._list = [];
TD.extensions._init = [];

export default {

	/**
	 * Adds an extension to the global extension list
	 *
	 * @param {object} extension TD.extension object
	 * @param {boolean} enable enable extension right after addition
	 * @param {boolean} init initialize extension right after addition
	 */
	add: function(extension, enable, init) {
		if (this.getExtension(extension.name) === undefined) {
			TD.extensions._list.push(extension);

			try {
				this.reorderExtensions();
			} catch (exception) {
				// Silent catch, most likely so because a dependency we require is not here yet
			}

			if (enable) {
				this.enable(extension.name, init);
			}
		}
	},

	/**
	 * Removes an extension from the global extension list
	 * Also disables and destroys it in the progress (if not already done)
	 *
	 * @param {string} extensionName name of the extension to be removed
	 */
	remove: function (extensionName) {
		let extension = this.getExtension(extensionName);
		let extensionIndex = TD.extensions._list.indexOf(extension);

		this.disable(extensionName);

		TD.extensions._list.splice(extensionIndex, 1);

		this.reorderExtensions();
	},

	/**
	 * Get an extension object returned by name
	 *
	 * @param {string} extensionName name of the extension to get
	 */
	getExtension: function (extensionName) {
		return TD.extensions._list.filter((extension) => extension.name === extensionName)[0];
	},

	/**
	 * Returns the names of all extensions in the global extension list
	 *
	 * @returns {array}
	 */
	getAll: function () {
		return TD.extensions._list.map((extension) => extension.name);
	},

	/**
	 * Returns the names of all extensions currently enabled from localStorage
	 *
	 * @returns {array}
	 */
	getAllEnabled: function () {
		let enabled = JSON.parse(window.localStorage.getItem('TD.extensions.enabled'));

		if (enabled === null) {
			window.localStorage.setItem('TD.extensions.enabled', JSON.stringify([]));

			return [];
		} else {
			return enabled;
		}
	},

	/**
	 * Returns the names of all extensions currently initialized
	 *
	 * @returns {array}
	 */
	getAllInitialized: function () {
		return TD.extensions._init;
	},

	/**
	 * Enables an extension, so it will be run the next time .init() is executed
	 * or the `init` parameter is passed
	 *
	 * Rules so that an extension will be enabled:
	 * - it isn't already enabled
	 * - the dependencies it requires are already enabled
	 * - it has no conflicts with currently enabled extensions
	 *
	 * @param {string} extensionName name of the extension to be enabled
	 * @param {boolean} init initialize the extension right after enabling
	 */
	enable: function (extensionName, init) {
		let enabledExtensions = this.getAllEnabled();
		let extension = this.getExtension(extensionName);

		if (
			!this.isEnabled(extension.name) &&
			this.checkDependencies(extension.name) &&
			this.checkConflicts(extension.name)
		) {
			enabledExtensions.push(extensionName);

			enabledExtensions = this.reorderEnabledExtensions(enabledExtensions);

			window.localStorage.setItem('TD.extensions.enabled', JSON.stringify(enabledExtensions));
		}

		if (init) {
			this.initializeExtension(extension.name);
		}
	},

	/**
	 * Disables an extension and all extensions that depend on it
	 *
	 * @param {string} extensionName name of the extension to be disabled
	 */
	disable: function (extensionName) {
		let enabledExtensions = this.getAllEnabled();

		if (this.isEnabled(extensionName)) {
			let extensionIndex = enabledExtensions.indexOf(extensionName);
			enabledExtensions.splice(extensionIndex, 1);

			enabledExtensions = this.reorderEnabledExtensions(enabledExtensions);

			window.localStorage.setItem('TD.extensions.enabled', JSON.stringify(enabledExtensions));

			enabledExtensions.forEach((enabledExtension) => {
				this.checkDependencies(enabledExtension);
			});
		}

		if (this.isInitialized(extensionName)) {
			this.destroyExtension(extensionName);
		}
	},

	/**
	 * Initialize all extensions
	 */
	init: function () {
		let enabledExtensions = this.getAllEnabled();

		enabledExtensions.forEach((extension) => {
			this.initializeExtension(extension);
		});
	},

	/**
	 * Checks the dependencies for a given extension
	 *
	 * @param {string} extensionName name of the extension to be checked
	 *
	 * @returns {boolean} true if dependencies could be resolved, false if any dependency is missing
	 */
	checkDependencies: function (extensionName) {
		let extension = this.getExtension(extensionName);

		if (extension.dependencies === undefined) {
			return true;
		}

		let extensionDependencyStatus = extension.dependencies.every((dependency) =>
			this.isEnabled(dependency)
		);

		if (extensionDependencyStatus === false && this.isEnabled(extensionName)) {
			this.disable(extensionName);
			return false;
		} else {
			return extensionDependencyStatus;
		}
	},

	/**
	 * Checks the conflicts of a given extension
	 *
	 * @param {string} extensionName name of the extension to be checked
	 *
	 * @returns {boolean} true if no conflicts exist with enabled extensions, false if there are conflicts
	 */
	checkConflicts: function (extensionName) {
		let extension = this.getExtension(extensionName);

		if (extension.conflicts === undefined) {
			return true;
		}

		let extensionConflictStatus = extension.conflicts.some((conflict) => this.isEnabled(conflict));

		return !extensionConflictStatus;
	},

	/**
	 * Check if given extension is enabled
	 *
	 * @param {string} extensionName name of the extension to be checked
	 *
	 * @returns {boolean} boolean value representing if an extension is enabled
	 */
	isEnabled: function (extensionName) {
		return this.getAllEnabled().includes(extensionName);
	},

	/**
	 * Check if given extension is initialized
	 *
	 * @param {string} extensionName name of the extension to be checked
	 *
	 * @returns {boolean} boolean value representing if an extension is initialized
	 */
	isInitialized: function (extensionName) {
		return this.getAllInitialized().includes(extensionName);
	},

	/**
	 * Resolves the extensions list dependency tree and returns a sorted list of extension names
	 *
	 * @returns {array} sorted array of extension names
	 */
	resolveDependencyGraph: function () {
		let sorted = [];
		let visited = {};

		TD.extensions._list.forEach(function visit(extension, ancestors) {
			if (!Array.isArray(ancestors)) ancestors = [];
			if (extension.name === undefined) return;

			ancestors.push(extension.name);
			visited[extension.name] = true;

			if (extension.dependencies) {
				extension.dependencies.forEach(function (dependency) {
					if (ancestors.indexOf(dependency) >= 0) {
						throw new Error(
							'Circular dependency "' +
							dependency +
							'" is required by "' +
							extension.name +
							'": ' +
							ancestors.join(' -> ')
						);
					}

					if (visited[dependency]) return;
					visit(this.getExtension(dependency), ancestors.slice(0));
				});
			}

			if (sorted.indexOf(extension.name) < 0) sorted.push(extension.name);
		});

		return sorted;
	},

	/**
	 * Initializes the given extension
	 *
	 * @param {string} extensionName name of extension to be initialized
	 */
	initializeExtension: function (extensionName) {
		let extension = this.getExtension(extensionName);

		if (!this.isInitialized(extensionName)) {
			extension.create();
			TD.extensions._init.push(extensionName);
		}
	},

	/**
	 * Destroys the given extension
	 *
	 * @param {string} extensionName name of extension to be destroyed
	 */
	destroyExtension: function (extensionName) {
		let extension = this.getExtension(extensionName);

		if (this.isInitialized(extensionName)) {
			let extensionIndex = TD.extensions._init.indexOf(extensionName);
			extension.destroy();

			TD.extensions._init.splice(extensionIndex, 1);
		}
	},

	/**
	 * Reorders the extension list using the resolved dependency graph
	 */
	reorderExtensions: function () {
		let extensionOrder = this.resolveDependencyGraph();

		TD.extensions._list = extensionOrder.map((extension) => this.getExtension(extension));
	},

	/**
	 * Reorders the enabled extension list using the resolved dependency graph
	 *
	 * @returns the ordered list of enabled extensions
	 */
	reorderEnabledExtensions: function (enabledExtensions) {
		let extensionOrder = this.resolveDependencyGraph();

		return extensionOrder.filter((extension) => enabledExtensions.includes(extension));
	},
};