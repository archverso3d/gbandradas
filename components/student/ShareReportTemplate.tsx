import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { Award, Calendar, Target, Activity, Flame, Clock, BookOpen, Swords } from 'lucide-react';
import { curriculumData } from '../../constants/curriculumData';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'excused';
    classLabel?: string;
    weekNumber?: number;
}

interface ShareReportTemplateProps {
    userName: string;
    userAvatar?: string;
    currentBelt: string;
    degrees: number;
    startDate: string;
    attendanceData: AttendanceRecord[];
}

export const ShareReportTemplate = React.forwardRef<HTMLDivElement, ShareReportTemplateProps>(({
    userName,
    userAvatar,
    currentBelt,
    degrees,
    startDate,
    attendanceData
}, ref) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Chart Logic (Simplified from TrainingFocusChart)
    const chartData = useMemo(() => {
        const isPresent = (status: string | undefined) => {
            if (!status) return false;
            const s = status.toLowerCase();
            return s === 'present' || s === 'presente' || s === 'a' || s === 'b' || s === 'n' || s === 'p';
        };

        const getYearWeek = (dateStr: string) => {
            const d = new Date(dateStr + 'T12:00:00');
            const target = new Date(d.valueOf());
            const dayNr = (d.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            const firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
                target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            }
            const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
            return `${target.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
        };

        const presentRecords = attendanceData.filter(r => isPresent(r.status));
        const counts = { gb1: { guarda: 0, imobilizacao: 0, montada: 0, costas: 0 }, gb2: { guardaBaixo: 0, guardaCima: 0, imobilizacao: 0, montada: 0, costas: 0 } };

        presentRecords.forEach(record => {
            const weekId = getYearWeek(record.date);
            const weekNum = Number(weekId.split('-')[1]);
            const label = (record.classLabel || '').toUpperCase();
            const weekData = curriculumData.find(w => w.week === weekNum);
            if (!weekData) return;

            const processLesson = (lessonGB1: any, lessonGB2: any) => {
                if (lessonGB1?.treinoEspecifico) {
                    const tGB1 = lessonGB1.treinoEspecifico.toUpperCase();
                    if (tGB1.includes('GUARDA')) counts.gb1.guarda++;
                    if (tGB1.includes('IMOBILIZAÇÃO')) counts.gb1.imobilizacao++;
                    if (tGB1.includes('MONTADA')) counts.gb1.montada++;
                    if (tGB1.includes('COSTAS')) counts.gb1.costas++;
                }
                if (lessonGB2?.treinoEspecifico) {
                    const tGB2 = lessonGB2.treinoEspecifico.toUpperCase();
                    if (tGB2.includes('GUARDA POR BAIXO')) counts.gb2.guardaBaixo++;
                    else if (tGB2.includes('GUARDA POR CIMA')) counts.gb2.guardaCima++;
                    else if (tGB2.includes('GUARDA')) counts.gb2.guardaBaixo++;
                    if (tGB2.includes('IMOBILIZAÇÃO')) counts.gb2.imobilizacao++;
                    if (tGB2.includes('MONTADA')) counts.gb2.montada++;
                    if (tGB2.includes('COSTAS')) counts.gb2.costas++;
                }
            };
            if (label.includes('A')) processLesson(weekData.gb1.lessonA, weekData.gb2.lessonA);
            if (label.includes('B')) processLesson(weekData.gb1.lessonB, weekData.gb2.lessonB);
        });

        return [
            { subject: 'Guarda', A: counts.gb1.guarda + counts.gb2.guardaBaixo, B: counts.gb2.guardaCima },
            { subject: 'Imob. Lat.', A: counts.gb1.imobilizacao, B: counts.gb2.imobilizacao },
            { subject: 'Montada', A: counts.gb1.montada, B: counts.gb2.montada },
            { subject: 'Costas', A: counts.gb1.costas, B: counts.gb2.costas }
        ];
    }, [attendanceData]);

    const stats = useMemo(() => {
        const presentRecords = attendanceData.filter(a => ['present', 'presente', 'a', 'b', 'n', 'p'].includes(a.status.toLowerCase()));
        const total = presentRecords.length;

        const performance = Math.round((total / Math.max(1, attendanceData.length)) * 100);

        // Simple streak for share
        let streak = 0;
        const weeksMap = new Set<string>();
        presentRecords.forEach(record => {
            const date = new Date(record.date + 'T12:00:00');
            const target = new Date(date.valueOf());
            const dayNr = (date.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            const firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
            weeksMap.add(`${target.getFullYear()}-${weekNum}`);
        });

        let cursorDate = new Date();
        cursorDate.setHours(12, 0, 0, 0);
        for (let i = 0; i < 52; i++) {
            const target = new Date(cursorDate.valueOf());
            const dayNr = (cursorDate.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            const firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
            const weekId = `${target.getFullYear()}-${weekNum}`;
            if (weeksMap.has(weekId)) streak++;
            else if (i !== 0) break;
            cursorDate.setDate(cursorDate.getDate() - 7);
        }

        return { total, performance, streak };
    }, [attendanceData]);

    const getBeltColors = (belt: string) => {
        const b = belt.toLowerCase();
        if (b.includes('branca') || b.includes('white')) return { bg: 'bg-white', text: 'text-slate-800', border: 'border-slate-200', primary: '#cbd5e1' };
        if (b.includes('azul') || b.includes('blue')) return { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', primary: '#3b82f6' };
        if (b.includes('roxa') || b.includes('purple')) return { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700', primary: '#a855f7' };
        if (b.includes('marrom') || b.includes('brown')) return { bg: 'bg-[#6D4C41]', text: 'text-white', border: 'border-[#4E342E]', primary: '#795548' };
        if (b.includes('preta') || b.includes('black')) return { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', primary: '#0f172a' };
        return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700', primary: '#ef4444' };
    };

    const beltStyle = getBeltColors(currentBelt);

    const learnedTechniques = useMemo(() => {
        const isPresent = (status: string | undefined) => {
            if (!status) return false;
            const s = status.toLowerCase();
            return s === 'present' || s === 'presente' || s === 'a' || s === 'b' || s === 'n' || s === 'p';
        };

        const getYearWeek = (dateStr: string) => {
            const d = new Date(dateStr + 'T12:00:00');
            const target = new Date(d.valueOf());
            const dayNr = (d.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            const firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
                target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            }
            const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
            return `${target.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
        };

        const presentRecords = attendanceData.filter(r => isPresent(r.status));
        const learnedMap = new Map<string, Set<string>>();

        presentRecords.forEach(record => {
            const weekId = getYearWeek(record.date);
            const weekNum = Number(weekId.split('-')[1]);
            const label = (record.classLabel || '').toUpperCase();

            const weekData = curriculumData.find(w => w.week === weekNum);
            if (!weekData) return;

            const extract = (items: string[], prog: 'GB1' | 'GB2') => {
                items.forEach(item => {
                    const match = item.match(/^(\d+)\./);
                    if (match) {
                        const num = match[1];
                        if (!learnedMap.has(num)) learnedMap.set(num, new Set());
                        learnedMap.get(num)!.add(prog);
                    }
                });
            };

            if (label.includes('A')) {
                extract(weekData.gb1.lessonA.defesaPessoal.items, 'GB1');
                extract(weekData.gb1.lessonA.jiuJitsuEsportivo.items, 'GB1');
                extract(weekData.gb2.lessonA.tecnicaQueda.items, 'GB2');
                extract(weekData.gb2.lessonA.tecnicaChao.items, 'GB2');
            }
            if (label.includes('B')) {
                extract(weekData.gb1.lessonB.defesaPessoal.items, 'GB1');
                extract(weekData.gb1.lessonB.jiuJitsuEsportivo.items, 'GB1');
                extract(weekData.gb2.lessonB.tecnicaQueda.items, 'GB2');
                extract(weekData.gb2.lessonB.tecnicaChao.items, 'GB2');
            }
        });

        const techList: any[] = [];
        const addedNumbers = new Set<string>();

        // Iterate through curriculum in order to keep consistent numbering display
        curriculumData.forEach(w => {
            const processItems = (items: string[], prog: string) => {
                items.forEach(item => {
                    const match = item.match(/^(\d+)\./);
                    if (match) {
                        const num = match[1];
                        if (learnedMap.has(num) && !addedNumbers.has(num)) {
                            techList.push({
                                number: num,
                                programs: Array.from(learnedMap.get(num)!)
                            });
                            addedNumbers.add(num);
                        }
                    }
                });
            };

            processItems(w.gb1.lessonA.defesaPessoal.items, 'GB1');
            processItems(w.gb1.lessonA.jiuJitsuEsportivo.items, 'GB1');
            processItems(w.gb1.lessonB.defesaPessoal.items, 'GB1');
            processItems(w.gb1.lessonB.jiuJitsuEsportivo.items, 'GB1');
            processItems(w.gb2.lessonA.tecnicaQueda.items, 'GB2');
            processItems(w.gb2.lessonA.tecnicaChao.items, 'GB2');
            processItems(w.gb2.lessonB.tecnicaQueda.items, 'GB2');
            processItems(w.gb2.lessonB.tecnicaChao.items, 'GB2');
        });

        return techList.reverse();
    }, [attendanceData]);

    const techStats = {
        totalGB1: learnedTechniques.filter(t => t.programs.includes('GB1')).length,
        totalGB2: learnedTechniques.filter(t => t.programs.includes('GB2')).length
    };

    // Sparring / Combates Stats
    // GB1: 2 treinos específicos por sessão | GB2: 3 lutas por sessão
    const sparringStats = useMemo(() => {
        const isAttendancePresent = (a: AttendanceRecord) =>
            ['present', 'presente', 'a', 'b', 'n', 'p'].includes(a.status.toLowerCase());

        const monthlySessions = attendanceData.filter(a => {
            if (!isAttendancePresent(a)) return false;
            const d = new Date(a.date + 'T12:00:00');
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        const yearlySessions = attendanceData.filter(a => {
            if (!isAttendancePresent(a)) return false;
            const d = new Date(a.date + 'T12:00:00');
            return d.getFullYear() === currentYear;
        }).length;

        const allTimeSessions = attendanceData.filter(isAttendancePresent).length;

        return {
            monthly: { gb1: monthlySessions * 2, gb2: monthlySessions * 3, total: monthlySessions * 5 },
            yearly: { total: yearlySessions * 5 },
            allTime: { gb1: allTimeSessions * 2, gb2: allTimeSessions * 3, total: allTimeSessions * 5 },
        };
    }, [attendanceData, currentMonth, currentYear]);

    // Calendar Grid
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const calendarDays = Array.from({ length: 35 }, (_, i) => {
        const dayNum = i - firstDay + 1;
        if (dayNum > 0 && dayNum <= daysInMonth) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isPresent = attendanceData.some(a => a.date === dateStr && ['present', 'presente', 'a', 'b', 'n', 'p'].includes(a.status.toLowerCase()));
            return { dayNum, isPresent };
        }
        return null;
    });

    return (
        <div
            ref={ref}
            className="w-[1080px] h-[1080px] bg-[#020617] text-white flex flex-col p-8 gap-[14px] relative overflow-hidden font-sans select-none"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' }}
        >
            {/* Background decorations */}
            <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

            {/* ━━ SECTION 1: Header — 62px
                Budget: 62+130+388+95+225+46=946px + 5×14px=70px → 1016px ✓ */}
            <div className="flex justify-between items-center shrink-0 overflow-hidden" style={{ height: '62px' }}>
                <div className="flex items-center gap-5">
                    <img src="/logo.png" alt="GB Logo" className="h-[58px] w-auto object-contain" />
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
                            Gracie Barra Andradas
                        </h1>
                        <p className="text-xs font-black text-red-500 tracking-[0.45em] uppercase italic mt-0.5">Jiu-Jitsu para Todos</p>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status em</p>
                    <p className="text-[28px] font-black italic uppercase text-white leading-none">{monthNames[currentMonth]} {currentYear}</p>
                </div>
            </div>

            {/* ━━ SECTION 2: User + Stats — 125px ━━ */}
            <div className="grid grid-cols-2 gap-4 shrink-0 overflow-hidden" style={{ height: '125px' }}>
                {/* User info */}
                <div className="relative bg-slate-800/60 rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-center px-7 py-3">
                    <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-red-600" style={{ borderRadius: '24px 0 0 24px' }} />
                    <div className="pl-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">Relatório do Aluno</p>
                        <h2 className="text-[30px] font-black italic tracking-tighter leading-none line-clamp-1 mt-1">{userName}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <div className={`px-5 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest italic ${beltStyle.bg} ${beltStyle.text}`}>
                                {currentBelt}
                            </div>
                            {degrees > 0 && (
                                <div className="flex gap-1">
                                    {Array.from({ length: degrees }).map((_, i) => (
                                        <div key={i} className="w-2 h-5 bg-white rounded-full border border-black/10" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Stat cards — bigger icons and text */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: <Flame className="w-10 h-10 text-red-500" />, value: stats.streak, label: 'Sem. Consecutivas' },
                        { icon: <Clock className="w-10 h-10 text-blue-500" />, value: stats.total, label: 'Aulas Realizadas' },
                        { icon: <Award className="w-10 h-10 text-yellow-500" />, value: `${stats.performance}%`, label: 'Aproveitamento' },
                    ].map((s, i) => (
                        <div key={i} className="bg-slate-800/60 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center overflow-hidden">
                            {s.icon}
                            <span className="text-3xl font-black italic leading-none mt-1.5">{s.value}</span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-tight px-2 mt-1.5">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ━━ SECTION 3: Técnicas Praticadas + Calendar — 360px ━━ */}
            <div className="grid grid-cols-5 gap-4 shrink-0 overflow-hidden" style={{ height: '360px' }}>

                {/* Técnicas Praticadas — spider chart (3 cols) */}
                {/* inner height: 388 - 48(p-6×2) = 340px body */}
                <div className="col-span-3 bg-slate-800/60 rounded-3xl border border-white/10 p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 shrink-0" style={{ height: '30px' }}>
                        <Target className="w-6 h-6 text-slate-400 shrink-0" />
                        <h3 className="text-xl font-black uppercase tracking-widest italic text-white/80 leading-none">Técnicas Praticadas</h3>
                    </div>
                    {/* body: (360 - 48) - 30(header) - 10(gap) = 272px */}
                    <div className="flex items-stretch gap-3 mt-[10px] overflow-hidden" style={{ height: '272px' }}>
                        {/* Radar chart with margin to prevent label clipping */}
                        <div style={{ flex: 5, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RadarChart
                                width={320}
                                height={272}
                                cx="50%" cy="50%" outerRadius="58%"
                                data={chartData}
                                margin={{ top: 28, right: 28, bottom: 28, left: 28 }}
                            >
                                <PolarGrid stroke="#ffffff" strokeOpacity={0.12} strokeWidth={2} />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 900 }}
                                />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke={beltStyle.primary}
                                    strokeWidth={5}
                                    fill={beltStyle.primary}
                                    fillOpacity={0.45}
                                    isAnimationActive={false}
                                />
                            </RadarChart>
                        </div>
                        {/* Volumes bar list */}
                        <div className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-2xl border border-white/5 overflow-hidden" style={{ flex: 3 }}>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-white/5 pb-2 shrink-0">Volumes</p>
                            {chartData.map(d => (
                                <div key={d.subject} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{d.subject}</span>
                                        <span className="text-[10px] font-black text-white italic leading-none">{d.A}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: `${Math.min(100, (d.A / 10) * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Frequência Calendar (2 cols) — bigger cells */}
                {/* inner h: 388 - 40(p-5×2) = 348px */}
                <div className="col-span-2 bg-slate-800/60 rounded-3xl border border-white/10 p-5 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 shrink-0" style={{ height: '30px' }}>
                        <Calendar className="w-6 h-6 text-slate-400 shrink-0" />
                        <h3 className="text-xl font-black uppercase tracking-widest italic text-white/80 leading-none">Frequência</h3>
                    </div>
                    {/* Grid: (360 - 40) - 30(hdr) - 10(gap) - 46(footer) - 10(gap) = 224px for 6 rows */}
                    <div className="mt-[10px] overflow-hidden" style={{ height: '224px' }}>
                        <div className="grid grid-cols-7" style={{ gap: '5px', alignContent: 'start' }}>
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                <div key={i} className="flex items-center justify-center text-[11px] font-black text-slate-500 uppercase" style={{ height: '30px' }}>{d}</div>
                            ))}
                            {calendarDays.map((d, i) => (
                                <div key={i} className="flex items-center justify-center" style={{ height: '36px' }}>
                                    {d ? (
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${d.isPresent
                                            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-md shadow-red-900/50'
                                            : 'text-slate-500 bg-white/5'
                                            }`}>
                                            {d.dayNum}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Sua Jornada — 46px */}
                    <div className="mt-[10px] border-t border-white/10 pt-3 flex justify-between items-center shrink-0 overflow-hidden" style={{ height: '46px' }}>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sua Jornada:</span>
                        <span className="text-sm font-black text-white italic">
                            {new Date(startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* ━━ SECTION 4: Sparrings / Combates — 95px ━━ */}
            <div className="bg-slate-800/60 rounded-3xl border border-white/10 px-7 py-0 flex items-center gap-6 shrink-0 overflow-hidden" style={{ height: '95px' }}>
                {/* Icon + Title */}
                <div className="flex items-center gap-3 shrink-0">
                    <Swords className="w-8 h-8 text-red-500" />
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Combates Realizados</p>
                        <p className="text-xl font-black italic uppercase text-white leading-none mt-0.5">Sparrings</p>
                    </div>
                </div>
                {/* Divider */}
                <div className="w-px bg-white/10 self-stretch mx-1" />
                {/* GB1 */}
                <div className="flex flex-col items-center text-center">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">GB1</span>
                    <span className="text-4xl font-black italic text-white leading-none mt-1">{sparringStats.monthly.gb1}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Treinos Esp.</span>
                </div>
                <div className="text-2xl font-black text-slate-700">+</div>
                {/* GB2 */}
                <div className="flex flex-col items-center text-center">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">GB2</span>
                    <span className="text-4xl font-black italic text-white leading-none mt-1">{sparringStats.monthly.gb2}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Lutas</span>
                </div>
                {/* Divider */}
                <div className="w-px bg-white/10 self-stretch mx-1" />
                {/* Total Mês */}
                <div className="flex flex-col items-center text-center">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.25em] leading-none">TOTAL</span>
                    <span className="text-5xl font-black italic leading-none mt-1 text-red-600">{sparringStats.monthly.total}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Combates este Mês</span>
                </div>
                {/* Divider */}
                <div className="w-px bg-white/10 self-stretch mx-1" />

                {/* Unified Journey Banner */}
                <div className="flex-1 flex justify-center px-4">
                    <div className="bg-red-600/5 px-8 py-2 rounded-[28px] border border-red-600/20 flex items-center gap-5 w-full">
                        <span className="text-[15px] font-black italic uppercase text-white tracking-tight leading-none whitespace-nowrap">
                            Eu já saí na porrada
                        </span>
                        <div className="bg-red-600 px-5 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/50 transform -rotate-1 shrink-0">
                            <span className="text-[34px] font-black italic text-white leading-none whitespace-nowrap">
                                {sparringStats.allTime.total} VEZES
                            </span>
                        </div>
                        <span className="text-[15px] font-black italic uppercase text-white tracking-tight leading-tight">
                            desde que comecei aqui
                        </span>
                    </div>
                </div>
            </div>


            {/* ━━ SECTION 5: Currículo Estudado — 258px ━━ */}
            <div className="bg-slate-800/60 rounded-[32px] border border-white/10 p-6 flex flex-col shrink-0 overflow-hidden" style={{ height: '258px' }}>
                {/* Header: 64px */}
                <div className="flex items-center justify-between shrink-0 overflow-hidden" style={{ height: '64px' }}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 p-3.5 rounded-2xl">
                            <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.35em] leading-none mb-1.5">Currículo</p>
                            <h3 className="text-[19px] font-black italic text-white/90 leading-tight">Você praticou as seguintes semanas do currículo:</h3>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-blue-600/20 px-5 py-2 rounded-2xl border border-blue-600/30 flex flex-col items-center justify-center min-w-[90px]">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">GB1</span>
                            <span className="text-2xl font-black italic leading-none">{techStats.totalGB1} <span className="text-base opacity-50 not-italic font-bold">/ 96</span></span>
                        </div>
                        <div className="bg-rose-600/20 px-5 py-2 rounded-2xl border border-rose-600/30 flex flex-col items-center justify-center min-w-[90px]">
                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">GB2</span>
                            <span className="text-2xl font-black italic leading-none">{techStats.totalGB2} <span className="text-base opacity-50 not-italic font-bold">/ 96</span></span>
                        </div>
                    </div>
                </div>
                {/* Chips: (258 - 48) - 64(header) - 16(mt-4) = 130px for ~3 rows */}
                <div className="flex flex-wrap gap-[8px] overflow-hidden content-start mt-4" style={{ height: '130px' }}>
                    {learnedTechniques.length === 0 ? (
                        <div className="w-full text-center py-4 text-slate-500 italic text-base">Nenhuma técnica registrada ainda</div>
                    ) : (
                        learnedTechniques.slice(0, 120).map((tech, idx) => {
                            const hasGB1 = tech.programs.includes('GB1');
                            const hasGB2 = tech.programs.includes('GB2');
                            let bgStyle = {};
                            let bgClass = '';

                            if (hasGB1 && hasGB2) {
                                bgStyle = {
                                    background: 'linear-gradient(135deg, #2563eb 50%, #be123c 50%)'
                                };
                            } else if (hasGB1) {
                                bgClass = 'bg-gradient-to-br from-blue-600 to-blue-800';
                            } else {
                                bgClass = 'bg-gradient-to-br from-rose-700 to-rose-900';
                            }

                            return (
                                <div
                                    key={idx}
                                    style={bgStyle}
                                    className={`w-[40px] h-[38px] rounded-[12px] flex items-center justify-center text-[15px] font-black text-white shrink-0 shadow-md border border-white/10 ${bgClass}`}
                                >
                                    {tech.number}
                                </div>
                            );
                        })
                    )}
                    {learnedTechniques.length > 120 && (
                        <div className="w-[40px] h-[38px] rounded-[12px] flex items-center justify-center text-[13px] font-black text-slate-400 bg-white/5 border border-white/10 shrink-0">
                            +{learnedTechniques.length - 120}
                        </div>
                    )}
                </div>
            </div>

            {/* ━━ SECTION 6: Footer — 46px ━━ */}
            <div className="flex justify-between items-center shrink-0 border-t border-white/10 pt-3 overflow-hidden" style={{ height: '46px' }}>
                <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic block leading-none">Escola Oficial</span>
                    <span className="text-xl font-black italic uppercase text-white tracking-tighter leading-tight">Andradas - MG</span>
                </div>
                <div className="flex items-center gap-5">
                    <div className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600 text-right leading-relaxed">
                        #EQUIPEGB #GBANDRADAS<br />#JIUJITSUPARATODOS
                    </div>
                    <img src="/logo.png" alt="GB Logo" className="w-9 h-9 object-contain" />
                </div>
            </div>
        </div>
    );
});

ShareReportTemplate.displayName = 'ShareReportTemplate';
