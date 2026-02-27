import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { curriculumData } from '../../constants/curriculumData';
import { Target, Activity } from 'lucide-react';
import { InstructionBalloon } from '../ui/InstructionBalloon';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'excused';
    classLabel?: string;
    weekNumber?: number;
}

interface TrainingFocusChartProps {
    attendanceData: AttendanceRecord[];
}

export const TrainingFocusChart: React.FC<TrainingFocusChartProps> = ({ attendanceData }) => {
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

    const isPresent = (status: string | undefined) => {
        if (!status) return false;
        const s = status.toLowerCase();
        return s === 'present' || s === 'presente' || s === 'a' || s === 'b' || s === 'n' || s === 'p';
    };

    const chartData = useMemo(() => {
        const presentRecords = attendanceData.filter(r => isPresent(r.status));

        const counts = {
            gb1: {
                guarda: 0,
                imobilizacao: 0,
                montada: 0,
                costas: 0
            },
            gb2: {
                guardaBaixo: 0,
                guardaCima: 0,
                imobilizacao: 0,
                montada: 0,
                costas: 0
            }
        };

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
                    else if (tGB2.includes('GUARDA')) counts.gb2.guardaBaixo++; // fallback

                    if (tGB2.includes('IMOBILIZAÇÃO')) counts.gb2.imobilizacao++;
                    if (tGB2.includes('MONTADA')) counts.gb2.montada++;
                    if (tGB2.includes('COSTAS')) counts.gb2.costas++;
                }
            };

            if (label.includes('A')) processLesson(weekData.gb1.lessonA, weekData.gb2.lessonA);
            if (label.includes('B')) processLesson(weekData.gb1.lessonB, weekData.gb2.lessonB);
        });

        return [
            { subject: 'Guarda (Geral GB1)', GB1: counts.gb1.guarda, GB2: null, fullMark: Math.max(counts.gb1.guarda, 5) },
            { subject: 'Guarda (Por Baixo)', GB1: null, GB2: counts.gb2.guardaBaixo, fullMark: Math.max(counts.gb2.guardaBaixo, 5) },
            { subject: 'Guarda (Por Cima)', GB1: null, GB2: counts.gb2.guardaCima, fullMark: Math.max(counts.gb2.guardaCima, 5) },
            { subject: 'Imob. Lateral', GB1: counts.gb1.imobilizacao, GB2: counts.gb2.imobilizacao, fullMark: Math.max(counts.gb1.imobilizacao, counts.gb2.imobilizacao, 5) },
            { subject: 'Montada / Joelho', GB1: counts.gb1.montada, GB2: counts.gb2.montada, fullMark: Math.max(counts.gb1.montada, counts.gb2.montada, 5) },
            { subject: 'Costas / 4 Apoios', GB1: counts.gb1.costas, GB2: counts.gb2.costas, fullMark: Math.max(counts.gb1.costas, counts.gb2.costas, 5) }
        ];
    }, [attendanceData]);

    // Format tooltip to not show null values
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#020617] p-3 rounded-[20px] shadow-2xl border-[3px] border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                    <p className="font-black text-[10px] text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-[0.2em] italic">{label}</p>
                    {payload.map((entry: any, index: number) => {
                        if (entry.value === null || entry.value === 0) return null;
                        return (
                            <div key={`item-${index}`} className="flex items-center gap-2 mb-1">
                                <span className="w-2.5 h-2.5 rounded-md shadow-sm" style={{ backgroundColor: entry.color }}></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                    {entry.name}: <span className="font-bold text-slate-900 dark:text-white drop-shadow-sm">{entry.value}</span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const CustomTick = ({ payload, x, y, textAnchor, stroke, radius }: any) => {
        const text = payload.value;
        let lines = [text];

        // Quebra linhas longas para melhorar a legibilidade
        if (text.includes(' (')) {
            const parts = text.split(' (');
            lines = [parts[0], '(' + parts[1]];
        } else if (text.includes(' / ')) {
            const parts = text.split(' / ');
            lines = [parts[0], parts[1]];
        }

        return (
            <text
                radius={radius}
                stroke={stroke}
                x={x}
                y={y}
                className="recharts-text recharts-polar-angle-axis-tick-value"
                textAnchor={textAnchor}
                fill="#64748b"
                fontSize={10}
                fontWeight="bold"
            >
                {lines.map((line, index) => (
                    <tspan x={x} dy={index === 0 ? 0 : 14} key={index}>
                        {line}
                    </tspan>
                ))}
            </text>
        );
    };

    return (
        <div className="mb-8 relative">
            <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 p-5 sm:p-6 transition-all hover:shadow-2xl relative group">
                <div className="p-0">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest italic drop-shadow-sm">
                                Treinos Especificos Realizados
                            </h2>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 relative">
                            <Target className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <InstructionBalloon
                                id="training-focus"
                                text="Acompanhe o foco dos seus treinos com este gráfico de teia. Veja onde você tem mais horas de tatame!"
                                position="bottom-right"
                                className="!z-[110]"
                            />
                        </div>
                    </div>

                    <div className="h-[300px] sm:h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                                <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={<CustomTick />}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 'auto']}
                                    tick={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }}
                                    iconType="circle"
                                />
                                <Radar
                                    name="Programa GB1"
                                    dataKey="GB1"
                                    stroke="#2563eb"
                                    strokeWidth={4}
                                    fill="#3b82f6"
                                    fillOpacity={0.4}
                                    animationBegin={200}
                                    animationDuration={1500}
                                />
                                <Radar
                                    name="Programa GB2"
                                    dataKey="GB2"
                                    stroke="#9333ea"
                                    strokeWidth={4}
                                    fill="#a855f7"
                                    fillOpacity={0.4}
                                    animationBegin={500}
                                    animationDuration={1500}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
