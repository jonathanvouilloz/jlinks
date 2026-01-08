import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, verifications } from '$lib/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { queueEmail } from '$lib/server/qstash';

// Rate limit: 1 resend par minute par email
const resendAttempts = new Map<string, number>();

export const POST: RequestHandler = async ({ request }) => {
	let body: { email?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { email } = body;

	if (!email) {
		return json({ error: 'Email requis' }, { status: 400 });
	}

	const normalizedEmail = email.toLowerCase();

	// Rate limiting
	const lastAttempt = resendAttempts.get(normalizedEmail);
	if (lastAttempt && Date.now() - lastAttempt < 60000) {
		return json({ error: 'Veuillez attendre 1 minute avant de renvoyer' }, { status: 429 });
	}

	// Vérifier que l'utilisateur existe et n'est pas vérifié
	const user = await db.query.users.findFirst({
		where: and(eq(users.email, normalizedEmail), eq(users.emailVerified, false))
	});

	if (!user) {
		// Ne pas révéler si l'email existe ou non (security best practice)
		return json({ success: true });
	}

	// Récupérer un token de vérification existant et valide
	const existingVerification = await db.query.verifications.findFirst({
		where: and(
			eq(verifications.identifier, normalizedEmail),
			gt(verifications.expires_at, new Date().toISOString())
		)
	});

	let verificationToken: string;

	if (existingVerification) {
		verificationToken = existingVerification.value;
	} else {
		// Créer un nouveau token
		verificationToken = crypto.randomUUID();
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		// Supprimer les anciens tokens
		await db.delete(verifications).where(eq(verifications.identifier, normalizedEmail));

		// Créer le nouveau token
		await db.insert(verifications).values({
			id: crypto.randomUUID(),
			identifier: normalizedEmail,
			value: verificationToken,
			expires_at: expiresAt.toISOString()
		});
	}

	// Envoyer via queue
	const queued = await queueEmail({
		type: 'verification',
		email: normalizedEmail,
		token: verificationToken
	});

	if (!queued) {
		console.error('[Resend] Failed to queue verification email for:', normalizedEmail);
	}

	// Mettre à jour le rate limit
	resendAttempts.set(normalizedEmail, Date.now());

	return json({ success: true });
};
