import React, { useState, useEffect, useMemo } from 'react';
import { Save, Search, Link as LinkIcon, Check, Youtube, Instagram, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { adminService } from '../../services/admin';
import { useNotification } from '../../context/NotificationContext';
import { curriculumData } from '../../constants/curriculumData';

function extractTechniqueNames(program: 'gb1' | 'gb2'): { number: number; name: string }[] {
    const techniques: { number: number; name: string }[] = [];
    const seen = new Set<number>();

    const extractFromItems = (items: string[]) => {
        for (const item of items) {
            const match = item.match(/^(\d+)\.\s*(.+)/);
            if (match) {
                const num = parseInt(match[1]);
                if (!seen.has(num)) {
                    seen.add(num);
                    techniques.push({ number: num, name: match[2].trim() });
                }
            }
        }
    };

    for (const week of curriculumData) {
        if (program === 'gb1') {
            const gb1A = week.gb1.lessonA;
            const gb1B = week.gb1.lessonB;
            extractFromItems(gb1A.defesaPessoal.items);
            extractFromItems(gb1A.jiuJitsuEsportivo.items);
            extractFromItems(gb1B.defesaPessoal.items);
            extractFromItems(gb1B.jiuJitsuEsportivo.items);
        } else {
            const gb2A = week.gb2.lessonA;
            const gb2B = week.gb2.lessonB;
            extractFromItems(gb2A.tecnicaQueda.items);
            extractFromItems(gb2A.tecnicaChao.items);
            extractFromItems(gb2B.tecnicaQueda.items);
            extractFromItems(gb2B.tecnicaChao.items);
        }
    }

    return techniques.sort((a, b) => a.number - b.number);
}

function inferPlatform(url: string): 'youtube' | 'instagram' | 'other' {
    if (!url) return 'other';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('instagram.com')) return 'instagram';
    return 'other';
}

