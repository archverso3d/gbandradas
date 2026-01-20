import React, { useState, useEffect } from 'react';
import { adminService, StudentProfile } from '../services/admin';
import { User, Shield, Users, Award, Users2 } from 'lucide-react';

const CATEGORIES = ['GB K', 'GB1', 'GB2', 'GB F'];

const PROGRAM_DESCRIPTIONS: Record<string, string> = {
    'GB1': `O Programa Fundamental de Treinamento de Jiu-jitsu da Gracie Barra, GB1, ensina os princípios básicos da defesa pessoal para pessoas como você. É no GB1 que você dará os primeiros passos em direção à faixa preta.

A estrutura do GB1 reúne um conjunto fundamental de técnicas de Jiu-Jitsu que foram combinadas e cuidadosamente pensadas para garantir a prática segura e para otimizar o seu aprendizado. Os lutadores e indivíduos que conseguem um desempenho extraordinário seguem um conjunto comum de princípios que sustentam o seu sucesso. A prática de Jiu-Jitsu na Gracie Barra permite que as pessoas entendam estes princípios através de um processo fascinante que combina instrução, observação, prática, feedback apropriado, treino livre e competição. Os alunos experimentam resultados que vão além de ganhos em habilidades de força, flexibilidade, fitness, ou defesa pessoal.`,
    'GB2': `A Estrutura pedagógica da Gracie Barra define três principais etapas de desenvolvimento para os alunos: os Programas GB1, GB2 e GB3. Estes estágios indicam níveis de maturidade diferentes e os alunos evoluem de um para o outro numa progressão natural.

Enquanto o Programa GB1 foca nos alicerces e princípios básicos do Jiu-Jitsu, o Programa GB2 é baseado em técnicas mais elaboradas e práticas que começam a moldar o jogo dos alunos através do desenvolvimento de reflexos, velocidade e tempo de reação, bem como transições entre uma técnica e outra. Depois de alguns meses, os alunos tipicamente experimentam um maior entendimento da filosofia GB, uma ligação mais forte com os parceiros de treino, bem como mais disciplina e compromisso com hábitos saudáveis que levam a uma boa forma física.`,
    'GB F': `O Mestre Carlos afirmou que as mulheres “são fortes e apoiam umas às outras melhor do que nós mesmos” e que “precisamos preparar nossas ferramentas para ensinar Jiu-Jitsu a [mais] mulheres”.

Um programa projetado para atender às necessidades de aprendizagem específicas das mulheres que desejam começar o Jiu-Jitsu.

Completo com currículo e mensagens de empoderamento, este programa tem como objetivo introduzir o Jiu-Jitsu, incentivando mais mulheres a começarem sua jornada e garantir que continuem nela por mais tempo!`,
    'GB K': `Para atingir excelência em qualquer empreitada, é necessário um forte conjunto de valores e um caráter sólido que lhe conceda a perseverança para buscar os seus objetivos.

O Programa GB Kids foi criado para proporcionar às crianças na faixa etária dos 3 aos 15 anos um ambiente que lhes permita experimentar e compreender valores essenciais como foco, disciplina, persistência, cooperação e respeito. Tudo isso sob supervisão e num ambiente seguro e ao mesmo tempo desafiador, que diariamente contribui para o amadurecimento. Assim, nossos pequenos não serão apenas campeões nos tatames, mas irão se tornar campeões na vida.

A disciplina e excelência exigidos pelos nossos instrutores reflete positivamente nas crianças e adolescentes, que irão entender a importância de boa alimentação, da ajuda aos colegas, da dedicação, entre tantos outros valores presentes no Jiu-Jitsu GB.`
};

