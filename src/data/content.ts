import { BenefitItem, FaqItem, StudioImage, TestimonialItem } from '../types';
import { getStoredClinicData, ClinicData } from './clinicStore';

// Proxy CLINIC_INFO to read dynamically from clinicStore
export const CLINIC_INFO: ClinicData = new Proxy({} as ClinicData, {
  get(_target, prop: keyof ClinicData) {
    const data = getStoredClinicData();
    return data[prop];
  }
});

export function getWhatsAppUrl(customMessage?: string): string {
  const info = getStoredClinicData();
  const message = customMessage || info.defaultWhatsAppMessage;
  return `https://wa.me/${info.phoneRaw}?text=${encodeURIComponent(message)}`;
}

export const TRUST_ELEMENTS = [
  {
    title: "Atendimento 100% personalizado",
    description: "Sessões com foco exclusivo nas suas necessidades e limitações."
  },
  {
    title: "Fisioterapeuta especializada",
    description: "Condução técnica certificada e registro ativo no CREFITO."
  },
  {
    title: "Ambiente acolhedor e tranquilo",
    description: "Espaço privativo com conforto térmico, luz natural e silêncio."
  },
  {
    title: "Plano de evolução individual",
    description: "Reavaliações periódicas para acompanhar seus progressos."
  }
];

export const PURPOSE_PILLARS = [
  {
    id: "movimento",
    tag: "01",
    title: "Movimento com Propósito",
    subtitle: "Qualidade antes da quantidade",
    description: "Exercícios biomecanicamente pensados para restaurar e aprimorar a qualidade do movimento, eliminando compensações posturais.",
  },
  {
    id: "forca",
    tag: "02",
    title: "Força Profunda",
    subtitle: "Progressão segura e constante",
    description: "Trabalho muscular progressivo do centro de força (core) aos membros, respeitando rigorosamente o seu nível e o ritmo do seu corpo.",
  },
  {
    id: "consciencia",
    tag: "03",
    title: "Consciência Corporal",
    subtitle: "Conexão mente e movimento",
    description: "Maior percepção sobre postura, respiração tridimensional e simetria, proporcionando segurança em cada gesto do cotidiano.",
  },
  {
    id: "qualidade",
    tag: "04",
    title: "Qualidade de Vida",
    subtitle: "Bem-estar duradouro",
    description: "Um cuidado integral que ultrapassa a sala de atendimento para devolver vitalidade, disposição e liberdade aos seus dias.",
  }
];

export const BENEFITS: BenefitItem[] = [
  {
    id: "fortalecimento",
    title: "Fortalecimento Muscular",
    description: "Tonificação equilibrada e ativação de musculaturas profundas estabilizadoras."
  },
  {
    id: "mobilidade",
    title: "Mobilidade Articular",
    description: "Ganho de amplitude articular sem impacto ou estresse excessivo nas cartilagens."
  },
  {
    id: "equilibrio",
    title: "Equilíbrio & Estabilidade",
    description: "Aprimoramento proprioceptivo para maior firmeza, segurança e prevenção de quedas."
  },
  {
    id: "coordenacao",
    title: "Coordenação Motora",
    description: "Integração harmoniosa de múltiplos grupos musculares em padrões funcionais."
  },
  {
    id: "consciencia-corp",
    title: "Consciência Corporal",
    description: "Percepção refinada de alinhamento postural estático e dinâmico na rotina."
  },
  {
    id: "flexibilidade",
    title: "Flexibilidade Funcional",
    description: "Alongamento axial e alívio das tensões musculares acumuladas pelo estresse."
  },
  {
    id: "controle",
    title: "Controle do Movimento",
    description: "Domínio e precisão em cada repetição através do controle do centro do corpo."
  },
  {
    id: "condicionamento",
    title: "Condicionamento Físico",
    description: "Melhora da resistência cardiorrespiratória e vascular de baixo impacto."
  },
  {
    id: "postura",
    title: "Alinhamento Postural",
    description: "Correção de sobrecargas vertebrais e compensações do dia a dia de trabalho."
  },
  {
    id: "bem-estar",
    title: "Sensação de Bem-Estar",
    description: "Regulação da respiração diafragmática, relaxamento mental e alívio de estresse."
  }
];