export const TechniqueLinksManager: React.FC = () => {
    const [links, setLinks] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<'gb1' | 'gb2'>('gb1');
    const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
    const [savingRow, setSavingRow] = useState<string | null>(null);
    const notification = useNotification();

    const gb1Techniques = useMemo(() => extractTechniqueNames('gb1'), []);
    const gb2Techniques = useMemo(() => extractTechniqueNames('gb2'), []);
    const allTechniques = activeTab === 'gb1' ? gb1Techniques : gb2Techniques;

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        try {
            const data = await adminService.getTechniqueLinks();
            setLinks(data);
        } catch (error) {
            console.error('Error loading technique links:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkChange = (key: string, url: string) => {
        setLinks(prev => ({ ...prev, [key]: url }));
        setHasChanges(true);
        setDirtyRows(prev => new Set(prev).add(key));
    };

    const handleSaveSingle = async (key: string) => {
        setSavingRow(key);
        try {
            const currentLinks = { ...links };
            // Clean empties
            const cleanLinks: Record<string, string> = {};
            Object.entries(currentLinks).forEach(([k, val]: [string, string]) => {
                if (val && val.trim()) cleanLinks[k] = val.trim();
            });
            await adminService.updateTechniqueLinks(cleanLinks);
            setLinks(cleanLinks);
            setDirtyRows(prev => {
                const next = new Set(prev);
                next.delete(key);
                if (next.size === 0) setHasChanges(false);
                return next;
            });
        } catch (error) {
            console.error('Error saving technique link:', error);
            notification.alert('Erro ao salvar.', 'Erro');
        } finally {
            setSavingRow(null);
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const cleanLinks: Record<string, string> = {};
            Object.entries(links).forEach(([key, val]: [string, string]) => {
                if (val && val.trim()) cleanLinks[key] = val.trim();
            });
            await adminService.updateTechniqueLinks(cleanLinks);
            setLinks(cleanLinks);
            setHasChanges(false);
            setDirtyRows(new Set());
        } catch (error) {
            console.error('Error saving technique links:', error);
            notification.alert('Erro ao salvar links.', 'Erro');
        } finally {
            setSaving(false);
        }
    };

    const filteredTechniques = useMemo(() => {
        if (!search.trim()) return allTechniques;
        const s = search.toLowerCase();
        return allTechniques.filter(t =>
            t.number.toString().includes(s) || t.name.toLowerCase().includes(s)
        );
    }, [search, allTechniques]);

    const totalCount = gb1Techniques.length + gb2Techniques.length;
    const filledCount = Object.values(links).filter((v: string) => v && v.trim()).length;

    const PlatformIcon = ({ url }: { url: string }) => {
        const p = inferPlatform(url);
        if (p === 'youtube') return <Youtube className="w-4 h-4 text-red-500" />;
        if (p === 'instagram') return <Instagram className="w-4 h-4 text-pink-500" />;
        return <ExternalLink className="w-4 h-4 text-slate-400" />;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            {/* Header */}
            <div
                className="p-5 sm:p-6 cursor-pointer select-none group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <LinkIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                                Links das <span className="text-emerald-600">Técnicas</span>
                            </h2>
                            <p className="text-slate-400 dark:text-slate-500 font-medium text-xs mt-0.5">
                                Associe vídeos às técnicas do currículo GB •{' '}
                                <span className="text-emerald-600 font-bold">{filledCount}/{totalCount}</span> definidas
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasChanges && (
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                                Alterações não salvas
                            </span>
                        )}
                        <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-700">
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Content */}
            <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* GB1 / GB2 Tab Switcher */}
                <div className="px-5 sm:px-6 pb-4 flex justify-center gap-3 border-b border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('gb1')}
                        className={`px-6 sm:px-10 py-2.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] italic transition-all duo-btn-3d ${activeTab === 'gb1'
                            ? 'bg-blue-600 text-white shadow-[0_4px_0_0_#1d4ed8]'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f172a]'
                            }`}
                    >
                        GB1 ({gb1Techniques.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('gb2')}
                        className={`px-6 sm:px-10 py-2.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] italic transition-all duo-btn-3d ${activeTab === 'gb2'
                            ? 'bg-purple-700 text-white shadow-[0_4px_0_0_#581c87]'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f172a]'
                            }`}
                    >
                        GB2 ({gb2Techniques.length})
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por número ou nome..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleSaveAll(); }}
                        disabled={saving || !hasChanges}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all duo-btn-3d min-h-[44px] ${hasChanges
                            ? 'bg-emerald-500 text-white shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-1 active:shadow-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Salvando...' : 'Salvar Todos'}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${(filledCount / totalCount) * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                            {Math.round((filledCount / totalCount) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : (
                    <div>
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest w-16">Nº</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Técnica</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[300px]">Link do Vídeo</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest w-16">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTechniques.map((tech) => {
                                    const techKey = `${activeTab}_${tech.number}`;
                                    const linkValue = links[techKey] || '';
                                    const hasLink = linkValue.trim().length > 0;
                                    return (
                                        <tr
                                            key={tech.number}
                                            className={`border-b border-slate-50 dark:border-slate-800/50 transition-colors ${hasLink ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black ${hasLink
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {tech.number}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                                                    {tech.name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    {hasLink && <PlatformIcon url={linkValue} />}
                                                    <input
                                                        type="url"
                                                        value={linkValue}
                                                        onChange={(e) => handleLinkChange(techKey, e.target.value)}
                                                        placeholder="https://youtube.com/... ou instagram.com/..."
                                                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                                    />
                                                    {dirtyRows.has(techKey) && (
                                                        <button
                                                            onClick={() => handleSaveSingle(techKey)}
                                                            disabled={savingRow === techKey}
                                                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all flex-shrink-0 active:scale-90"
                                                            title="Salvar esta técnica"
                                                        >
                                                            {savingRow === techKey
                                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                : <Save className="w-3.5 h-3.5" />
                                                            }
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                {hasLink ? (
                                                    <div className="inline-flex items-center justify-center w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                        <span className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
