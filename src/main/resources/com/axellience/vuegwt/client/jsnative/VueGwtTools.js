/**
 * This object provides methods used to make our Java components compatible with Vue.JS
 */

window.vueGwt = {
	/**
	 * Convert the Java representation of a VueModel definition to a JS object that
	 * can be passed to Vue.JS
	 * This is going to be passed to either new Vue() or Vue.component()
	 *
	 * @param javaVueComponent
	 * @returns {methods: {}, watch: {}, computed: {}} VueModel definition
	 */
	javaComponentToVueComponentDefinition: function (javaVueComponent) {
		// Base VueModel definition structure
		var vueModel = {
			methods: {},
			watch: {},
			computed: {}
		};
		var data = {};

		// Check if our element is an App or a Component
		var isComponent = !javaVueComponent["$$el"];

		// Browse all the properties of our java object
		for (var propName in javaVueComponent) {
			if (!javaVueComponent.hasOwnProperty(propName))
				continue;

			this._manageJavaProperty(propName, javaVueComponent[propName], data, vueModel);
		}
		if (isComponent) {
			// If we are creating a component, data is a factory of data
			vueModel.data = function () {
				// Each component will get it's own instance of the data model
				return JSON.parse(JSON.stringify(data));
			}
		} else {
			// If it's an app, there is just one instance of data model
			vueModel.data = data;
		}

		// Browse all the methods of our java object
		var proto = javaVueComponent.__proto__;
		for (propName in proto) {
			if (!proto.hasOwnProperty(propName))
				continue;

			// Exclude some GWT specific methods and the constructor
			if (propName.indexOf("$init") === 0 || propName.indexOf("___") === 0 || propName == "constructor")
				continue;

			var value = proto[propName];
			if (typeof value != "function") {
				this._manageJavaProperty(propName, value, data, vueModel);
			}

			// Get computed and watch properties and register them in the right property
			var splitName = propName.split("_");
			if (splitName[0] == "watch") {
				vueModel.watch[this._removeFirstWord(splitName)] = value;
			} else if (splitName[0] == "computed") {
				vueModel.computed[this._removeFirstWord(splitName)] = value;
			} else {
				vueModel.methods[propName] = value;
			}
		}

		return vueModel;
	},

	_manageJavaProperty: function(propertyName, propertyValue, data, vueModel) {
		if (propertyName.slice(0, 2) == "$$") {
			// Properties starting with $$ are not data properties of our VM
			// but should be directly copied in the vueModelDefinition (example $$el)
			vueModel[propertyName.slice(2)] = propertyValue;
		} else {
			// Other properties are data properties
			data[propertyName] = propertyValue;
		}
	},

	javaDirectiveToVueDirectiveDefinition: function (javaVueDirective) {
		// Base VueModel definition structure
		var vueDirective = {};

		// Browse all the methods of our java object
		var proto = javaVueDirective.__proto__;
		for (var functionName in proto) {
			if (!proto.hasOwnProperty(functionName))
				continue;

			// We only take a look at function on the prototype
			var func = proto[functionName];
			if (func instanceof Object)
				continue;

			if (functionName.slice(0, 2) == "$$") {
				vueDirective[functionName.slice(2)] = func;
			}
		}

		return vueDirective;
	},

	_removeFirstWord: function (splitWords) {
		splitWords.shift();
		return splitWords.join("");
	},

	vue$emit: function (vueInstance, name, value) {
		vueInstance.$emit(name, value);
	},

	vue$on: function (vueInstance, name, listener) {
		vueInstance.$on(name, listener);
	}
};