export const COMPARISON_ROWS = [
  {
    criterion: "Prescrição de Exercícios",
    conventional: "Séries padronizadas para turmas ou grupos",
    physio: "Exercícios adaptados e prescritos para o seu corpo"
  },
  {
    criterion: "Foco da Atenção",
    conventional: "Atenção dividida entre múltiplos praticantes",
    physio: "Foco individualizado com acompanhamento contínuo"
  },
  {
    criterion: "Progressão de Carga",
    conventional: "Progressão genérica por tempo de aula",
    physio: "Progressão baseada em resposta biomecânica real"
  },
  {
    criterion: "Avaliação Inicial",
    conventional: "Avaliação básica ou inexistente antes de iniciar",
    physio: "Avaliação funcional minuciosa de postura e mobilidade"
  },
  {
    criterion: "Objetivo Central",
    conventional: "Objetivo esportivo ou coletivo genérico",
    physio: "Objetivo centrado na sua história, saúde e queixas"
  }
];

export const METHOD_STEPS = [
  {
    step: "01",
    name: "Avaliação",
    subtitle: "Conhecer seu corpo",
    description: "Conversa detalhada sobre seu histórico clínico, rotina, dores ou queixas pregressas, acompanhada de testes de postura, mobilidade e flexibilidade."
  },
  {
    step: "02",
    name: "Planejamento",
    subtitle: "Estratégia sob medida",
    description: "Elaboração de um programa terapêutico e funcional customizado, selecionando os aparelhos e resistências ideais para o seu momento."
  },
  {
    step: "03",
    name: "Prática",
    subtitle: "Sessões orientadas",
    description: "Aulas individuais com comandos verbais e ajustes manuais de precisão nos aparelhos clássicos (Reformer, Cadillac, Chair, Ladder Barrel)."
  },
  {
    step: "04",
    name: "Evolução",
    subtitle: "Acompanhamento contínuo",
    description: "Reavaliação periódica para celebrar avanços, redefinir metas e elevar gradualmente a complexidade dos movimentos com segurança."
  }
];

export const AUDIENCE_CARDS = [
  {
    id: "iniciantes",
    title: "Iniciantes",
    badge: "Comece com segurança",
    description: "Para quem nunca praticou Pilates ou esteve sedentária por algum tempo e deseja ingressar em uma atividade física respeitosa e guiada por especialista."
  },
  {
    id: "fortalecimento",
    title: "Mulheres que Buscam Fortalecimento",
    badge: "Tonificação & Postura",
    description: "Para quem busca desenvolver força muscular real, proteção para a coluna e tônus sem a agressividade ou sobrecargas de academias convencionais."
  },
  {
    id: "mobilidade",
    title: "Pessoas que Desejam Melhorar a Mobilidade",
    badge: "Fluidez no dia a dia",
    description: "Para aliviar a rigidez corporal provocada por longas horas sentada no trabalho ou estresse diário, devolvendo amplitude articular e leveza."
  },
  {
    id: "envelhecimento",
    title: "Envelhecimento Ativo",
    badge: "Autonomia & Equilíbrio",
    description: "Exercícios com apoio de molas e estruturas estáveis para preservar a massa magra, flexibilidade, equilíbrio e independência funcional com total segurança."
  },
  {
    id: "acompanhamento",
    title: "Acompanhamento Fisioterapêutico",
    badge: "Cuidado clínico",
    description: "Quando indicado como continuação de tratamento médico ou ortopédico, para transição segura de reabilitação e gerenciamento responsável de queixas."
  }
];

export const EXPERIENCE_CARDS = [
  {
    title: "Atenção Individual",
    description: "Cada movimento é acompanhado de perto, com correções posturais sutis e comandos que evitam sobrecargas articulares desnecessárias."
  },
  {
    title: "Ambiente Tranquilo",
    description: "Um espaço silencioso e acolhedor, pensado para desacelerar o ritmo do dia a dia e transformar sua sessão em um momento só seu."
  },
  {
    title: "Progressão Respeitosa",
    description: "Você nunca será forçada a ultrapassar limites dolorosos. A progressão ocorre de forma natural conforme suas estruturas ganham força."
  },
  {
    title: "Cuidado Integral",
    description: "Uma visão completa de sua saúde física: respiração, alinhamento espinhal, controle muscular e prevenção a longo prazo."
  }
];

