import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Trash2, Video, Instagram, Youtube, Link as LinkIcon, X, XCircle, Settings, Palette, Edit2, Check, ChevronDown } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';

interface Category {
    id: string;
    name: string;
    color: string;
}

interface Technique {
    id: string;
    title: string;
    link: string;
    category: string;
    category_id?: string;
    platform: 'youtube' | 'instagram' | 'other';
    created_at?: string;
}

interface TechniqueVaultProps {
    techniques: Technique[];
    onAddTechnique: (technique: Omit<Technique, 'id' | 'created_at'>) => void;
    onUpdateTechnique: (id: string, technique: Partial<Technique> & { category_id?: string }) => void;
    onDeleteTechnique: (id: string) => void;
    readOnly?: boolean;
    title?: string;
}

const CATEGORY_COLORS = [
    { name: 'Red', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', fill: 'bg-red-600' },
    { name: 'Blue', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', fill: 'bg-blue-600' },
    { name: 'Green', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', fill: 'bg-green-600' },
    { name: 'Purple', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', fill: 'bg-purple-600' },
    { name: 'Amber', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', fill: 'bg-amber-600' },
    { name: 'Pink', bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-600', fill: 'bg-pink-600' },
    { name: 'Indigo', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', fill: 'bg-indigo-600' },
    { name: 'Slate', bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600', fill: 'bg-slate-600' },
];

export const TechniqueVault: React.FC<TechniqueVaultProps> = ({ techniques, onAddTechnique, onUpdateTechnique, onDeleteTechnique, readOnly = false, title = "Minhas Técnicas" }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isManagingCategories, setIsManagingCategories] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Technique | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newLink, setNewLink] = useState('');
    const [newCategoryId, setNewCategoryId] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('Slate');
    const [selectedFilter, setSelectedFilter] = useState('Todos');
    const playerRef = useRef<HTMLDivElement>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editingTechnique, setEditingTechnique] = useState<Technique | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const notification = useNotification();

    const DEFAULT_CATEGORIES = [
        { id: 'default-queda', name: 'QUEDAS', color: 'Red' },
        { id: 'default-raspagem', name: 'RASPAGEM', color: 'Purple' },
        { id: 'default-passagem', name: 'PASSAGEM DE GUARDA', color: 'Green' },
        { id: 'default-finalizacao', name: 'FINALIZAÇÃO', color: 'Amber' },
        { id: 'default-100kg', name: '100KG', color: 'Slate' },
        { id: 'default-americana', name: 'AMERICANA', color: 'Pink' },
        { id: 'default-armlock', name: 'ARMLOCK', color: 'Blue' },
        { id: 'default-choke', name: 'CHOKE', color: 'Indigo' },
        { id: 'default-estrangulamento', name: 'ESTRANGULAMENTO', color: 'Indigo' },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('Fetching categories via RPC for user:', user.id);
        const { data, error } = await supabase
            .rpc('get_technique_categories');

        if (error) {
            console.error('Error fetching categories via RPC:', error);
        }

        // Always include default categories
        const defaults = DEFAULT_CATEGORIES.map(c => ({ ...c, id: c.id.startsWith('default-') ? c.id : `default-${c.id}` }));

        if (data && data.length > 0) {
            // Filter out any potential internal duplicates if they match by name
            const userCatNames = new Set(data.map(c => c.name.toLowerCase()));
            const filteredDefaults = defaults.filter(d => !userCatNames.has(d.name.toLowerCase()));
            setCategories([...filteredDefaults, ...data]);
        } else {
            setCategories(defaults);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName) {
            notification.alert("Por favor, forneça um nome para identificar a nova categoria técnica.", "Nome Obrigatório");
            return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            notification.alert("Sua sessão expirou ou você não está autenticado. Por favor, faça login novamente.", "Acesso Negado");
            return;
        }

        const { data, error } = await supabase
            .rpc('add_technique_category', {
                p_name: newCategoryName.toUpperCase(),
                p_color: newCategoryColor
            });

        if (error) {
            console.error('Error adding category via RPC:', error);
            notification.alert(`Não foi possível criar a categoria. Detalhes técnicos: ${error.message}`, "Erro ao Criar");
            return;
        }

        if (data) {
            setCategories(prev => {
                const updated = [...prev, data];
                // Ensure no duplicates by name (preferring DB one)
                const seen = new Set();
                return updated.reverse().filter(c => {
                    const key = c.name.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                }).reverse();
            });
            setNewCategoryName('');
            setIsManagingCategories(false);
            await fetchCategories();
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !newCategoryName) return;

        const { error } = await supabase
            .from('technique_groups')
            .update({ name: newCategoryName.toUpperCase(), color: newCategoryColor })
            .eq('id', editingCategory.id);

        if (!error) {
            setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: newCategoryName, color: newCategoryColor } : c));
            setEditingCategory(null);
            setNewCategoryName('');
            setIsManagingCategories(false);
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const handleDeleteCategory = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (id.startsWith('default-')) {
            notification.alert("As categorias fundamentais do sistema são protegidas e não podem ser removidas.", "Ação Bloqueada");
            return;
        }

        const confirmed = await notification.confirm(
            "Você tem certeza que deseja excluir esta categoria? Isso pode afetar a organização das suas técnicas salvas.",
            "Confirmar Exclusão"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from('technique_groups')
            .delete()
            .eq('id', id);

        if (!error) {
            setCategories(categories.filter(c => c.id !== id));
            if (newCategoryId === id) setNewCategoryId('');
            if (selectedFilter === id) setSelectedFilter('Todos');
        }
    };

    const startEditing = (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        if (category.id.startsWith('default-')) {
            notification.alert("Categorias padrão do sistema possuem nomes fixos e não podem ser editadas.", "Ação Bloqueada");
            return;
        }
        setEditingCategory(category);
        setNewCategoryName(category.name.toUpperCase());
        setNewCategoryColor(category.color);
        setIsManagingCategories(true); // Open panel to edit
    };

    useEffect(() => {
        if (selectedVideo && playerRef.current) {
            playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedVideo]);

    const getPlatformIcon = (platform: string) => {
        if (platform === 'youtube') return <Youtube className="w-5 h-5 text-red-600" />;
        if (platform === 'instagram') return <Instagram className="w-5 h-5 text-pink-600" />;
        return <LinkIcon className="w-5 h-5 text-blue-600" />;
    };

    const inferPlatform = (url: string): 'youtube' | 'instagram' | 'other' => {
        if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('instagram')) return 'instagram';
        return 'other';
    };

    const getEmbedUrl = (tech: Technique) => {
        try {
            if (tech.platform === 'youtube') {
                let videoId = '';
                if (tech.link.includes('v=')) {
                    videoId = tech.link.split('v=')[1].split('&')[0];
                } else if (tech.link.includes('youtu.be/')) {
                    videoId = tech.link.split('youtu.be/')[1].split('?')[0];
                } else if (tech.link.includes('embed/')) {
                    videoId = tech.link.split('embed/')[1].split('?')[0];
                } else if (tech.link.includes('/shorts/')) {
                    videoId = tech.link.split('/shorts/')[1].split('?')[0];
                }

                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
                }
            }

            if (tech.platform === 'instagram') {
                const baseLink = tech.link.split('?')[0].replace(/\/$/, '');
                if (baseLink.includes('/reels/') || baseLink.includes('/reel/') || baseLink.includes('/p/')) {
                    return `${baseLink}/embed`;
                }
            }
        } catch (e) {
            console.error('Error generating embed URL:', e);
        }
        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newLink) return;

        let categoryName = 'Outros';
        const selectedCat = categories.find(c => c.id === newCategoryId);
        if (selectedCat) categoryName = selectedCat.name;

        // If using default categories or empty, send null
        const finalCatId = (!newCategoryId || newCategoryId.startsWith('default-')) ? null : newCategoryId;

        onAddTechnique({
            title: newTitle,
            link: newLink,
            category: categoryName,
            category_id: finalCatId,
            platform: inferPlatform(newLink),
        });

        setNewTitle('');
        setNewLink('');
        setNewCategoryId('');
        setIsAdding(false);
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTechnique || !newTitle || !newLink) return;

        let categoryName = 'Outros';
        const selectedCat = categories.find(c => c.id === newCategoryId);
        if (selectedCat) categoryName = selectedCat.name;

        // If using default categories or empty, send null
        const finalCatId = (!newCategoryId || newCategoryId.startsWith('default-')) ? null : newCategoryId;

        onUpdateTechnique(editingTechnique.id, {
            title: newTitle,
            link: newLink,
            category: categoryName,
            category_id: finalCatId,
            platform: inferPlatform(newLink),
        });

        setEditingTechnique(null);
        setNewTitle('');
        setNewLink('');
        setNewCategoryId('');
    };

    const startEditingTechnique = (tech: Technique) => {
        setEditingTechnique(tech);
        setNewTitle(tech.title);
        setNewLink(tech.link);
        setNewCategoryId(tech.category_id || (categories.find(c => c.name === tech.category)?.id) || '');
    };

    const getCategoryStyles = (categoryName?: string, categoryId?: string) => {
        let colorName = 'Slate';

        // Try to match by ID first
        const catById = categories.find(c => c.id === categoryId);
        if (catById) {
            colorName = catById.color;
        } else if (categoryName) {
            // Try matching by name from the categories list (covers defaults)
            const catByName = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
            if (catByName) {
                colorName = catByName.color;
            } else {
                // Fallback legacy map
                const legacyMap: Record<string, string> = {
                    'jiu-jitsu': 'Blue',
                    'queda': 'Red',
                    'quedas': 'Red',
                    'raspagem': 'Purple',
                    'passagem de guarda': 'Green',
                    'finalização': 'Amber',
                    '100kg': 'Slate',
                    'americana': 'Pink',
                    'armlock': 'Blue',
                    'choke': 'Indigo',
                    'estrangulamento': 'Indigo'
                };
                colorName = legacyMap[categoryName.toLowerCase()] || 'Slate';
            }
        }
        return CATEGORY_COLORS.find(c => c.name === colorName) || CATEGORY_COLORS[7];
    };

    const filteredTechniques = selectedFilter === 'Todos'
        ? techniques
        : techniques.filter(tech => {
            if (tech.category_id === selectedFilter) return true;
            if (tech.category === selectedFilter) return true;
            // Check if selected filter is a default category and matches by name
            const defaultCat = categories.find(c => c.id === selectedFilter);
            if (defaultCat && tech.category === defaultCat.name) return true;
            return false;
        });

    // Grouping Logic
    const groupedTechniques = React.useMemo(() => {
        if (selectedFilter !== 'Todos') return null;

        const groups: Record<string, Technique[]> = {};

        techniques.forEach(tech => {
            let catName = tech.category || 'Outros';
            // Normalize categories
            if (catName.toUpperCase() === 'QUEDA') catName = 'QUEDAS';

            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(tech);
        });

        // Sort groups based on our categories order if possible, or alphabetical
        const sortedGroups: Record<string, Technique[]> = {};

        // Use the order from 'categories' state
        categories.forEach(cat => {
            if (groups[cat.name] && groups[cat.name].length > 0) {
                sortedGroups[cat.name] = groups[cat.name];
                delete groups[cat.name]; // Remove to avoid duplication
            }
        });

        // Add remaining groups (like 'Outros' or uncategorized)
        Object.keys(groups).forEach(key => {
            sortedGroups[key] = groups[key];
        });

        return sortedGroups;
    }, [techniques, categories, selectedFilter]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-gray-900" />
                    {title}
                </h2>
                <div className="flex gap-2">
                    {!readOnly && (
                        <button
                            onClick={() => {
                                setIsManagingCategories(!isManagingCategories);
                                setEditingCategory(null);
                                setNewCategoryName('');
                            }}
                            className={`p-2 rounded-lg transition-colors ${isManagingCategories ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title={isManagingCategories ? "Sair da Edição" : "Gerenciar Categorias"}
                        >
                            {isManagingCategories ? <Check className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                        </button>
                    )}
                    {!readOnly && (
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className={`p-2 rounded-lg transition-colors ${isAdding ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {isAdding ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Category Management / Edit Panel */}
            {isManagingCategories && (
                <div className="mb-8 p-4 bg-red-50/30 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-red-800 flex items-center gap-2">
                            <Palette className="w-4 h-4" /> {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </h3>
                        {editingCategory && (
                            <button onClick={() => { setEditingCategory(null); setNewCategoryName(''); }} className="text-xs text-red-600 hover:underline">
                                Cancelar Edição
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                            placeholder="Nome da categoria..."
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <div className="flex flex-wrap gap-1.5 items-center px-2">
                            {CATEGORY_COLORS.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => setNewCategoryColor(color.name)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${color.fill} ${newCategoryColor === color.name ? 'border-black scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    title={color.name}
                                />
                            ))}
                        </div>
                        <button
                            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
                        >
                            {editingCategory ? 'Salvar' : 'Adicionar'}
                        </button>
                    </div>
                    {!editingCategory && (
                        <p className="text-[10px] text-red-400 mt-2">* Selecione uma categoria abaixo para editar ou excluir.</p>
                    )}
                </div>
            )}

            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Título da Técnica</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                placeholder="Ex: Armlock da guarda fechada"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Link (Instagram ou YouTube)</label>
                            <input
                                type="url"
                                value={newLink}
                                onChange={(e) => setNewLink(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Categoria</label>
                            <select
                                value={newCategoryId}
                                onChange={(e) => setNewCategoryId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-white"
                            >
                                <option value="">Outros</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-slate-200"
                            >
                                Salvar Técnica
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Sub-header with Tabs/Filters */}
            <div className={`flex flex-wrap items-center gap-2 mb-8 border-b border-gray-100 pb-4 ${isManagingCategories ? 'p-4 bg-red-50/10 rounded-xl border-dashed border-red-200' : ''}`}>
                <button
                    onClick={() => setSelectedFilter('Todos')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all ${selectedFilter === 'Todos'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    Todos
                </button>
                {categories.map(cat => {
                    const style = getCategoryStyles('', cat.id);
                    const isDefault = cat.id.startsWith('default-');
                    const isActive = selectedFilter === cat.id && !isManagingCategories;
                    const isConfirming = confirmDeleteId === cat.id;

                    return (
                        <div key={cat.id} className="relative group flex items-center">
                            <button
                                onClick={(e) => {
                                    if (isManagingCategories) {
                                        if (isConfirming) {
                                            setConfirmDeleteId(null);
                                        } else {
                                            startEditing(cat, e);
                                        }
                                    } else {
                                        setSelectedFilter(cat.id);
                                    }
                                }}
                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all border flex items-center gap-2 ${isActive
                                    ? `${style.fill} text-white border-transparent shadow-lg`
                                    : `bg-white ${style.text} ${style.border} hover:${style.bg}`
                                    } ${isManagingCategories ? 'pr-8' : ''} ${isConfirming ? 'border-red-600 bg-red-600 text-white animate-pulse' : ''}`}
                            >
                                {isConfirming ? 'Confirmar?' : cat.name}
                                {isManagingCategories && !isConfirming && (
                                    <div className="flex items-center gap-1 ml-1">
                                        <Edit2 className="w-3 h-3 opacity-50" />
                                    </div>
                                )}
                            </button>
                            {isManagingCategories && !isDefault && (
                                <div className="absolute top-1/2 -right-1 -translate-y-1/2 flex items-center gap-1">
                                    {isConfirming ? (
                                        <div className="flex bg-white rounded-full shadow-lg border border-red-100 p-0.5 z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCategory(cat.id);
                                                    setConfirmDeleteId(null);
                                                }}
                                                className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                                                title="Confirmar Exclusão"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmDeleteId(null);
                                                }}
                                                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                                title="Cancelar"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDeleteId(cat.id);
                                            }}
                                            className="bg-red-600 text-white rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100"
                                            title="Excluir Categoria"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Additional Add Button in Filters */}
                {!readOnly && (
                    <button
                        onClick={() => { setIsManagingCategories(true); setEditingCategory(null); setNewCategoryName(''); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all font-bold"
                        title="Adicionar Nova Categoria"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>


            {/* Editing Technique Modal */}
            {editingTechnique && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingTechnique(null)}></div>
                    <form onSubmit={handleUpdateSubmit} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in duration-300 isolate">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Editar Técnica</h3>
                            <button type="button" onClick={() => setEditingTechnique(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Título da Técnica</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Link (Instagram ou YouTube)</label>
                                <input
                                    type="url"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Categoria</label>
                                <select
                                    value={newCategoryId}
                                    onChange={(e) => setNewCategoryId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-white"
                                >
                                    <option value="">Outros</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={() => setEditingTechnique(null)}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {filteredTechniques.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 italic text-gray-400">
                    <p>Nenhuma técnica cadastrada nesta categoria. Comece adicionando uma agora!</p>
                </div>
            ) : (
                <>
                    {selectedFilter === 'Todos' && groupedTechniques ? (
                        <div className="space-y-12">
                            {(Object.entries(groupedTechniques) as [string, Technique[]][]).map(([categoryName, groupTechs]) => {
                                // Only render if group has items
                                if (groupTechs.length === 0) return null;

                                // Find style for this category
                                const sampleTech = groupTechs[0];
                                const style = getCategoryStyles(categoryName, sampleTech.category_id);

                                return (
                                    <div key={categoryName}>
                                        <div
                                            className="flex items-center gap-3 mb-6 group cursor-pointer"
                                            onClick={() => toggleCategory(categoryName)}
                                        >
                                            <div className={`w-2 h-8 rounded-full ${style.fill}`}></div>
                                            <h3 className="text-lg font-black uppercase tracking-widest text-gray-900">{categoryName}</h3>
                                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{groupTechs.length}</span>

                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ml-2 ${expandedCategories.has(categoryName) ? 'bg-red-600 rotate-180' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                                <ChevronDown className={`w-3 h-3 ${expandedCategories.has(categoryName) ? 'text-white' : 'text-gray-500'}`} />
                                            </div>

                                            {(() => {
                                                const catObj = categories.find(c => c.name === categoryName);
                                                const isDefault = catObj?.id.startsWith('default-');
                                                if (catObj && !isDefault) {
                                                    return (
                                                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                onClick={(e) => startEditing(catObj, e)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Editar Categoria"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteCategory(catObj.id, e)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Excluir Categoria"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        <div className={`transition-all duration-500 overflow-hidden ${expandedCategories.has(categoryName) ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {groupTechs.map((tech) => (
                                                    <div key={tech.id} className="group relative bg-white rounded-2xl border border-gray-100 p-1 hover:border-transparent hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden">
                                                        <div className={`h-1.5 w-12 rounded-full absolute -top-[1px] left-8 ${style.fill} z-10`}></div>

                                                        <div className="p-4 flex flex-col h-full animate-in fade-in duration-300">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className={`p-3 rounded-2xl ${style.bg} ${style.text} group-hover:scale-110 transition-transform duration-500`}>
                                                                    {getPlatformIcon(tech.platform)}
                                                                </div>
                                                                {!readOnly && (
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                        <button
                                                                            onClick={() => startEditingTechnique(tech)}
                                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                            title="Editar Técnica"
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => onDeleteTechnique(tech.id)}
                                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                            title="Excluir Técnica"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2 pr-6">
                                                                {tech.title}
                                                            </h3>

                                                            <div className="mt-auto pt-4 flex items-center justify-between">
                                                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-md ${style.bg} ${style.text}`}>
                                                                    {tech.category}
                                                                </span>
                                                                {tech.platform !== 'other' ? (
                                                                    <button
                                                                        onClick={() => setSelectedVideo(tech)}
                                                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:gap-3 transition-all"
                                                                    >
                                                                        Assistir <Play className="w-3 h-3 fill-current" />
                                                                    </button>
                                                                ) : (
                                                                    <a
                                                                        href={tech.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                                                    >
                                                                        Link Externo
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTechniques.map((tech) => {
                                const style = getCategoryStyles(tech.category, tech.category_id);
                                return (
                                    <div key={tech.id} className="group relative bg-white rounded-2xl border border-gray-100 p-1 hover:border-transparent hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden">
                                        <div className={`h-1.5 w-12 rounded-full absolute -top-[1px] left-8 ${style.fill} z-10`}></div>

                                        <div className="p-4 flex flex-col h-full animate-in fade-in duration-300">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-2xl ${style.bg} ${style.text} group-hover:scale-110 transition-transform duration-500`}>
                                                    {getPlatformIcon(tech.platform)}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => startEditingTechnique(tech)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Editar Técnica"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteTechnique(tech.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Excluir Técnica"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2 pr-6">
                                                {tech.title}
                                            </h3>

                                            <div className="mt-auto pt-4 flex items-center justify-between">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-md ${style.bg} ${style.text}`}>
                                                    {tech.category}
                                                </span>
                                                {tech.platform !== 'other' ? (
                                                    <button
                                                        onClick={() => setSelectedVideo(tech)}
                                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:gap-3 transition-all"
                                                    >
                                                        Assistir <Play className="w-3 h-3 fill-current" />
                                                    </button>
                                                ) : (
                                                    <a
                                                        href={tech.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                                    >
                                                        Link Externo
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl cursor-default"
                        onClick={() => setSelectedVideo(null)}
                    ></div>

                    <div className="relative w-full max-w-5xl h-full flex flex-col isolate">
                        {/* Header Info (Stays at the top) */}
                        <div className="flex items-start justify-between mb-4 md:mb-8">
                            <div className="space-y-1 md:space-y-2">
                                <span className={`inline-block text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full ${getCategoryStyles(selectedVideo.category, selectedVideo.category_id).fill} text-white shadow-lg`}>
                                    {selectedVideo.category}
                                </span>
                                <h2 className="text-xl md:text-4xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl leading-none">
                                    {selectedVideo.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="p-3 bg-white/5 hover:bg-red-600 text-white rounded-full transition-all border border-white/10 backdrop-blur-md shadow-2xl flex-shrink-0"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Player Container (Takes remaining space) */}
                        <div className="flex-grow flex items-center justify-center min-h-0">
                            <div className={`
                                w-full h-full flex items-center justify-center
                                ${selectedVideo.platform === 'instagram' ? 'max-h-full' : 'aspect-video'}
                            `}>
                                {getEmbedUrl(selectedVideo) ? (
                                    <div className={`
                                        relative bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 w-full h-full
                                        ${selectedVideo.platform === 'instagram' ? 'max-w-full md:max-w-[450px]' : ''}
                                    `}>
                                        <iframe
                                            src={getEmbedUrl(selectedVideo)!}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 backdrop-blur-md p-12 rounded-[2rem] border border-white/10 text-center space-y-6 max-w-md">
                                        <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto border border-red-600/30">
                                            <Video className="w-10 h-10 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-xl mb-2">Link Externo</h3>
                                            <p className="text-slate-400 text-sm">Este vídeo não permite visualização direta. Deseja abrir na plataforma original?</p>
                                        </div>
                                        <a
                                            href={selectedVideo.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                                        >
                                            Abrir no {selectedVideo.platform === 'instagram' ? 'Instagram' : 'YouTube'}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Branding/Footer */}
                        <div className="mt-4 md:mt-8 opacity-20 text-center flex-shrink-0">
                            <span className="text-white text-[10px] font-black uppercase tracking-[1em] ml-[1em] whitespace-nowrap">GB ANDRADAS</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
