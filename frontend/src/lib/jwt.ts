/**
 * Safely decodes a JWT payload, handling base64url encoding and unicode characters.
 * This avoids the common `Failed to execute 'atob' on 'Window'` error when
 * encountering unpadded base64 or special characters (like accents in names).
 *
 * @param token The raw JWT string.
 * @returns The parsed payload object, or null if the token is invalid.
 */
export function parseJwt(token: string | null): any {
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erreur lors du décodage du jeton JWT:", e);
        return null;
    }
}
