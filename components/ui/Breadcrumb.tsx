import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    path?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
    const navigate = useNavigate();

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-2 text-sm ${className}`}
        >
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-red-600 transition-colors group"
                aria-label="Ir para página inicial"
            >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium hidden sm:inline">Início</span>
            </button>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={index}>
                        <ChevronRight className="w-4 h-4 text-slate-300" />

                        {item.path && !isLast ? (
                            <button
                                onClick={() => navigate(item.path!)}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-red-600 transition-colors font-medium"
                                aria-label={`Ir para ${item.label}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ) : (
                            <span
                                className={`flex items-center gap-1.5 font-bold ${isLast ? 'text-slate-900' : 'text-slate-400'
                                    }`}
                                aria-current={isLast ? 'page' : undefined}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};
