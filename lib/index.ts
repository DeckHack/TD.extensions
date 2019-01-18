'use strict';

interface Extension {
	name: string;
	author: string;
	description: string;
	website: string;
	dependencies: [];
	conflicts: [];
	create: () => {};
	destroy: () => {};
}

interface Extensions {
	list: [];
	init: [];
}

export default class TDE {
	private extensions: Extensions;

	constructor(extensions: Extensions) {
		this.extensions = extensions;
	}

	/**
	 * Adds an extension to the `extensions` list
	 * @param {object} extension TD.extension object
	 * @param {boolean} enable enable extension right after addition
	 * @param {boolean} init initialize extension right after addition
	 */
	public add(extension: Extension, enable: boolean, init: boolean): void {
		if (this.getExtension(extension.name) === undefined) {
			this.extensions.list.push(extension);

			try {
				this.reorderExtensions();
			} catch (exception) {
				// Silent catch, most likely so because a dependency we require is not here yet
			}

			if (enable) {
				this.enable(extension.name, init);
			}
		}
	}

	/**
	 * Removes an extension from the `extensions` list
	 * Also disables and destroys it in the progress (if not already done)
	 * @param {string} extensionName name of the extension to be removed
	 */
	public remove(extensionName: string): void {
		const extension = this.getExtension(extensionName);
		const extensionIndex = this.extensions.list.indexOf(extension);

		this.disable(extensionName);

		this.extensions.list.splice(extensionIndex, 1);

		this.reorderExtensions();
	}

	/**
	 * Get an extension object returned by name
	 * @param {string} extensionName name of the extension to get
	 * @returns {Extension}
	 */
	public getExtension(extensionName: string): Extension {
		return this.extensions.list.filter((extension) => extension.name === extensionName)[0];
	}

	/**
	 * Returns the names of all extensions in the `extensions` list
	 *
	 * @returns {array}
	 */
	public getAll() {
		return this.extensions.list.map((extension) => extension.name);
	}

	/**
	 * Returns the names of all extensions currently enabled from localStorage
	 * @returns {array}
	 */
	public getAllEnabled() {
		const enabled = JSON.parse(window.localStorage.getItem('this.enabled'));

		if (enabled === null) {
			window.localStorage.setItem('this.enabled', JSON.stringify([]));

			return [];
		} else {
			return enabled;
		}
	}

	/**
	 * Returns the names of all extensions currently initialized
	 * @returns {array}
	 */
	public getAllInitialized() {
		return this.init;
	}

	/**
	 * Enables an extension, so it will be run the next time .init() is executed
	 * or the `init` parameter is passed
	 *
	 * Rules so that an extension will be enabled:
	 * - it isn't already enabled
	 * - the dependencies it requires are already enabled
	 * - it has no conflicts with currently enabled extensions
	 * @param {string} extensionName name of the extension to be enabled
	 * @param {boolean} init initialize the extension right after enabling
	 */
	public enable(extensionName: string, init: boolean): void {
		let enabledExtensions = this.getAllEnabled();
		const extension: Extension = this.getExtension(extensionName);

		if (
			!this.isEnabled(extension.name) &&
			this.checkDependencies(extension.name) &&
			this.checkConflicts(extension.name)
		) {
			enabledExtensions.push(extensionName);

			enabledExtensions = this.reorderEnabledExtensions(enabledExtensions);

			window.localStorage.setItem('this.enabled', JSON.stringify(enabledExtensions));
		}

		if (init) {
			this.initializeExtension(extension.name);
		}
	}

	/**
	 * Disables an extension and all extensions that depend on it
	 * @param {string} extensionName name of the extension to be disabled
	 */
	public disable(extensionName: string): void {
		let enabledExtensions = this.getAllEnabled();

		if (this.isEnabled(extensionName)) {
			const extensionIndex = enabledExtensions.indexOf(extensionName);
			enabledExtensions.splice(extensionIndex, 1);

			enabledExtensions = this.reorderEnabledExtensions(enabledExtensions);

			window.localStorage.setItem('this.enabled', JSON.stringify(enabledExtensions));

			enabledExtensions.forEach((enabledExtension) => {
				this.checkDependencies(enabledExtension);
			});
		}

		if (this.isInitialized(extensionName)) {
			this.destroyExtension(extensionName);
		}
	}

