export const SCHOOL_INFO = {
    phone: '553591647692',
    whatsappMessage: 'Oi, gostaria de marcar uma aula experimental.',
    whatsappUrl: (message?: string) => {
        const msg = message || 'Oi, gostaria de marcar uma aula experimental.';
        return `https://wa.me/553591647692?text=${encodeURIComponent(msg)}`;
    }
};
