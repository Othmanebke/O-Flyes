const BREVO_API_URL = 'https://api.brevo.com/v3/transactionalSMS/sms';

export async function sendTripConfirmationSMS(
    phone: string | undefined,
    tripTitle: string,
): Promise<void> {
    if (!process.env.BREVO_API_KEY) {
        console.log('[SMS] BREVO_API_KEY non configuré — SMS ignoré');
        return;
    }
    if (!phone) {
        console.log('[SMS] Aucun numéro de téléphone — SMS ignoré');
        return;
    }

    const content = `AIVANA : Votre voyage "${tripTitle}" a ete enregistre dans votre dashboard ! Retrouvez tout sur aivanaflyes.vercel.app/dashboard`;

    try {
        const res = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sender: 'AIVANA',
                recipient: phone,
                content,
                type: 'transactional',
            }),
        });

        if (!res.ok) {
            console.error('[SMS] Erreur Brevo:', await res.text());
        } else {
            console.log('[SMS] Envoyé à', phone);
        }
    } catch (err) {
        console.error('[SMS] Échec envoi:', err);
    }
}
