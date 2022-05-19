
import AbstractGenerator from '../../../../../src/AbstractGenerator.ts';
import * as Craft from '../../../../../src/craft/mod.ts';

class Generator extends AbstractGenerator {
	data: any = {};
	pluginPath: string = '';
	templatePath: string = '';

	constructor(data: any) {
		super();
		this.data = data;

		this.pluginPath = `plugin/backend/${data.config.backend}`;
		this.templatePath = `./${this.pluginPath}/template`;
	}

	execute(): void {
		//read data file
		/*
		const schemas = this.data.components.schemas
		for (const schemaKey of Object.keys(schemas)) {
			console.log(schemas[schemaKey].properties??'');
		}
		*/
		this.paths();
		this.models();
	}

	/**
	 * process paths and turn path to controoler/router
	 * make controller array then process
	 */
	async paths(): Promise<void> {
		const paths = this.data.paths;
		let targetPath = `${this.data.config.target}/backend/app/controller`;

		let routers: any[] = [];
		let controller;

		/**
		 * process path
		 * length - 1: method
		 * length - 2: class
		 * length - (2+): paths
		 */
		for (const pathKey of Object.keys(paths)) {
			let pathArray = pathKey.split('/');
			let name = pathArray[pathArray.length - 2] ?? '';
			let route = {
				method: pathArray[pathArray.length - 1] ?? '',
				className: name.charAt(0).toUpperCase() + name.slice(1),
				path: pathArray.splice(0, pathArray.length - 2).join('/')
			};

			if(routers.length === 0) {
				routers.push({
					className: route.className,
					path: route.path,
					methods: [route.method]
				});
			} else {
				let index;
				for(let i in routers) {
					if(routers[i] === undefined) break;

					if(routers[i].className === route.className && routers[i].path === route.path) {
						if(routers[i].methods === undefined) {
							routers[i].methods = [];
						}

						if(routers[i] !== undefined) {
							routers[i].methods.push(route.method);
						} else {
							routers.push({
								className: route.className,
								path: route.path,
								methods: [route.method]
							});
						}
					}
				}
			}
		}
		console.log(routers);
		routers.forEach(route => {
			let filePath = (route.path !== '') 
				? `${targetPath}/${route.path}/${route.className}.php`
				: `${targetPath}/${route.className}.php`;

			const namespace = (route.path === '') 
				? 'app\\controller' 
				: `app\\controller\\${route.path}`;

			let controller = {
				name: route.className,
				namespace: namespace,
				methods: route.methods
			};
//console.log(filePath);
			//this.writeFromTemplateFile(`${this.templatePath}/controller.html`, filePath, controller);
		});
	}

	/**
	 * generate model codes
	 */
	async models(): Promise<void> {
		const schemas = this.data.components.schemas
		let targetPath = `${this.data.config.target}/backend/app/model`;

		let model;
		for (const schemaKey of Object.keys(schemas)) {
			let filePath = `${targetPath}/${schemaKey}.php`;
			let pluginPath = `plugin/backend/${this.data.config.backend}`;
			let templatePath = `./${pluginPath}/template`;
			model = new Craft.Model(schemas[schemaKey] ?? {});
			model.name = schemaKey;
			model.namespace = 'app\\model';

			this.writeFromTemplateFile(`${this.templatePath}/model.html`, filePath, model);
		}
	}

	dump(): void {
		console.info(this.data);
	}
}

export default Generator;