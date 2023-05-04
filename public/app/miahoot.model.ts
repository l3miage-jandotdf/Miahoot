export interface Miahoot {
    id: number;
    nom: string;
    questions: Question[];
}

export interface Question {
    id: number;
    label: string;
    answers: Reponse[];
}

export interface Reponse {
    id: number;
    label: string;
    estValide: boolean;
}