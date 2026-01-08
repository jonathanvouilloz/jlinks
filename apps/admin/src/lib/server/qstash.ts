import { Client } from '@upstash/qstash';
import { env } from '$env/dynamic/private';
import { ADMIN_URL } from '$env/static/private';

const QSTASH_TOKEN = env.QSTASH_TOKEN;

// En dev sans QSTASH_TOKEN, on bypass la queue
export const qstash = QSTASH_TOKEN ? new Client({ token: QSTASH_TOKEN }) : null;

console.log('[QStash] Configured:', !!QSTASH_TOKEN);

export type EmailJob = {
	type: 'verification' | 'password-reset';
	email: string;
	token: string;
};

export async function queueEmail(job: EmailJob): Promise<boolean> {
	// Bypass en dev : envoi direct
	if (!qstash) {
		const { sendEmailVerificationEmail, sendPasswordResetEmail } = await import('./email');
		if (job.type === 'verification') {
			return sendEmailVerificationEmail(job.email, job.token);
		} else {
			return sendPasswordResetEmail(job.email, job.token);
		}
	}

	// Production : passer par QStash
	try {
		const webhookUrl = `${ADMIN_URL}/api/webhooks/email`;
		await qstash.publishJSON({
			url: webhookUrl,
			body: job,
			retries: 3
		});
		console.log('[QStash] Email job queued:', job.type, job.email);
		return true;
	} catch (error) {
		console.error('[QStash] Failed to queue email:', error);
		return false;
	}
}
