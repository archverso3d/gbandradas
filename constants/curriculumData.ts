export interface CurriculumLesson {
    title: string;
    items: string[];
}

export interface WeeklyProgram {
    week: number;
    gb1: {
        lessonA: {
            defesaPessoal: CurriculumLesson;
            jiuJitsuEsportivo: CurriculumLesson;
            treinoEducativo: CurriculumLesson;
            treinoEspecifico: string;
            topicos: string;
        };
        lessonB: {
            defesaPessoal: CurriculumLesson;
            jiuJitsuEsportivo: CurriculumLesson;
            treinoEducativo: CurriculumLesson;
            treinoEspecifico: string;
            topicos: string;
        };
    };
    gb2: {
        lessonA: {
            tecnicaQueda: CurriculumLesson;
            tecnicaChao: CurriculumLesson;
            treinoEspecifico: string;
        };
        lessonB: {
            tecnicaQueda: CurriculumLesson;
            tecnicaChao: CurriculumLesson;
            treinoEspecifico: string;
        };
    };
}

export const curriculumData: WeeklyProgram[] = [
    {
        week: 1,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["1. Saída da Imobilização Lateral com Socos + Reposição da Guarda + Levantada Técnica"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "2. Puxada para a Guarda Fechada Utilizando o Pé no Quadril",
                        "3. Raspagem da Tesoura"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Puxada para a Guarda + Raspagem da Tesoura (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "JIU-JITSU PARA TODOS"
            },
            lessonB: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["4. Saída da Montada com Socos + Utilizar a Ponte + Postura na Guarda"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "5. Estrangulamento em X da Guarda Fechada Com os Quatro Dedos Dentro da Gola",
                        "6. Estrangulamento em X da Guarda Fechada Com o Polegar Dentro da Gola"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Puxada para a Guarda + Estrangulamentos (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "JIU-JITSU PARA TODOS"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "PUXADA PARA GUARDA OU QUEDAS DE SACRIFÍCIO",
                    items: ["1. Contra Ataque da Single Leg"]
                },
                tecnicaChao: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "2. Raspagem com Gancho por Fora",
                        "3. Raspagem com Gancho por Fora (Variação)"
                    ]
                },
                treinoEspecifico: "GUARDA POR BAIXO"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "PUXADA PARA GUARDA OU QUEDAS DE SACRIFÍCIO",
                    items: ["4. Puxada para a Guarda Fechada"]
                },
                tecnicaChao: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "5. Single Leg da Guarda com Gancho por Fora",
                        "6. Raspagem com Gancho por Fora (Variação)"
                    ]
                },
                treinoEspecifico: "SPECIFIC TRAINING"
            }
        }
    },
    {
        week: 2,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["7. Saída da Gravata Lateral em Pé + Queda para Trás + Montada Técnica + Chave de Braço Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "8. Saída da Imobilização Lateral Recuperando a Guarda Fechada",
                        "9. Saída da Imobilização Lateral Quando o Oponente Bloqueia o Quadril e a Cabeça + Reposição de Guarda Passando a Perna Por Cima"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Saída da Imobilização Lateral (Repete)"]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL",
                topicos: "O ESCUDO VERMELHO"
            },
            lessonB: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["10. Saída da Montada com Socos + Utilizar a Ponte + Postura na Guarda"]
                },
                jiuJitsuEsportivo: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "11. Saída da Imobilização Lateral Indo para a Posição de Quatro Apoios",
                        "12. Double Leg da Posição de Quatro Apoios"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Saída da Imobilização Lateral Indo Para a Posição de Quatro Apoios + Double Leg + Imobilização Lateral Bloqueando o Ombro e o Quadril (Alterna)"]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL",
                topicos: "O ESCUDO VERMELHO"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "QUEDAS DE QUADRIL OU QUEDAS DE MÃO",
                    items: ["7. Arm Drag"]
                },
                tecnicaChao: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "8. Saída dos 100kg Controlando a Manga",
                        "9. Saída dos 100kg indo Para as Costas"
                    ]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "QUEDAS DE QUADRIL OU QUEDAS DE MÃO",
                    items: ["10. Queda de Quadril Cruzando o Braço"]
                },
                tecnicaChao: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "11. Montada dos 100kg",
                        "12. Ataque Duplo dos 100kg"
                    ]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL"
            }
        }
    },
    {
        week: 3,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["13. Esquiva do Jab + Double Leg"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "14. Abertura de Guarda Ajoelhado + Joelho Bloqueando o Quadril + Cotovelos Fechados",
                        "15. Passagem de Guarda Emborcando com Um Braço por Baixo + Imobilização Lateral Bloqueando o Quadril e Controlando o Ombro"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Imobilização Lateral + Montada + Saída da Montada Usando a Ponte (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "UNIFORME GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["16. Esquiva do Direto + Single Leg"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "17. Abertura de Guarda em Pé + Domínio da Manga Cruzada",
                        "18. Passagem de Guarda Cruzando o Joelho + Imobilização Lateral"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Imobilização Lateral + Montada + Saída da Montada Usando a Ponte (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "UNIFORME GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "CATADAS DE PERNA",
                    items: ["13. Single Leg"]
                },
                tecnicaChao: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "14. Passagem do Leg Drag da Guarda com Gancho por Fora",
                        "15. Leg Drag"
                    ]
                },
                treinoEspecifico: "GUARDA POR CIMA"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "CATADAS DE PERNA",
                    items: ["16. Single Leg com Passada de Pé"]
                },
                tecnicaChao: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "17. Passagem da Guarda com Gancho por Fora",
                        "18. Passagem da Guarda com Gancho por Fora (Variação)"
                    ]
                },
                treinoEspecifico: "GUARDA POR CIMA"
            }
        }
    },
    {
        week: 4,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "CLINCH & PEGADA",
                    items: ["19. Saída de Pegada na Gola Com Queda de Gancho por Fora + Chave de Braço Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "MONTADA / JOELHO NA BARRIGA",
                    items: [
                        "20. Saída da Montada com Gravata Usando a Ponte",
                        "21. Saída da Montada com Estrangulamento Usando a Ponte"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Saída da Montada com Estrangulamento Usando a Ponte + Abertura de Guarda Ajoelhado + Passar a Guarda + Imobilização + Montada (Alterna)"]
                },
                treinoEspecifico: "MONTADA / JOELHO NA BARRIGA",
                topicos: "IRMANDADE GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "CLINCH & PEGADA",
                    items: ["22. Saída do Estrangulamento pela Frente + Defesa de Joelhada + Esquiva do Jab + Cinturada + Transição Para a Montada"]
                },
                jiuJitsuEsportivo: {
                    title: "MONTADA / JOELHO NA BARRIGA",
                    items: [
                        "23. Saída da Montada Usando os Cotovelos Quando o Oponente Não Abre o Joelho + Reposição da Guarda Fechada",
                        "24. Saída do Joelho na Barriga + Empurrando o Nó da Faixa + Meia Levantada Técnica + Catada de Calcanhar"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Saída da Montada Usando os Cotovelos + Reposição da Guarda Fechada + Abertura de Guarda + Passagem De Guarda + Imobilização + Montada (Repete)"]
                },
                treinoEspecifico: "MONTADA / JOELHO NA BARRIGA",
                topicos: "IRMANDADE GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "QUEDAS DE PERNA",
                    items: ["19. Queda com Gancho por Fora"]
                },
                tecnicaChao: {
                    title: "MONTADA OU JOELHO NA BARRIGA",
                    items: [
                        "20. Arm Lock do Joelho na Barriga",
                        "21. Kimura do Joelho na Barriga"
                    ]
                },
                treinoEspecifico: "MONTADA OU JOELHO NA BARRIGA"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "QUEDAS DE PERNA",
                    items: ["22. Variação de Queda de Pé"]
                },
                tecnicaChao: {
                    title: "MONTADA OU JOELHO NA BARRIGA",
                    items: [
                        "23. Arm Lock da Montada",
                        "24. Estrangulamento em X da Montada"
                    ]
                },
                treinoEspecifico: "MONTADA OU JOELHO NA BARRIGA"
            }
        }
    },
    {
        week: 5,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["25. Defesa de Socos na Guarda Fechada + Controle da Distância + Domínio dos Braços + Chave de Braço Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "26. Raspagem Dominando os Calcanhares Quando o Oponente Fica Em Pé na Guarda Fechada",
                        "27. Raspagem do Garçom"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Raspagem Dominando os Calcanhares + Montada + Saída da Montada com Estrangulamento (Repete)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "O MÉTODO GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["28. Defesa de Socos na Guarda Fechada + Controle da Distância + Pedalada + Levantada Técnica"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "29. Raspagem do Tripé",
                        "30. Raspagem de Gancho por Fora Quando o Oponente Defende o Tripé"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Raspagem do Tripé + Meia Levantada Técnica + Guarda Fechada (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "O MÉTODO GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "PUXADA PARA GUARDA OU QUEDAS DE SACRIFÍCIO",
                    items: ["25. Queda de Sacrificio"]
                },
                tecnicaChao: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "26. Raspagem da Guarda Aranha",
                        "27. Ataque Triplo da Guarda Aranha"
                    ]
                },
                treinoEspecifico: "GUARDA POR BAIXO"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "PUXADA PARA GUARDA OU QUEDAS DE SACRIFÍCIO",
                    items: ["28. Puxada para a Guarda Aranha"]
                },
                tecnicaChao: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "29. Raspagem da Guarda Aranha",
                        "30. Raspagem da Guarda Aranha (Variação)"
                    ]
                },
                treinoEspecifico: "GUARDA POR BAIXO"
            }
        }
    },
    {
        week: 6,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["31. Saída de Gravata no Chão Afastando a Cabeça + Chave de Braço Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "COSTAS / QUATRO APOIOS",
                    items: [
                        "32. Reposição de Guarda na Posição de Quatro Apoios com o Oponente por Trás",
                        "33. Reposição de Guarda na Posição de Quatro Apoios com o Oponente pela Frente"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Recuperando a Guarda na Posição de Quatro Apoios com o Oponente por Trás + Finalização (Alterna)"]
                },
                treinoEspecifico: "COSTAS E QUATRO APOIOS",
                topicos: "O JIU-JITSU GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["34. Saída de Gravata no Chão Pegando as Costas + Chave de Ombro"]
                },
                jiuJitsuEsportivo: {
                    title: "COSTAS / QUATRO APOIOS",
                    items: [
                        "35. Saída das Costas Usando a Ponte + Imobilização Lateral por Cima",
                        "36. Saída das Costas Usando a Ponte + Evitando A Montada + Reposição de Guarda"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Saída das Costas Usando a Ponte + Imobilização Lateral por Cima + Transição Para a Montada (Alterna)"]
                },
                treinoEspecifico: "COSTAS E QUATRO APOIOS",
                topicos: "O JIU-JITSU GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "QUEDAS DE QUADRIL OU QUEDAS DE MÃO",
                    items: ["31. Queda de Quadril Varrendo as Duas Pernas"]
                },
                tecnicaChao: {
                    title: "COSTAS",
                    items: [
                        "32. Estrangulamento com o Oponente na Tartaruga",
                        "33. Pegada de Costas com o Oponente na Tartaruga"
                    ]
                },
                treinoEspecifico: "COSTAS"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "QUEDAS DE QUADRIL OU QUEDAS DE MÃO",
                    items: ["34. Variação de Queda de Mão"]
                },
                tecnicaChao: {
                    title: "COSTAS",
                    items: [
                        "35. Estrangulamento de Gola das Costas",
                        "36. Arm Lock das Costas"
                    ]
                },
                treinoEspecifico: "COSTAS"
            }
        }
    },
    {
        week: 7,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["37. Controle de Distância com o Braço + Pisão + Cinturada + Imobilização Lateral"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "38. Abertura de Guarda Ajoelhado + Passagem de Guarda com Volante com uma Mão na Calça",
                        "39. Passagem de Meia Guarda Usando o Gancho + Elevação de Quadril + Transição Para a Montada"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Imobilização Lateral (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "O ALUNO GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["40. Controle de Distância com o Braço + Jab + Direto + Double Leg"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "41. Passagem de Guarda Aranha Toreando com Volante + Imobilização Lateral",
                        "42. Passagem de Guarda Aranha Toreando com Quadril pra Frente + Imobilização Lateral"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Passagem de Guarda Aranha + Imobilização Lateral (Repete)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "O ALUNO GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "CATADAS DE PERNA",
                    items: ["37. Double Leg"]
                },
                tecnicaChao: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "38. Passagem de Guarda Aranha",
                        "39. Passagem de Guarda Aranha (Variação)"
                    ]
                },
                treinoEspecifico: "GUARDA POR CIMA"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "CATADAS DE PERNA",
                    items: ["40. Single Leg"]
                },
                tecnicaChao: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "41. Passagem de Guarda Laço",
                        "42. Passagem de Guarda Laço (Variação)"
                    ]
                },
                treinoEspecifico: "GUARDA POR CIMA"
            }
        }
    },
    {
        week: 8,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "CLINCH & PEGADA",
                    items: ["43. Bloqueio dos Socos Cruzados + Queda de Gravata + Chave de Braço Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "44. Transição para a Montada Trocando de Base Passando a Perna Por Cima",
                        "45. Estrangulamento com o Braço do Oponente Laçado"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abrir a Guarda + Passar a Guarda + Imobilização Lateral + Montada + Saída da Montada com Estrangulamento Usando a Ponte (Alterna)"]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL",
                topicos: "A FAIXA-PRETA GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "CLINCH & PEGADA",
                    items: ["46. Esquiva do Jab + Cinturada + Cinturada Passando Para as Costas + Controle do Braço + Queda para Frente"]
                },
                jiuJitsuEsportivo: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "47. Transição para a Montada Atravessando o Joelho na Barriga",
                        "48. Chave de Braço Reta Girando por Cima da cabeça"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abrir a Guarda + Passar a Guarda + Imobilização Lateral + Montada + Saída da Montada com Estrangulamento Usando a Ponte (Alterna)"]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL",
                topicos: "A FAIXA-PRETA GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "QUEDAS DE PERNA",
                    items: ["43. Varrida de Pé"]
                },
                tecnicaChao: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "44. Saída dos 100kg Indo para as Costas",
                        "45. Saída dos 100kg indo Para a Guarda Fechada"
                    ]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "QUEDAS DE PERNA",
                    items: ["46. Queda com Gancho por Dentro"]
                },
                tecnicaChao: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "47. Kimura dos 100kg",
                        "48. Estrangulamento dos 100kg"
                    ]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL"
            }
        }
    },
    {
        week: 9,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["49. Bloqueio de Socos na Posição de Quatro Apoios + Reposição de Guarda"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "50. Raspagem do Pêndulo",
                        "51. Chave de Braço Reta Quando o Oponente Defende a Raspagem do Pêndulo"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Raspagem do Pêndulo + Montada + Saída da Montada Usando os Cotovelos (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "HISTÓRIA DA GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["52. Bloqueio de Socos na posição de Joelho na Barriga + Ajoelhar Dando as Costas + Reposição de Guarda"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "53. Transição para as Costas da Guarda Fechada",
                        "54. Triângulo da Guarda Fechada Controlando a Manga e o Punho"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Saída da Imobilização Lateral Recuperando a Guarda Fechada + Finalização (Repete)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "HISTÓRIA DA GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "PUXADA PARA GUARDA OU QUEDAS DE SACRIFÍCIO",
                    items: ["49. Tornado"]
                },
                tecnicaChao: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "50. Raspagem da Meia X Controlando a Calça",
                        "51. Raspagem da Meia X com Levantada Técnica"
                    ]
                },
                treinoEspecifico: "GUARDA POR BAIXO"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "PUXADA PARA GUARDA OU QUEDAS DE SACRIFÍCIO",
                    items: ["52. Puxada para Meia X"]
                },
                tecnicaChao: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "53. Raspagem da Guarda X Controlando a Calça",
                        "54. Raspagem da Guarda X indo Para as Costas"
                    ]
                },
                treinoEspecifico: "GUARDA POR BAIXO"
            }
        }
    },
    {
        week: 10,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["55. Guilhotina em Pé"]
                },
                jiuJitsuEsportivo: {
                    title: "MONTADA / JOELHO NA BARRIGA",
                    items: [
                        "56. Estrangulamento em X da Montada Com os Quatro Dedos Dentro da Gola & Estrangulamento em X da Montada Com o Polegar Dentro da Gola",
                        "57. Montada Técnica + Estrangulamento de Duas Golas"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Transição para a Montada Técnica com a Mão na Gola Quando o Oponente Usa a Ponte + Estrangulamento de Duas Golas (Repete)"]
                },
                treinoEspecifico: "MONTADA / JOELHO NA BARRIGA",
                topicos: "SISTEMA DE GRADUAÇÃO GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["58. Saída de Gravata Lateral em Pé Com Bloqueio de Socos"]
                },
                jiuJitsuEsportivo: {
                    title: "MONTADA / JOELHO NA BARRIGA",
                    items: [
                        "59. Chave de Braço Reta na Montada",
                        "60. Chave de Braço Americana na Montada"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Transição para a Montada + Finalização (Repete)"]
                },
                treinoEspecifico: "MONTADA / JOELHO NA BARRIGA",
                topicos: "SISTEMA DE GRADUAÇÃO GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "QUEDAS DE QUADRIL OU QUEDAS DE MÃO",
                    items: ["55. Queda de Mão Controlando Gola e Manga"]
                },
                tecnicaChao: {
                    title: "MONTADA OU JOELHO NA BARRIGA",
                    items: [
                        "56. Saída de Joelho na Barriga para Guarda Fechada",
                        "57. Saída de Joelho na Barriga para Guarda 50/50"
                    ]
                },
                treinoEspecifico: "MONTADA OU JOELHO NA BARRIGA"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "QUEDAS DE QUADRIL OU QUEDAS DE MÃO",
                    items: ["58. Queda de Mão Enganchando a Perna"]
                },
                tecnicaChao: {
                    title: "MONTADA OU JOELHO NA BARRIGA",
                    items: [
                        "59. Saída da Montada",
                        "60. Saída da Montada para a Meia X"
                    ]
                },
                treinoEspecifico: "MONTADA OU JOELHO NA BARRIGA"
            }
        }
    },
    {
        week: 11,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["61. Bloqueio do Soco Cruzado + Queda de Quadril + Chave de Braço Reta com Joelho na Barriga"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "62. Abertura de Guarda Ajoelhado com as Duas Mãos na Faixa",
                        "63. Passagem de Guarda com o Joelho Cruzado Controlando a Manga"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Transição para Montada + Saída da Montada com Estrangulamento Usando a Ponte (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "O LEGADO GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["64. Esquiva do Soco Cruzado + Cinturada + Transição da Montada"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "65. Abertura de Guarda em Pé Controlando Gola e Quadril",
                        "66. Passagem de Guarda em Pé Emborcando Com os Dois Braços Por Baixo Das Pernas"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Transição para Montada + Saída da Montada com Estrangulamento Usando a Ponte (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "O LEGADO GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "CATADAS DE PERNA",
                    items: ["61. Single Leg"]
                },
                tecnicaChao: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "62. Passagem de Meia Guarda para a Montada",
                        "63. Passagem de Meia Guarda"
                    ]
                },
                treinoEspecifico: "GUARDA POR CIMA"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "CATADAS DE PERNA",
                    items: ["64. Single Leg (Variação)"]
                },
                tecnicaChao: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "65. Passagem de Meia Guarda Atravessando o Joelho",
                        "66. Passagem de Meia Guarda Profunda"
                    ]
                },
                treinoEspecifico: "GUARDA POR CIMA"
            }
        }
    },
    {
        week: 12,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "CLINCH & PEGADA",
                    items: ["67. Saída do Abraço de Urso pela Frente por Cima dos Braços + Queda de Quadril + Joelho na Barriga"]
                },
                jiuJitsuEsportivo: {
                    title: "COSTAS / QUATRO APOIOS",
                    items: [
                        "68. Transição para as Costas Partindo da Posição de Quatro Apoios por Cima + Pegada do Antebraço Abrindo Espaço Para o Gancho",
                        "69. Estrangulamento do Relógio"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Estrangulamento do Relógio + Defesa do Relógio Capotando + Imobilização Lateral + Montada (Alterna)"]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL",
                topicos: "A EQUIPE GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "CLINCH & PEGADA",
                    items: ["70. Saída do Abraço de Urso por Trás por Cima dos Braços + Queda para Trás + Imobilização Lateral"]
                },
                jiuJitsuEsportivo: {
                    title: "COSTAS / QUATRO APOIOS",
                    items: [
                        "71. Transição para as Costas Partindo da Posição de Quatro Apoios por Cima Usando a Pegada nas Lapelas",
                        "72. Estrangulamento de Duas Golas + Estrangulamento de Mata-Leão"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Transição para as Costas Partindo da Posição de Quatro Apoios por Cima Usando a Pegada nas Lapelas + Estrangulamento de Duas Golas + Estrangulamento de Mata-Leão (Alterna)"]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL",
                topicos: "A EQUIPE GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "QUEDAS DE PERNA",
                    items: ["67. Varrida de Pé"]
                },
                tecnicaChao: {
                    title: "COSTAS",
                    items: [
                        "68. Recuperação de Guarda da Tartaruga",
                        "69. Recuperação de Guarda da Tartaruga (Variação)"
                    ]
                },
                treinoEspecifico: "COSTAS"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "QUEDAS DE PERNA",
                    items: ["70. Collar Drag"]
                },
                tecnicaChao: {
                    title: "COSTAS",
                    items: [
                        "71. Saída das Costas para a Meia Guarda por Cima",
                        "72. Saída das Costas para a Guarda Fechada"
                    ]
                },
                treinoEspecifico: "COSTAS"
            }
        }
    },
    {
        week: 13,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["73. Defesa de Socos na Guarda Fechada por Baixo + Clinch + Triângulo"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "74. Raspagem da Guarda Fechada Sentando e Indo Pra Cima",
                        "75. Kimura da Guarda Fechada"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Raspagem + Saída da Montada Usando os Cotovelos (Alterna)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "A MISSÃO GB"
            },
            lessonB: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["76. Defesa de Socos na Guarda Fechada por Baixo + Escudo com Joelhos + Pedalada + Levantada Técnica"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "77. Disputa de Pegadas na Guarda Aranha + Oponente Toreando + Oponente Posturando",
                        "78. Raspagem da Guarda Aranha Com o Oponente Ajoelhado"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Disputa de Pegadas na Guarda Aranha + Oponente Toreando + Oponente Posturando + Fechar a Guarda (Repete)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "A MISSÃO GB"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "PUXADA PARA GUARDA OU QUEDAS DE SACRIFÍCIO",
                    items: ["73. Puxada para a Guarda Fechada"]
                },
                tecnicaChao: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "74. Arm Lock da Guarda Fechada",
                        "75. Pegada de Costas da Guarda Fechada"
                    ]
                },
                treinoEspecifico: "GUARDA POR BAIXO"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "PUXADA PARA GUARDA OU QUEDAS DE SACRIFÍCIO",
                    items: ["76. Queda de Sacrifício"]
                },
                tecnicaChao: {
                    title: "GUARDA POR BAIXO",
                    items: [
                        "77. Ataque Triplo da Guarda Fechada",
                        "78. Raspagem da Omoplata Utilizando a Lapela"
                    ]
                },
                treinoEspecifico: "GUARDA POR BAIXO"
            }
        }
    },
    {
        week: 14,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["79. Saída de Gravata no Chão Indo para a Posição de Quatro Apoios + Inversão + Montada Técnica + Chave de Braço Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "80. Saída da Imobilização Lateral + Reposição de Meia Guarda",
                        "81. Raspagem da Meia Guarda Usando a Esgrima e Controlando o Pé do Oponente"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Saída da Imobilização Lateral + Reposição de Meia Guarda + Raspagem da Meia Guarda Usando a Esgrima e Controlando o Pé do Oponente (Alterna)"]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL",
                topicos: "O MESTRE CARLOS GRACIE JR."
            },
            lessonB: {
                defesaPessoal: {
                    title: "GRAVATA",
                    items: ["82. Saída de Gravata no Chão Usando a Ponte + Montada Técnica + Chave de Braço Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "83. Defesa da Imobilização Lateral Antecipando a Passagem de Guarda + Domínio do Cotovelo + Reposição de Guarda",
                        "84. Defesa da Imobilização Lateral Antecipando a Passagem de Guarda + Inversão com a Mão na Faixa"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda Ajoelhado + Passagem de Guarda com um Braço por Baixo + Defesa da Imobilização Lateral Antecipando a Passagem de Guarda + Domínio do Cotovelo + Reposição de Guarda (Repete)"]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL",
                topicos: "O MESTRE CARLOS GRACIE JR."
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "QUEDAS DE QUADRIL OU QUEDAS DE MÃO",
                    items: ["79. Queda de Quadril"]
                },
                tecnicaChao: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "80. Saída dos 100kg Para as Costas",
                        "81. Saída dos 100kg para a Meia Guarda por Baixo"
                    ]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "QUEDAS DE QUADRIL OU QUEDAS DE MÃO",
                    items: ["82. Queda de Mão"]
                },
                tecnicaChao: {
                    title: "IMOBILIZAÇÃO LATERAL",
                    items: [
                        "83. Pegada de Costas dos 100kg",
                        "84. Estrangulamento dos 100kg"
                    ]
                },
                treinoEspecifico: "IMOBILIZAÇÃO LATERAL"
            }
        }
    },
    {
        week: 15,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["85. Defesa de Chute Frontal + Cotovelada"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "86. Abrir a Guarda em Pé Com as Duas Mãos na Calça",
                        "87. Passagem de Leg Drag"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Imobilização Lateral (Repete)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "A ETIQUETA DO TATAME"
            },
            lessonB: {
                defesaPessoal: {
                    title: "STRIKE",
                    items: ["88. Defesa de Chute Lateral Alto + Queda de Gancho por Dentro + Chave de Pé Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "89. Abrir a Guarda Ajoelhado Com as Duas Mãos na Calça",
                        "90. Passagem de Guarda Ajoelhado Emborcando com os Dois Braços por Baixo das Pernas"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Imobilização Lateral (Repete)"]
                },
                treinoEspecifico: "GUARDA",
                topicos: "A ETIQUETA DO TATAME"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "CATADAS DE PERNA",
                    items: ["85. Defesa de Single Leg"]
                },
                tecnicaChao: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "86. Passagem de Guarda Aberta",
                        "87. Passagem de Guarda Aberta (Variação)"
                    ]
                },
                treinoEspecifico: "GUARDA POR CIMA"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "CATADAS DE PERNA",
                    items: ["88. Defesa de Single Leg (Variação)"]
                },
                tecnicaChao: {
                    title: "GUARDA POR CIMA",
                    items: [
                        "89. Passagem de Guarda Aberta",
                        "90. Passagem de Guarda Aberta (Variação)"
                    ]
                },
                treinoEspecifico: "GUARDA POR CIMA"
            }
        }
    },
    {
        week: 16,
        gb1: {
            lessonA: {
                defesaPessoal: {
                    title: "CLINCH & PEGADA",
                    items: ["91. Saída do Abraço de Urso Pela Frente por Baixo dos Braços + Estourar a Pegada do Oponente + Queda de Gancho Por Fora + Chave de Braço Reta"]
                },
                jiuJitsuEsportivo: {
                    title: "MONTADA / JOELHO NA BARRIGA",
                    items: [
                        "92. Saída da Montada Usando a Ponte",
                        "93. Saída da Montada Usando os Cotovelos Quando o Oponente Abre o Joelho + Reposição da Guarda Fechada"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Abertura de Guarda + Passagem de Guarda + Imobilização + Montada + Saída da Montada Usando os Cotovelos Quando o Oponente Abre o Joelho + Reposição da Guarda Fechada (Repete)"]
                },
                treinoEspecifico: "MONTADA / JOELHO NA BARRIGA",
                topicos: "O CARTÃO DE FREQUÊNCIA"
            },
            lessonB: {
                defesaPessoal: {
                    title: "CLINCH & PEGADA",
                    items: ["94. Saída do Abraço de Urso por Trás com Pegadas por Baixo do Braço + Gancho na Perna + Mãos No Chão + Chave de Perna"]
                },
                jiuJitsuEsportivo: {
                    title: "MONTADA / JOELHO NA BARRIGA",
                    items: [
                        "95. Saída da Montada Usando os Cotovelos Quando o Oponente Inicia a Transição Para a Montada + Transição para as Costas",
                        "96. Defesa do Joelho na Barriga + Ajoelhar Dando as Costas + Puxada para a Guarda Aberta"
                    ]
                },
                treinoEducativo: {
                    title: "TREINO EDUCATIVO GB1",
                    items: ["Passagem Toreando + Defesa do Joelho na Barriga + Ajoelhar Dando as Costas + Puxada para Guarda Aberta (Repete)"]
                },
                treinoEspecifico: "MONTADA / JOELHO NA BARRIGA",
                topicos: "O CARTÃO DE FREQUÊNCIA"
            }
        },
        gb2: {
            lessonA: {
                tecnicaQueda: {
                    title: "QUEDAS DE PERNA",
                    items: ["91. Varrida de Pé"]
                },
                tecnicaChao: {
                    title: "MONTADA OU JOELHO NA BARRIGA",
                    items: [
                        "92. Arm Lock da Montada",
                        "93. Triangulo da Montada"
                    ]
                },
                treinoEspecifico: "MONTADA OU JOELHO NA BARRIGA"
            },
            lessonB: {
                tecnicaQueda: {
                    title: "QUEDAS DE PERNA",
                    items: ["94. Varrida de Pé (Variação)"]
                },
                tecnicaChao: {
                    title: "MONTADA OU JOELHO NA BARRIGA",
                    items: [
                        "95. Arm Lock da Montada (Variação)",
                        "96. Pegada de Costas da Montada"
                    ]
                },
                treinoEspecifico: "MONTADA OU JOELHO NA BARRIGA"
            }
        }
    }
];
