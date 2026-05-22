import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Plus, X, Play, Youtube, Instagram, Link as LinkIcon, Palette, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';
import { VideoModal } from './VideoModal';

type ColorName = 'Red' | 'Blue' | 'Green' | 'Purple' | 'Amber' | 'Pink' | 'Indigo' | 'Slate';

const COLOR_HEX: Record<ColorName, string> = {
    Red: '#dc2626',
    Blue: '#2563eb',
    Green: '#16a34a',
    Purple: '#9333ea',
    Amber: '#d97706',
    Pink: '#db2777',
    Indigo: '#4f46e5',
    Slate: '#475569',
};

const COLOR_CHOICES: ColorName[] = ['Red', 'Blue', 'Green', 'Purple', 'Amber', 'Pink', 'Indigo', 'Slate'];

interface CategoryNode {
    id: string;
    name: string;
    color: string;
    is_default: boolean;
    x: number | null;
    y: number | null;
}

interface TechniqueNode {
    id: string;
    title: string;
    link: string;
    platform: 'youtube' | 'instagram' | 'tiktok' | 'other' | null;
    x: number | null;
    y: number | null;
}

interface GraphLink {
    technique_id: string;
    category_id: string;
}

interface GraphPayload {
    categories: CategoryNode[];
    techniques: TechniqueNode[];
    links: GraphLink[];
}

type FgNode = {
    id: string;
    kind: 'category' | 'technique';
    label: string;
    color: string;
    platform?: TechniqueNode['platform'];
    link?: string;
    fx?: number;
    fy?: number;
    x?: number;
    y?: number;
};

type FgLink = { source: string; target: string };

interface TechniqueGraphProps {
    refreshSignal?: number;
}

