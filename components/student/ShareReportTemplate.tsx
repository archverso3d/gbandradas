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

    // Chart Logic — matches TrainingFocusChart.tsx exactly (6 axes, GB1 + GB2 series)
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
            { subject: 'Guarda (Geral GB1)', GB1: counts.gb1.guarda, GB2: null as number | null },
            { subject: 'Guarda (Por Baixo)', GB1: null as number | null, GB2: counts.gb2.guardaBaixo },
            { subject: 'Guarda (Por Cima)', GB1: null as number | null, GB2: counts.gb2.guardaCima },
            { subject: 'Imob. Lateral', GB1: counts.gb1.imobilizacao, GB2: counts.gb2.imobilizacao },
            { subject: 'Montada / Joelho', GB1: counts.gb1.montada, GB2: counts.gb2.montada },
            { subject: 'Costas / 4 Apoios', GB1: counts.gb1.costas, GB2: counts.gb2.costas }
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

    // Calendar Grid — 6 rows × 7 cols = 42 cells (safely fits any month, including
    // 31-day months starting on Friday/Saturday which would otherwise overflow 35 cells).
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const calendarDays = Array.from({ length: 42 }, (_, i) => {
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
            className="w-[1080px] h-[1920px] bg-[#020617] text-white flex flex-col p-8 gap-5 relative overflow-hidden font-sans select-none"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 30%, #020617 70%)' }}
        >
            {/* Background decorations */}
            <div className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] bg-red-600/15 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-200px] left-[-200px] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px]" />
            <div className="absolute top-[40%] left-[-100px] w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[120px]" />

            {/* ━━ SECTION 1: Header — 80px ━━ */}
            <div className="flex justify-between items-center shrink-0 overflow-hidden relative z-10" style={{ height: '80px' }}>
                <div className="flex items-center gap-5">
                    <img src="/logo.png" alt="GB Logo" className="h-[72px] w-auto object-contain drop-shadow-2xl" />
                    <div className="flex flex-col leading-none">
                        <h1 className="text-[34px] font-black italic tracking-tighter text-white uppercase leading-none">
                            Gracie Barra
                        </h1>
                        <h1 className="text-[34px] font-black italic tracking-tighter text-white uppercase leading-none mt-1">
                            Andradas
                        </h1>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                    <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none mb-2">Status em</p>
                    <p className="text-[38px] font-black italic uppercase text-white leading-none">{monthNames[currentMonth]} <span className="text-red-500">{currentYear}</span></p>
                </div>
            </div>

            {/* ━━ SECTION 2: User Hero Card + Stats — 280px ━━
                Two-column hero: left = identity (name/belt/degrees), right = stat trio rows
            */}
            <div className="relative bg-slate-800/60 rounded-[40px] border border-white/10 overflow-hidden flex shadow-2xl shrink-0 z-10" style={{ height: '280px' }}>
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-red-500 to-red-700" />
                <div className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px]" />

                {/* LEFT — identity */}
                <div className="pl-9 pr-6 py-6 flex flex-col justify-center relative" style={{ flex: '1.1' }}>
                    <p className="text-[15px] font-black uppercase tracking-[0.4em] text-red-500 italic leading-none">RELATÓRIO DO ALUNO</p>
                    <h2 className="text-[56px] font-black italic tracking-tighter leading-[0.95] line-clamp-2 mt-3 mb-4">{userName}</h2>
                    <div className="flex items-center gap-4">
                        <div className={`px-7 py-3 rounded-xl text-2xl font-black uppercase tracking-widest italic shadow-2xl ${beltStyle.bg} ${beltStyle.text}`}>
                            {currentBelt}
                        </div>
                        {degrees > 0 && (
                            <div className="flex gap-1.5">
                                {Array.from({ length: degrees }).map((_, i) => (
                                    <div key={i} className="w-3 h-9 bg-white rounded-full border border-black/20 shadow-2xl" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* divider */}
                <div className="w-px bg-white/10 my-8" />

                {/* RIGHT — stats column */}
                <div className="px-7 py-6 flex flex-col justify-center gap-4 relative" style={{ flex: '1' }}>
                    {[
                        { icon: <Flame className="w-10 h-10 text-orange-500" />, value: stats.streak, label: 'Sem. Consecutivas' },
                        { icon: <Clock className="w-10 h-10 text-blue-500" />, value: stats.total, label: 'Aulas Realizadas' },
                        { icon: <Award className="w-10 h-10 text-yellow-500" />, value: `${stats.performance}%`, label: 'Aproveitamento' },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-center shrink-0">
                                {s.icon}
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[40px] font-black italic text-white leading-none">{s.value}</span>
                                <span className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-400 leading-none mt-2">{s.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ━━ SECTION 3: Treinos Específicos — 560px ━━
                Matches the student-view TrainingFocusChart: 6 axes, 2 series (GB1 blue + GB2 purple).
                Internal budget (560 - py-6 48 = 512):
                  Title: 50 + mt-3 12 = 62
                  Body:  450 (radar 440 + volumes panel)
            */}
            <div className="bg-slate-800/60 rounded-[40px] border border-white/10 px-8 py-6 flex flex-col overflow-hidden shadow-2xl shrink-0 relative z-10" style={{ height: '560px' }}>
                <div className="flex items-center justify-between shrink-0" style={{ height: '46px' }}>
                    <div className="flex items-center gap-4">
                        <Target className="w-10 h-10 text-red-500 shrink-0" />
                        <h3 className="text-[30px] font-black uppercase tracking-[0.1em] italic text-white leading-none">Treinos Específicos</h3>
                    </div>
                    <div className="flex items-center gap-5 text-[15px] font-black uppercase tracking-[0.25em]">
                        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-blue-500" />GB1</span>
                        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-purple-500" />GB2</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-3 overflow-hidden flex-1">
                    {/* Radar Chart — 6 axes, GB1 + GB2 */}
                    <div style={{ flex: 1.4, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RadarChart
                            width={620}
                            height={440}
                            margin={{ top: 25, right: 80, bottom: 25, left: 80 }}
                            cx="50%" cy="50%" outerRadius="72%"
                            data={chartData}
                        >
                            <PolarGrid stroke="#ffffff" strokeOpacity={0.2} strokeWidth={1.5} />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={(props: any) => {
                                    const { payload, x, y, textAnchor } = props;
                                    const text: string = payload.value;
                                    let lines = [text];
                                    if (text.includes(' (')) {
                                        const parts = text.split(' (');
                                        lines = [parts[0], '(' + parts[1]];
                                    } else if (text.includes(' / ')) {
                                        const parts = text.split(' / ');
                                        lines = [parts[0], parts[1]];
                                    }
                                    return (
                                        <text x={x} y={y} textAnchor={textAnchor} fill="#e2e8f0" fontSize={20} fontWeight={900}>
                                            {lines.map((line, idx) => (
                                                <tspan x={x} dy={idx === 0 ? 0 : 22} key={idx}>{line}</tspan>
                                            ))}
                                        </text>
                                    );
                                }}
                            />
                            <Radar
                                name="Programa GB1"
                                dataKey="GB1"
                                stroke="#2563eb"
                                strokeWidth={5}
                                fill="#3b82f6"
                                fillOpacity={0.5}
                                isAnimationActive={false}
                            />
                            <Radar
                                name="Programa GB2"
                                dataKey="GB2"
                                stroke="#9333ea"
                                strokeWidth={5}
                                fill="#a855f7"
                                fillOpacity={0.5}
                                isAnimationActive={false}
                            />
                        </RadarChart>
                    </div>

                    {/* Volumes — 6 rows, two value columns (GB1 / GB2) */}
                    <div className="flex flex-col bg-slate-900/40 px-5 py-5 rounded-[28px] border border-white/5 overflow-hidden" style={{ flex: 1 }}>
                        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center pb-3 border-b border-white/10">
                            <span className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em]">Área</span>
                            <span className="text-[14px] font-black text-blue-400 uppercase tracking-widest w-12 text-right">GB1</span>
                            <span className="text-[14px] font-black text-purple-400 uppercase tracking-widest w-12 text-right">GB2</span>
                        </div>
                        {chartData.map(d => (
                            <div key={d.subject} className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center py-2.5 border-b border-white/5 last:border-b-0">
                                <span className="text-[16px] font-black text-slate-200 uppercase tracking-wider leading-tight">{d.subject}</span>
                                <span className="text-2xl font-black italic text-white w-12 text-right leading-none">
                                    {d.GB1 === null ? <span className="text-slate-700">—</span> : d.GB1}
                                </span>
                                <span className="text-2xl font-black italic text-white w-12 text-right leading-none">
                                    {d.GB2 === null ? <span className="text-slate-700">—</span> : d.GB2}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ━━ SECTION 5: Frequência (Calendar) — 520px ━━
                Internal budget (520 - py-5 40 = 480):
                  Title row:   46
                  Calendar:    372  (day labels 40 + 6 rows × 54 + small margin)
                  Footer row:  62   (border-t + content)
                  Total:       480
            */}
            <div className="bg-slate-800/60 rounded-[40px] border border-white/10 px-8 py-5 flex flex-col overflow-hidden shadow-2xl shrink-0 relative z-10" style={{ height: '520px' }}>
                <div className="flex items-center justify-between shrink-0" style={{ height: '46px' }}>
                    <div className="flex items-center gap-4">
                        <Calendar className="w-10 h-10 text-red-500 shrink-0" />
                        <h3 className="text-[30px] font-black uppercase tracking-[0.1em] italic text-white leading-none">Frequência</h3>
                    </div>
                    <div className="text-[14px] font-black text-slate-500 uppercase tracking-[0.3em]">{monthNames[currentMonth]} {currentYear}</div>
                </div>

                <div className="overflow-hidden flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-7 gap-1.5">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <div key={i} className="flex items-center justify-center text-2xl font-black text-slate-400 uppercase" style={{ height: '40px' }}>{d}</div>
                        ))}
                        {calendarDays.map((d, i) => (
                            <div key={i} className="flex items-center justify-center" style={{ height: '54px' }}>
                                {d ? (
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${d.isPresent
                                        ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_0_18px_rgba(220,38,38,0.55)] border border-red-400/40'
                                        : 'text-slate-500 bg-white/5'
                                        }`}>
                                        {d.dayNum}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center shrink-0 overflow-hidden" style={{ height: '58px' }}>
                    <span className="text-xl font-black text-slate-400 uppercase tracking-[0.25em]">Início da Jornada</span>
                    <span className="text-3xl font-black text-white italic">
                        {new Date(startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* ━━ SECTION 5: Sparrings — 260px ━━
                HERO STAT: total all-time vezes (left, huge).
                Secondary: monthly GB1/GB2/TOTAL strip (right, smaller).
            */}
            <div className="bg-slate-800/60 rounded-[40px] border border-white/10 px-8 py-5 flex flex-col overflow-hidden shadow-2xl shrink-0 relative z-10" style={{ height: '260px' }}>
                {/* Title row */}
                <div className="flex items-center justify-between shrink-0" style={{ height: '40px' }}>
                    <div className="flex items-center gap-4">
                        <Swords className="w-10 h-10 text-red-500 shrink-0" />
                        <h3 className="text-[30px] font-black uppercase tracking-[0.1em] italic text-white leading-none">Sparrings</h3>
                    </div>
                    <div className="text-[14px] font-black text-slate-500 uppercase tracking-[0.3em]">Combates Realizados</div>
                </div>

                {/* HERO + Monthly side-by-side */}
                <div className="flex items-center gap-6 flex-1 mt-2 overflow-hidden">
                    {/* HERO: total all-time */}
                    <div className="flex-1 bg-gradient-to-br from-red-600/20 via-red-600/10 to-transparent rounded-[28px] border border-red-600/30 px-7 py-4 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-[180px] h-[180px] bg-red-600/20 rounded-full blur-[60px]" />
                        <p className="text-[15px] font-black italic uppercase text-red-300/80 tracking-[0.25em] leading-none mb-1.5 relative">
                            Eu já saí na porrada
                        </p>
                        <p className="text-[15px] font-black italic uppercase text-red-300/80 tracking-[0.25em] leading-none relative">
                            desde que comecei
                        </p>
                        <div className="flex items-baseline gap-3 mt-2 relative">
                            <span className="text-[110px] font-black italic text-white leading-none tracking-tighter drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]">
                                {sparringStats.allTime.total}
                            </span>
                            <span className="text-[36px] font-black italic text-red-400 leading-none">VEZES</span>
                        </div>
                    </div>

                    {/* SECONDARY: monthly breakdown */}
                    <div className="bg-slate-900/40 rounded-[28px] border border-white/5 px-6 py-4 flex flex-col justify-center gap-2.5 shrink-0 w-[300px]">
                        <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.25em] text-center mb-1">Este Mês</p>
                        <div className="flex items-center justify-between">
                            <span className="text-base font-black text-blue-400 uppercase tracking-widest">GB1</span>
                            <span className="text-[26px] font-black italic text-white leading-none">{sparringStats.monthly.gb1}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-base font-black text-purple-400 uppercase tracking-widest">GB2</span>
                            <span className="text-[26px] font-black italic text-white leading-none">{sparringStats.monthly.gb2}</span>
                        </div>
                        <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                            <span className="text-base font-black text-red-500 uppercase tracking-widest">Total</span>
                            <span className="text-[34px] font-black italic text-red-500 leading-none">{sparringStats.monthly.total}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ━━ SECTION 7: Footer — 56px ━━ */}
            <div className="flex items-center justify-between shrink-0 overflow-hidden relative z-10" style={{ height: '56px' }}>
                <div className="flex flex-col leading-none">
                    <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Acompanhe sua evolução em</p>
                    <p className="text-2xl font-black italic text-white tracking-tight leading-tight mt-1.5">gbandradas.vercel.app</p>
                </div>
                <p className="text-lg font-black text-red-500 tracking-[0.35em] uppercase italic">Jiu-Jitsu para Todos</p>
            </div>
        </div>
    );
});

ShareReportTemplate.displayName = 'ShareReportTemplate';
