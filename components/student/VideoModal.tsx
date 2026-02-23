import React, { useEffect, useCallback } from 'react';
import { X, Youtube, Instagram, ExternalLink } from 'lucide-react';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

function inferPlatform(url: string): 'youtube' | 'instagram' | 'other' {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('instagram.com')) return 'instagram';
    return 'other';
}

function getEmbedUrl(url: string, platform: string): string | null {
    try {
        if (platform === 'youtube') {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;

            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
        }
        if (platform === 'instagram') {
            const baseLink = url.split('?')[0].replace(/\/$/, '');
            if (baseLink.includes('/reels/') || baseLink.includes('/reel/') || baseLink.includes('/p/') || baseLink.includes('/tv/')) {
                return `${baseLink}/embed`;
            }
        }
    } catch (e) {
        console.error('Error generating embed URL:', e);
    }
    return null;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, url, title }) => {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const platform = inferPlatform(url);
    const embedUrl = getEmbedUrl(url, platform);

    const PlatformIcon = platform === 'youtube' ? Youtube : platform === 'instagram' ? Instagram : ExternalLink;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Modal */}
            <div
                className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl ${platform === 'youtube' ? 'bg-red-600/20 text-red-500' : platform === 'instagram' ? 'bg-pink-600/20 text-pink-500' : 'bg-slate-700 text-slate-400'}`}>
                            <PlatformIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{title}</h3>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                                {platform === 'youtube' ? 'YouTube' : platform === 'instagram' ? 'Instagram' : 'Vídeo'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white flex-shrink-0"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Video Content */}
                <div className="relative w-full bg-black" style={{ paddingTop: platform === 'instagram' ? '100%' : '56.25%' }}>
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            title={title}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <p className="text-slate-400 text-sm font-bold">Não foi possível incorporar este vídeo.</p>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir Link
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