export const TechniqueGraph: React.FC<TechniqueGraphProps> = ({ refreshSignal = 0 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>(undefined);
    const notification = useNotification();

    const [size, setSize] = useState({ w: 320, h: 600 });
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<GraphPayload>({ categories: [], techniques: [], links: [] });
    const [activeCategory, setActiveCategory] = useState<CategoryNode | null>(null);
    const [videoTech, setVideoTech] = useState<TechniqueNode | null>(null);
    const [showAddCat, setShowAddCat] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState<ColorName>('Slate');
    const [busy, setBusy] = useState(false);

    // ---------- Fetch graph data ----------
    const fetchGraph = useCallback(async () => {
        setLoading(true);
        const { data: rpc, error } = await supabase.rpc('get_user_graph_data');
        if (error) {
            console.error('get_user_graph_data error:', error);
            setLoading(false);
            return;
        }
        const payload = (rpc as GraphPayload) || { categories: [], techniques: [], links: [] };
        setData({
            categories: payload.categories || [],
            techniques: payload.techniques || [],
            links: payload.links || [],
        });
        setLoading(false);
    }, []);

    useEffect(() => { fetchGraph(); }, [fetchGraph, refreshSignal]);

    // ---------- Responsive size ----------
    useEffect(() => {
        const update = () => {
            const el = containerRef.current;
            if (!el) return;
            const w = el.clientWidth || window.innerWidth;
            const h = Math.min(Math.max(window.innerHeight * 0.7, 480), 820);
            setSize({ w, h });
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // ---------- Build graph nodes/links for the library ----------
    const graphData = useMemo<{ nodes: FgNode[]; links: FgLink[] }>(() => {
        const nodes: FgNode[] = [];

        for (const c of data.categories) {
            const node: FgNode = {
                id: `c:${c.id}`,
                kind: 'category',
                label: c.name,
                color: COLOR_HEX[(c.color as ColorName) ?? 'Slate'] ?? COLOR_HEX.Slate,
            };
            if (c.x != null && c.y != null) { node.fx = c.x; node.fy = c.y; }
            nodes.push(node);
        }

        for (const t of data.techniques) {
            const node: FgNode = {
                id: `t:${t.id}`,
                kind: 'technique',
                label: t.title,
                color: '#0f172a',
                platform: t.platform,
                link: t.link,
            };
            if (t.x != null && t.y != null) { node.fx = t.x; node.fy = t.y; }
            nodes.push(node);
        }

        const linkPairs: FgLink[] = data.links.map(l => ({
            source: `t:${l.technique_id}`,
            target: `c:${l.category_id}`,
        }));

        return { nodes, links: linkPairs };
    }, [data]);

    // Map techniques by id for fast modal access
    const techById = useMemo(() => {
        const m = new Map<string, TechniqueNode>();
        for (const t of data.techniques) m.set(t.id, t);
        return m;
    }, [data.techniques]);

    // Map category_id → techniques connected
    const techsByCategory = useMemo(() => {
        const m = new Map<string, TechniqueNode[]>();
        for (const link of data.links) {
            const t = techById.get(link.technique_id);
            if (!t) continue;
            const arr = m.get(link.category_id) || [];
            arr.push(t);
            m.set(link.category_id, arr);
        }
        return m;
    }, [data.links, techById]);

    // ---------- Highlight on active category ----------
    const highlightedNodeIds = useMemo(() => {
        if (!activeCategory) return null;
        const ids = new Set<string>([`c:${activeCategory.id}`]);
        for (const link of data.links) {
            if (link.category_id === activeCategory.id) ids.add(`t:${link.technique_id}`);
        }
        return ids;
    }, [activeCategory, data.links]);

    // ---------- Node rendering ----------
    const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const dim = highlightedNodeIds && !highlightedNodeIds.has(node.id);
        ctx.globalAlpha = dim ? 0.18 : 1;

        if (node.kind === 'category') {
            const label: string = node.label ?? '';
            const fontSize = Math.max(11, 13 / Math.sqrt(globalScale));
            ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
            const padX = 12, padY = 7;
            const w = ctx.measureText(label).width + padX * 2;
            const h = fontSize + padY * 2;
            const r = h / 2;
            const x = node.x - w / 2;
            const y = node.y - h / 2;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = node.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, node.x, node.y);

            // Save bbox so pointer-area painter can mirror this shape
            node.__bckgDimensions = [w, h];
        } else {
            // technique node — small dot with platform-tinted ring
            const r = 4.5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle =
                node.platform === 'youtube' ? '#dc2626'
                : node.platform === 'instagram' ? '#db2777'
                : node.platform === 'tiktok' ? '#0f172a'
                : '#94a3b8';
            ctx.stroke();
            node.__bckgDimensions = [r * 2 + 6, r * 2 + 6];
        }

        ctx.globalAlpha = 1;
    }, [highlightedNodeIds]);

    const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
        const [w, h] = node.__bckgDimensions || [16, 16];
        ctx.fillStyle = color;
        ctx.fillRect(node.x - w / 2, node.y - h / 2, w, h);
    }, []);

    // ---------- Interactions ----------
    const handleNodeClick = useCallback((n: any) => {
        if (n.kind === 'category') {
            const realId = String(n.id).slice(2);
            const cat = data.categories.find(c => c.id === realId);
            if (cat) setActiveCategory(cat);
        } else {
            const realId = String(n.id).slice(2);
            const t = techById.get(realId);
            if (t) setVideoTech(t);
        }
    }, [data.categories, techById]);

    const persistPositionRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const handleNodeDragEnd = useCallback(async (n: any) => {
        // Pin the node where the user dropped it
        n.fx = n.x; n.fy = n.y;

        const nodeType = n.kind;
        const realId = String(n.id).slice(2);

        // Debounce persistence (in case of rapid drags)
        const key = `${nodeType}:${realId}`;
        const pending = persistPositionRef.current.get(key);
        if (pending) clearTimeout(pending);
        const timeout = setTimeout(async () => {
            await supabase.rpc('update_node_position', {
                p_node_type: nodeType,
                p_node_id: realId,
                p_x: n.x,
                p_y: n.y,
            });
            persistPositionRef.current.delete(key);
        }, 250);
        persistPositionRef.current.set(key, timeout);
    }, []);

    // ---------- Add new category node ----------
    const handleAddCategory = async () => {
        if (!newName.trim()) {
            notification.alert('Dê um nome para o novo nó.', 'Nome obrigatório');
            return;
        }
        setBusy(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setBusy(false);
            notification.alert('Sessão expirada.', 'Acesso negado');
            return;
        }
        const { error } = await supabase
            .from('technique_groups')
            .insert({ user_id: user.id, name: newName.toUpperCase().trim(), color: newColor, is_default: false });
        setBusy(false);
        if (error) {
            notification.alert(`Erro: ${error.message}`, 'Não foi possível criar');
            return;
        }
        setNewName('');
        setNewColor('Slate');
        setShowAddCat(false);
        await fetchGraph();
    };

    const platformIcon = (p?: TechniqueNode['platform']) => {
        if (p === 'youtube') return <Youtube className="w-4 h-4 text-red-600" />;
        if (p === 'instagram') return <Instagram className="w-4 h-4 text-pink-600" />;
        if (p === 'tiktok') return (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-900 dark:text-slate-100" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.5a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.93z" />
            </svg>
        );
        return <LinkIcon className="w-4 h-4 text-slate-500" />;
    };

    const activeCatTechs = activeCategory ? (techsByCategory.get(activeCategory.id) || []) : [];

    return (
        <div className="w-full">
            {/* Hint / legend */}
            <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
                    Toque num nó • Arraste para reorganizar
                </p>
                <button
                    onClick={() => setShowAddCat(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Nó
                </button>
            </div>

            <div
                ref={containerRef}
                className="relative w-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden touch-none"
                style={{ height: size.h }}
            >
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
                    </div>
                ) : (
                    <ForceGraph2D
                        ref={fgRef as any}
                        width={size.w}
                        height={size.h}
                        graphData={graphData}
                        backgroundColor="#f8fafc"
                        cooldownTicks={120}
                        d3VelocityDecay={0.35}
                        linkColor={(l: any) => {
                            if (!highlightedNodeIds) return 'rgba(100,116,139,0.35)';
                            const sId = typeof l.source === 'object' ? l.source.id : l.source;
                            const tId = typeof l.target === 'object' ? l.target.id : l.target;
                            return highlightedNodeIds.has(sId) && highlightedNodeIds.has(tId)
                                ? 'rgba(37,99,235,0.7)' : 'rgba(100,116,139,0.08)';
                        }}
                        linkWidth={(l: any) => {
                            if (!highlightedNodeIds) return 1;
                            const sId = typeof l.source === 'object' ? l.source.id : l.source;
                            const tId = typeof l.target === 'object' ? l.target.id : l.target;
                            return highlightedNodeIds.has(sId) && highlightedNodeIds.has(tId) ? 2 : 1;
                        }}
                        nodeCanvasObject={drawNode}
                        nodePointerAreaPaint={nodePointerAreaPaint}
                        onNodeClick={handleNodeClick}
                        onNodeDragEnd={handleNodeDragEnd}
                        onBackgroundClick={() => setActiveCategory(null)}
                        enableNodeDrag={true}
                        enableZoomInteraction={true}
                        enablePanInteraction={true}
                        minZoom={0.3}
                        maxZoom={4}
                    />
                )}

                {/* Active category panel (bottom sheet) */}
                {activeCategory && (
                    <div className="absolute inset-x-0 bottom-0 bg-white border-t border-slate-200 rounded-t-2xl shadow-xl max-h-[60%] flex flex-col animate-in slide-in-from-bottom duration-200">
                        <div className="flex items-center justify-between p-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: COLOR_HEX[(activeCategory.color as ColorName) ?? 'Slate'] }}
                                />
                                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 truncate">
                                    {activeCategory.name}
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {activeCatTechs.length} {activeCatTechs.length === 1 ? 'técnica' : 'técnicas'}
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveCategory(null)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                                aria-label="Fechar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-2 space-y-1.5">
                            {activeCatTechs.length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-6 font-medium">
                                    Nenhuma técnica conectada a este nó ainda.
                                </p>
                            ) : activeCatTechs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setVideoTech(t)}
                                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-xl text-left transition-colors"
                                >
                                    {platformIcon(t.platform)}
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-tight flex-1 min-w-0 truncate">
                                        {t.title}
                                    </span>
                                    <Play className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add-category modal */}
            {showAddCat && (
                <div
                    className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => !busy && setShowAddCat(false)}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Novo Nó</h3>
                            <button
                                onClick={() => !busy && setShowAddCat(false)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                                    Nome
                                </label>
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ex: GUARDA ARANHA"
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold uppercase focus:outline-none focus:border-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5">
                                    <Palette className="w-3 h-3" /> Cor
                                </label>
                                <div className="grid grid-cols-8 gap-2">
                                    {COLOR_CHOICES.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setNewColor(c)}
                                            className={`aspect-square rounded-lg border-2 transition-all ${newColor === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: COLOR_HEX[c] }}
                                            aria-label={c}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleAddCategory}
                                disabled={busy}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Criar Nó
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <VideoModal
                isOpen={!!videoTech}
                onClose={() => setVideoTech(null)}
                url={videoTech?.link || ''}
                title={videoTech?.title || ''}
            />
        </div>
    );
};
