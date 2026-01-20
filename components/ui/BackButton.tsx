import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    to?: string;
    label?: string;
    className?: string;
    onClick?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({
    to,
    label = 'Voltar',
    className = '',
    onClick
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 text-slate-600 hover:text-red-600 font-black text-xs uppercase tracking-[0.2em] transition-all group ${className}`}
            aria-label={label}
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};
