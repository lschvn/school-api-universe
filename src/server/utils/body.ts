import type { HttpEvent } from '..';

export function readBody(event: HttpEvent): Promise<any> {
	return new Promise((resolve) => {
		resolve(event.req.body);
	});
}
