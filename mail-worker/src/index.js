import app from './hono/webs';
import { email } from './email/email';
import userService from './service/user-service';
import verifyRecordService from './service/verify-record-service';
import emailService from './service/email-service';
export default {
	 async fetch(req, env, ctx) {
		const url = new URL(req.url)


		if (url.pathname.startsWith('/api/')) {
			url.pathname = url.pathname.replace('/api', '')
			req = new Request(url.toString(), req)
			return app.fetch(req, env, ctx);
		}

		// 微信恢复验证文件
		if (url.pathname === '/457fb551c8599ea3c3b08843f6153a8e.txt') {
			return new Response('b2d3b9aaefdb4435ca7924bc509329ecce84b695', {
				headers: { 'Content-Type': 'text/plain; charset=utf-8' },
			});
		}


		return env.assets.fetch(req);
	},
	email: email,
	async scheduled(c, env, ctx) {
		await verifyRecordService.clearRecord({env})
		await userService.resetDaySendCount({ env })
		await emailService.completeReceiveAll({ env })
	},
};
