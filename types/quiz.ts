export enum Belt {
    BLUE = 'azul',
    PURPLE = 'roxa',
    BROWN = 'marrom',
    BLACK = 'preta'
}

export enum Module {
    POINTS = 'Pontuações e Vantagens',
    FOULS = 'Faltas e Punições',
    SITUATIONS = 'Situações Específicas',
    DIFFERENCES = 'Diferenças por Idade/Faixa',
    BASICS = 'Básicos e Critérios'
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    module: Module;
    belts: Belt[]; // Which belts this question applies to
    image?: string;
}

export interface QuizState {
    currentQuestionIndex: number;
    answers: number[];
    startTime: number;
    isFinished: boolean;
    questions: Question[];
}