const MuralAlunos: React.FC = () => {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({ kids: true, adults: true });

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const data = await adminService.getAllStudents();
                setStudents(data);
            } catch (error) {
                console.error('Error loading students:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStudents();
    }, []);

    const groupedStudents = CATEGORIES.reduce((acc, cat) => {
        if (cat === 'GB K') {
            // Include legacy 'GB K' and all subcategories
            acc[cat] = students.filter(s => s.student_category === 'GB K' || ['MC', 'PC1', 'PC2', 'Juniors'].includes(s.student_category || ''));
        } else {
            acc[cat] = students.filter(s => s.student_category === cat);
        }
        return acc;
    }, {} as Record<string, StudentProfile[]>);

    const uncategorized = students.filter(s => {
        const cat = s.student_category;
        if (!cat) return true;

        const isStandard = CATEGORIES.includes(cat);
        const isGbKSub = ['MC', 'PC1', 'PC2', 'Juniors'].includes(cat);

        return !isStandard && !isGbKSub;
    });

    const toggleSection = (section: 'kids' | 'adults') => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const kidsCount = (groupedStudents['GB K']?.length || 0);
    const adultsCount = (groupedStudents['GB1']?.length || 0) + (groupedStudents['GB2']?.length || 0) + (groupedStudents['GB F']?.length || 0);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
    );

    const renderCategory = (category: string) => (
        <div key={category} className="scroll-mt-32">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-2xl transform -rotate-3 border-2 border-red-600 shadow-xl">
                        <span className="text-white font-black text-2xl italic">{category.replace('GB ', '')}</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                            {category}
                        </h2>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">{groupedStudents[category]?.length || 0} Membros Ativos</p>
                    </div>
                </div>
                <div className="hidden md:block h-px flex-grow bg-slate-100 ml-12"></div>
            </div>

            {PROGRAM_DESCRIPTIONS[category] && (
                <div className="mb-12 max-w-4xl mx-auto text-center">
                    <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed whitespace-pre-line">
                        {PROGRAM_DESCRIPTIONS[category]}
                    </p>
                </div>
            )}

            {groupedStudents[category]?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {groupedStudents[category].map((student) => (
                        <StudentCard key={student.user_id} student={student} />
                    ))}
                </div>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <p className="text-slate-400 font-medium italic">Nenhum aluno cadastrado nesta categoria ainda.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white pt-40 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center justify-center space-x-2 bg-red-50 px-4 py-2 rounded-full mb-6 border border-red-100">
                        <Users2 className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-black uppercase tracking-widest text-[10px]">Nossa Família</span>
                    </div>
                    <h1 className="text-4xl md:text-8xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.85]">
                        Mural de <span className="text-red-600">Alunos</span>
                    </h1>
                    <p className="mt-8 text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                        Estes são os guerreiros e guerreiras que constroem o legado da <span className="text-slate-900 font-bold">Gracie Barra Andradas</span> todos os dias no tatame.
                    </p>
                </div>

                <div className="space-y-20">
                    {/* Programas de Kids */}
                    <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100/50 shadow-sm">
                        <button
                            onClick={() => toggleSection('kids')}
                            className="w-full flex items-center justify-between group mb-8 focus:outline-none"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-2xl border-2 border-red-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white font-black text-2xl italic">K</span>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-red-600 transition-colors">
                                        PROGRAMAS DE KIDS
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{kidsCount} ALUNOS MATRICULADOS</p>
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${expandedSections.kids ? 'bg-red-600 rotate-180' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                                <Users2 className={`w-6 h-6 ${expandedSections.kids ? 'text-white' : 'text-slate-500'}`} />
                            </div>
                        </button>

                        <div className={`space-y-20 transition-all duration-500 overflow-hidden ${expandedSections.kids ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
                            {renderCategory('GB K')}
                        </div>
                    </div>

                    {/* Programas de Adultos */}
                    <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100/50 shadow-sm">
                        <button
                            onClick={() => toggleSection('adults')}
                            className="w-full flex items-center justify-between group mb-8 focus:outline-none"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-2xl border-2 border-red-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white font-black text-2xl italic">GB</span>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-red-600 transition-colors">
                                        PROGRAMAS DE ADULTOS
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{adultsCount} ALUNOS MATRICULADOS</p>
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${expandedSections.adults ? 'bg-red-600 rotate-180' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                                <Users2 className={`w-6 h-6 ${expandedSections.adults ? 'text-white' : 'text-slate-500'}`} />
                            </div>
                        </button>

                        <div className={`space-y-20 transition-all duration-500 overflow-hidden ${expandedSections.adults ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
                            {['GB1', 'GB2', 'GB F'].map(renderCategory)}
                        </div>
                    </div>

                    {uncategorized.length > 0 && (
                        <div className="mt-32 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <div className="flex items-center gap-4 mb-10">
                                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Aguardando Categoria</h2>
                                <div className="h-px flex-grow bg-slate-200"></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {uncategorized.map((student) => (
                                    <StudentCard key={student.user_id} student={student} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StudentCard: React.FC<{ student: StudentProfile }> = ({ student }) => {
    const beltColorClass = student.current_belt.toLowerCase().includes('blue') ? 'bg-blue-600' :
        student.current_belt.toLowerCase().includes('purple') ? 'bg-purple-600' :
            student.current_belt.toLowerCase().includes('brown') ? 'bg-amber-800' :
                student.current_belt.toLowerCase().includes('black') ? 'bg-slate-900' :
                    student.current_belt.toLowerCase().includes('gray') ? 'bg-slate-400' :
                        student.current_belt.toLowerCase().includes('yellow') ? 'bg-yellow-400' :
                            student.current_belt.toLowerCase().includes('orange') ? 'bg-orange-500' :
                                student.current_belt.toLowerCase().includes('green') ? 'bg-green-600' :
                                    'bg-slate-200';

    return (
        <div className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500">
            <div className="relative mb-4">
                <div className="aspect-square rounded-2xl bg-slate-50 overflow-hidden border-2 border-slate-50 flex items-center justify-center">
                    {student.avatar_url ? (
                        <img src={student.avatar_url} alt={student.full_name || ''} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <User className="w-12 h-12 text-slate-200" />
                    )}
                </div>
                {/* Belt Rank Overlay */}
                <div className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-xl border-2 border-white shadow-lg flex items-center gap-2 ${beltColorClass}`}>
                    <Award className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-tight">
                        {student.degrees > 0 ? `${student.degrees} GRAU${student.degrees > 1 ? 'S' : ''}` : '0 GRAUS'}
                    </span>
                </div>
            </div>

            <div className="text-center">
                <h3 className="font-black text-slate-900 uppercase italic tracking-tighter truncate text-sm mb-1 group-hover:text-red-600 transition-colors">
                    {student.full_name || 'Desconhecido'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {student.current_belt}
                </p>
            </div>
        </div>
    );
};

export default MuralAlunos;