export const STUDIO_IMAGES: StudioImage[] = [
  {
    id: "img1",
    title: "Aparelhos Clássicos e Modernos",
    description: "Reformer e Cadillac em madeira nobre e molas calibradas com manutenção impecável.",
    url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    aspect: "landscape"
  },
  {
    id: "img2",
    title: "Atendimento Individualizado",
    description: "Supervisão próxima de cada repetição e ajuste postural personalizado.",
    url: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80",
    aspect: "landscape"
  },
  {
    id: "img3",
    title: "Ambiente Luminoso e Acolhedor",
    description: "Luz natural, higienização rigorosa e clima intimista para seu bem-estar.",
    url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80",
    aspect: "landscape"
  },
  {
    id: "img4",
    title: "Espaço de Avaliação e Conforto",
    description: "Ambiente reservado para anamnese e acompanhamento de sua evolução.",
    url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    aspect: "landscape"
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "dep1",
    quote: "Comecei sem saber se conseguiria acompanhar e hoje percebo uma diferença enorme na minha disposição e confiança para me movimentar. O olhar atencioso da Dra. Léia fez toda a diferença.",
    author: "Marina S.",
    role: "Advogada",
    timePracticing: "Aluna há 1 ano"
  },
  {
    id: "dep2",
    quote: "Trabalho muito tempo sentada e sentia uma rigidez constante nas costas. O Pilates com acompanhamento fisioterapêutico mudou minha consciência postural até no escritório. O espaço é maravilhoso e calmo.",
    author: "Camila R.",
    role: "Arquiteta",
    timePracticing: "Aluna há 8 meses"
  },
  {
    id: "dep3",
    quote: "Já havia tentado Pilates em academias grandes com vários alunos por turma e sempre me sentia perdida. Com a Dra. Léia, cada aula é focada naquilo que o meu corpo realmente precisa naquele dia.",
    author: "Helena B.",
    role: "Professora Universitária",
    timePracticing: "Aluna há 1 ano e meio"
  }
];

export const FAQS: FaqItem[] = [
  {
    id: "faq1",
    question: "O Pilates é indicado para iniciantes?",
    answer: "Sim, com certeza. A metodologia do Pilates é naturalmente progressiva e adaptável. Em nosso estúdio, a primeira etapa é sempre uma avaliação funcional completa para entender suas capacidades, histórico e objetivos, garantindo que o início seja absolutamente seguro, suave e confortável."
  },
  {
    id: "faq2",
    question: "Preciso ter flexibilidade ou experiência prévia?",
    answer: "Não. Você não precisa ser flexível nem ter praticado qualquer modalidade antes. O aumento da flexibilidade, da mobilidade e do controle corporal são consequências naturais da prática contínua orientada, e não pré-requisitos para começar."
  },
  {
    id: "faq3",
    question: "Como funciona a primeira avaliação?",
    answer: "A avaliação é uma sessão individual onde conversamos sobre suas queixas, histórico de saúde e objetivos. Realizamos testes específicos de mobilidade, postura e flexibilidade para traçar um plano de exercícios personalizado antes de iniciar as sessões nos aparelhos."
  },
  {
    id: "faq4",
    question: "Quantas vezes por semana devo fazer?",
    answer: "A frequência recomendada costuma ser de 2 a 3 vezes por semana para obter ganhos consistentes de tônus, consciência corporal e mobilidade. No entanto, a frequência ideal é definida em conjunto durante a avaliação, alinhando suas metas com a sua rotina semanal."
  },
  {
    id: "faq5",
    question: "Pilates emagrece?",
    answer: "O Pilates estimula o metabolismo, desenvolve tônus muscular e melhora a postura, o que alonga e harmoniza a silhueta corporal. No entanto, tecnicamente falando, a perda de peso depende de um conjunto integrado de fatores, incluindo balanço energético e nutrição equilibrada. Nosso foco é na saúde do movimento, força e bem-estar funcional."
  },
  {
    id: "faq6",
    question: "Posso fazer Pilates se estiver com dor ou desconforto?",
    answer: "Por ser conduzido por uma fisioterapeuta graduada e especialista, o atendimento é preparado para acolher pessoas com dores crônicas ou desconfortos musculoesqueléticos. Na avaliação inicial, verificamos se a prática está indicada e quais movimentos precisam ser adaptados para respeitar sua tolerância e promover o gerenciamento seguro da condição."
  },
  {
    id: "faq7",
    question: "Qual roupa devo usar nas sessões?",
    answer: "Recomendamos roupas confortáveis e flexíveis que permitam ampla liberdade de movimentos (como calça legging, bermuda de tecido elástico e camiseta confortável). A prática é realizada com meias — preferencialmente antiderrapantes — para garantir estabilidade e higiene nos equipamentos."
  },
  {
    id: "faq8",
    question: "Como faço para agendar minha avaliação?",
    answer: "O agendamento é feito de forma simples e direta pelo WhatsApp. Basta clicar em qualquer um dos botões da página ou enviar uma mensagem. Nossa equipe responderá prontamente com os horários disponíveis para que você escolha o melhor momento para sua visita."
  }
];