	/**
	 * Initialize all extensions
	 */
	public init(): void {
		const enabledExtensions = this.getAllEnabled();

		enabledExtensions.forEach((extension) => {
			this.initializeExtension(extension);
		});
	}

	/**
	 * Checks the dependencies for a given extension
	 * @param {string} extensionName name of the extension to be checked
	 * @returns {boolean} true if dependencies could be resolved, false if any dependency is missing
	 */
	public checkDependencies(extensionName: string): boolean {
		const extension: Extension = this.getExtension(extensionName);

		if (extension.dependencies === undefined) {
			return true;
		}

		const extensionDependencyStatus = extension.dependencies.every((dependency) => {
			this.isEnabled(dependency);
		});

		if (extensionDependencyStatus === false && this.isEnabled(extensionName)) {
			this.disable(extensionName);
			return false;
		} else {
			return extensionDependencyStatus;
		}
	}

	/**
	 * Checks the conflicts of a given extension
	 * @param {string} extensionName name of the extension to be checked
	 * @returns {boolean} true if no conflicts exist with enabled extensions, false if there are conflicts
	 */
	public checkConflicts(extensionName: string): boolean {
		const extension: Extension = this.getExtension(extensionName);

		if (extension.conflicts === undefined) {
			return true;
		}

		const extensionConflictStatus = extension.conflicts.some((conflict) =>
			this.isEnabled(conflict)
		);

		return !extensionConflictStatus;
	}

	/**
	 * Check if given extension is enabled
	 * @param {string} extensionName name of the extension to be checked
	 * @returns {boolean} boolean value representing if an extension is enabled
	 */
	public isEnabled(extensionName: string): boolean {
		return this.getAllEnabled().includes(extensionName);
	}

	/**
	 * Check if given extension is initialized
	 * @param {string} extensionName name of the extension to be checked
	 * @returns {boolean} boolean value representing if an extension is initialized
	 */
	public isInitialized(extensionName: string): boolean {
		return this.getAllInitialized().includes(extensionName);
	}

	/**
	 * Resolves the extensions list dependency tree and returns a sorted list of extension names
	 * @returns {array} sorted array of extension names
	 */
	public resolveDependencyGraph() {
		const sorted: Array<String> = [];
		const visited: Object = {};

		this.extensions.list.forEach(function visit(extension: Extension, ancestors) {
			if (!Array.isArray(ancestors)) {
				ancestors = [];
			}
			if (extension.name === undefined) {
				return;
			}

			ancestors.push(extension.name);
			visited[extension.name] = true;

			if (extension.dependencies) {
				extension.dependencies.forEach(function(dependency) {
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

					if (visited[dependency]) {
						return;
					}
					visit(this.getExtension(dependency), ancestors.slice(0));
				});
			}

			if (sorted.indexOf(extension.name) < 0) {
				sorted.push(extension.name);
			}
		});

		return sorted;
	}

	/**
	 * Initializes the given extension
	 * @param {string} extensionName name of extension to be initialized
	 */
	public initializeExtension(extensionName: string): void {
		const extension: Extension = this.getExtension(extensionName);

		if (!this.isInitialized(extensionName)) {
			extension.create();
			this.init.push(extensionName);
		}
	}

	/**
	 * Destroys the given extension
	 * @param {string} extensionName name of extension to be destroyed
	 */
	public destroyExtension(extensionName: string): void {
		const extension = this.getExtension(extensionName);

		if (this.isInitialized(extensionName)) {
			const extensionIndex = this.init.indexOf(extensionName);
			extension.destroy();

			this.init.splice(extensionIndex, 1);
		}
	}

	/**
	 * Reorders the extension list using the resolved dependency graph
	 */
	public reorderExtensions(): void {
		const extensionOrder = this.resolveDependencyGraph();

		this.extensions.list = extensionOrder.map((extension) => this.getExtension(extension));
	}

	/**
	 * Reorders the enabled extension list using the resolved dependency graph
	 * @returns the ordered list of enabled extensions
	 */
	public reorderEnabledExtensions(enabledExtensions) {
		const extensionOrder = this.resolveDependencyGraph();

		return extensionOrder.filter((extension) => enabledExtensions.includes(extension));
	}
}
