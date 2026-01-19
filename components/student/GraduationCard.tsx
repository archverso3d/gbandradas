import React from 'react';
import { Award, Calendar, TrendingUp } from 'lucide-react';

interface GraduationCardProps {
    currentBelt: string;
    startDate: string; // ISO date string
    lastPromotionDate?: string; // ISO date string
    nextForecast?: string; // ISO date string
    certificateUrl?: string; // URL to certificate image/pdf
}

export const GraduationCard: React.FC<GraduationCardProps> = ({
    currentBelt,
    startDate,
    lastPromotionDate,
    nextForecast,
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    // Helper to determine belt color styles
    const getBeltStyles = (belt: string) => {
        const lowerBelt = belt.toLowerCase();
        if (lowerBelt.includes('white') || lowerBelt.includes('branca')) return 'bg-white border-2 border-gray-200 text-gray-800';
        if (lowerBelt.includes('blue') || lowerBelt.includes('azul')) return 'bg-blue-600 text-white';
        if (lowerBelt.includes('purple') || lowerBelt.includes('roxa')) return 'bg-purple-600 text-white';
        if (lowerBelt.includes('brown') || lowerBelt.includes('marrom')) return 'bg-amber-800 text-white';
        if (lowerBelt.includes('black') || lowerBelt.includes('preta')) return 'bg-black text-white';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-red-600" />
                    Minha Graduação
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getBeltStyles(currentBelt)}`}>
                    {currentBelt}
                </span>
            </div>

            <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-500">Início da Jornada</p>
                        <p className="text-gray-900 font-semibold">{formatDate(startDate)}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-500">Última Graduação</p>
                        <p className="text-gray-900 font-semibold">{formatDate(lastPromotionDate)}</p>
                    </div>
                </div>

                {nextForecast && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-1">Previsão Próxima Graduação</p>
                        <p className="text-red-600 font-bold text-lg">{formatDate(nextForecast)}</p>
                        <p className="text-xs text-gray-400 mt-1">*Estimativa baseada na frequência</p>
                    </div>
                )}
            </div>
        </div>
    );
};
