"use strict";

/* Global TD */
var TD = {};
TD.extensions = {
	_list: [],
	_init: [],

	/**
	 * Adds an extension to the global extension list
	 *
	 * @param {object} extension TD.extension object
	 * @param {boolean} enable enable extension right after addition
	 * @param {boolean} init initialize extension right after addition
	 */
	add:(extension, enable, init) => {
		if (TD.extensions.getExtension(extension.name) === undefined) {
			TD.extensions._list.push(extension);

			try {
				TD.extensions.reorderExtensions();
			} catch (exception) {
				// Silent catch, most likely so because a dependency we require is not here yet
			}

			if (enable) {
				TD.extensions.enable(extension.name, init);
			}
		}
	},

	/**
	 * Removes an extension from the global extension list
	 * Also disables and destroys it in the progress (if not already done)
	 *
	 * @param {string} extensionName name of the extension to be removed
	 */
	remove: (extensionName) => {
		let extension = TD.extensions.getExtension(extensionName);
		let extensionIndex = TD.extensions._list.indexOf(extension);

		TD.extensions.disable(extensionName);

		TD.extensions._list.splice(extensionIndex, 1);

		TD.extensions.reorderExtensions();
	},

	/**
	 * Get an extension object returned by name
	 *
	 * @param {string} extensionName name of the extension to get
	 */
	getExtension: (extensionName) => {
		return TD.extensions._list.filter((extension) => extension.name === extensionName)[0];
	},

	/**
	 * Returns the names of all extensions in the global extension list
	 *
	 * @returns {array}
	 */
	getAll: () => {
		return TD.extensions._list.map((extension) => extension.name);
	},

	/**
	 * Returns the names of all extensions currently enabled from localStorage
	 *
	 * @returns {array}
	 */
	getAllEnabled: () => {
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
	getAllInitialized: () => {
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
	enable: (extensionName, init) => {
		let enabledExtensions = TD.extensions.getAllEnabled();
		let extension = TD.extensions.getExtension(extensionName);

		if (
			!TD.extensions.isEnabled(extension.name) &&
			TD.extensions.checkDependencies(extension.name) &&
			TD.extensions.checkConflicts(extension.name)
		) {
			enabledExtensions.push(extensionName);

			enabledExtensions = TD.extensions.reorderEnabledExtensions(enabledExtensions);

			window.localStorage.setItem('TD.extensions.enabled', JSON.stringify(enabledExtensions));
		}

		if (init) {
			TD.extensions.initializeExtension(extension.name);
		}
	},

	/**
	 * Disables an extension and all extensions that depend on it
	 *
	 * @param {string} extensionName name of the extension to be disabled
	 */
	disable: (extensionName) => {
		let enabledExtensions = TD.extensions.getAllEnabled();

		if (TD.extensions.isEnabled(extensionName)) {
			let extensionIndex = enabledExtensions.indexOf(extensionName);
			enabledExtensions.splice(extensionIndex, 1);

			enabledExtensions = TD.extensions.reorderEnabledExtensions(enabledExtensions);

			window.localStorage.setItem('TD.extensions.enabled', JSON.stringify(enabledExtensions));

			enabledExtensions.forEach((enabledExtension) => {
				TD.extensions.checkDependencies(enabledExtension);
			});
		}

		if (TD.extensions.isInitialized(extensionName)) {
			TD.extensions.destroyExtension(extensionName);
		}
	},

	/**
	 * Initialize all extensions
	 */
	init: () => {
		let enabledExtensions = TD.extensions.getAllEnabled();

		enabledExtensions.forEach((extension) => {
			TD.extensions.initializeExtension(extension);
		});
	},

	/**
	 * Checks the dependencies for a given extension
	 *
	 * @param {string} extensionName name of the extension to be checked
	 *
	 * @returns {boolean} true if dependencies could be resolved, false if any dependency is missing
	 */
	checkDependencies: (extensionName) => {
		let extension = TD.extensions.getExtension(extensionName);

		if (extension.dependencies === undefined) {
			return true;
		}

		let extensionDependencyStatus = extension.dependencies.every((dependency) =>
			TD.extensions.isEnabled(dependency)
		);

		if (extensionDependencyStatus === false && TD.extensions.isEnabled(extensionName)) {
			TD.extensions.disable(extensionName);
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
	checkConflicts: (extensionName) => {
		let extension = TD.extensions.getExtension(extensionName);

		if (extension.conflicts === undefined) {
			return true;
		}

		let extensionConflictStatus = extension.conflicts.some((conflict) => TD.extensions.isEnabled(conflict));

		return !extensionConflictStatus;
	},

	/**
	 * Check if given extension is enabled
	 *
	 * @param {string} extensionName name of the extension to be checked
	 *
	 * @returns {boolean} boolean value representing if an extension is enabled
	 */
	isEnabled: (extensionName) => {
		return TD.extensions.getAllEnabled().includes(extensionName);
	},

	/**
	 * Check if given extension is initialized
	 *
	 * @param {string} extensionName name of the extension to be checked
	 *
	 * @returns {boolean} boolean value representing if an extension is initialized
	 */
	isInitialized: (extensionName) => {
		return TD.extensions.getAllInitialized().includes(extensionName);
	},

	/**
	 * Resolves the extensions list dependency tree and returns a sorted list of extension names
	 *
	 * @returns {array} sorted array of extension names
	 */
	resolveDependencyGraph: () => {
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
					visit(TD.extensions.getExtension(dependency), ancestors.slice(0));
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
	initializeExtension: (extensionName) => {
		let extension = TD.extensions.getExtension(extensionName);

		if (!TD.extensions.isInitialized(extensionName)) {
			Object.create(extension);
			TD.extensions._init.push(extensionName);
		}
	},

	/**
	 * Destroys the given extension
	 *
	 * @param {string} extensionName name of extension to be destroyed
	 */
	destroyExtension: (extensionName) => {
		let extension = TD.extensions.getExtension(extensionName);

		if (TD.extensions.isInitialized(extensionName)) {
			let extensionIndex = TD.extensions._init.indexOf(extensionName);
			extension.destroy();

			TD.extensions._init.splice(extensionIndex, 1);
		}
	},

	/**
	 * Reorders the extension list using the resolved dependency graph
	 */
	reorderExtensions: () => {
		let extensionOrder = TD.extensions.resolveDependencyGraph();

		TD.extensions._list = extensionOrder.map((extension) => TD.extensions.getExtension(extension));
	},

	/**
	 * Reorders the enabled extension list using the resolved dependency graph
	 *
	 * @returns the ordered list of enabled extensions
	 */
	reorderEnabledExtensions: (enabledExtensions) => {
		let extensionOrder = TD.extensions.resolveDependencyGraph();

		return extensionOrder.filter((extension) => enabledExtensions.includes(extension));
	},
};

module.exports = TD.extensions;
