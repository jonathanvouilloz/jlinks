import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Receiver } from '@upstash/qstash';
import { env } from '$env/dynamic/private';
import { sendEmailVerificationEmail, sendPasswordResetEmail } from '$lib/server/email';
import type { EmailJob } from '$lib/server/qstash';

// Receiver est null en dev (pas de signing keys)
const receiver =
	env.QSTASH_CURRENT_SIGNING_KEY && env.QSTASH_NEXT_SIGNING_KEY
		? new Receiver({
				currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
				nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY
			})
		: null;

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();

	// Vérifier la signature QStash (skip en dev)
	if (receiver) {
		const signature = request.headers.get('upstash-signature');
		if (!signature) {
			console.error('[Webhook] Missing QStash signature');
			return json({ error: 'Missing signature' }, { status: 401 });
		}

		try {
			await receiver.verify({
				signature,
				body,
				url: request.url
			});
		} catch (error) {
			console.error('[Webhook] Invalid QStash signature:', error);
			return json({ error: 'Invalid signature' }, { status: 401 });
		}
	}

	// Parser le job
	let job: EmailJob;
	try {
		job = JSON.parse(body);
	} catch {
		console.error('[Webhook] Invalid JSON body');
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	// Valider le job
	if (!job.type || !job.email || !job.token) {
		console.error('[Webhook] Invalid job payload:', job);
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	console.log('[Webhook] Processing email job:', job.type, job.email);

	// Envoyer l'email
	let success = false;
	if (job.type === 'verification') {
		success = await sendEmailVerificationEmail(job.email, job.token);
	} else if (job.type === 'password-reset') {
		success = await sendPasswordResetEmail(job.email, job.token);
	} else {
		console.error('[Webhook] Unknown job type:', job.type);
		return json({ error: 'Unknown job type' }, { status: 400 });
	}

	if (!success) {
		// Retourner 500 pour que QStash retry
		console.error('[Webhook] Failed to send email, will retry');
		return json({ error: 'Failed to send email' }, { status: 500 });
	}

	console.log('[Webhook] Email sent successfully:', job.type, job.email);
	return json({ success: true });
};
