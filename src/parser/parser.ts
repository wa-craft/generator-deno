// deno-lint-ignore-file
// deno-lint-ignore-file no-explicit-any
import { Oas } from '../oas/Oas.ts';
/**
 * yaml parser
 * @param data
 */
function parse(data: any, config: any) {
	let oas: Oas = new Oas(data, config);
	oas.generate();
	//oas.dump();
}

export { parse };
