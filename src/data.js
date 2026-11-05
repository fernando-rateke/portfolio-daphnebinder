// Todo o conteúdo do site vem do portfólio original da Daphne (PDF 2024).
// Para atualizar textos, links ou trabalhos, edite apenas este arquivo.

export const contact = {
  email: 'daphne.binder@live.com',
  behance: 'https://www.behance.net/daphnebinder',
  linkedin: 'https://www.linkedin.com/in/daphnebinder/',
}

export const about = {
  lead: 'Designer desde 2015.',
  text:
    'Aqui apresento alguns dos principais trabalhos realizados desde o início da minha jornada profissional como designer — de overlays para streamers a identidades visuais, mídia kits, social media e interfaces digitais.',
  note:
    'Alguns trabalhos não podem ser apresentados publicamente devido a acordos de confidencialidade assinados mediante contrato, podendo ser brevemente apresentados e discutidos em entrevistas profissionais.',
  stats: [
    { value: 2015, label: 'início da jornada', plain: true },
    { value: 50, suffix: '+', label: 'clientes de Twitch graphics' },
    { value: 6, label: 'áreas de atuação' },
  ],
  skills: [
    'Twitch Graphics',
    'Identidade Visual',
    'Mídia Kits',
    'Social Media',
    'UI/UX Design',
    'Edição de vídeo',
    'Fotografia',
    'Materiais impressos',
  ],
}

const w = (name) => `/work/${name}.webp`

export const twitch = {
  title: 'Twitch Graphics',
  years: '2015 — Atual',
  text: 'Overlays, telas de “offline” e “começando”, painéis, emotes e alertas para streamers. Mais de 50 clientes desde 2015.',
  collage: w('twitch-collage'),
  items: [
    { src: w('twitch-01'), title: 'Aranho' },
    { src: w('twitch-02'), title: 'BelaBM' },
    { src: w('twitch-03'), title: 'Bellpastel' },
    { src: w('twitch-04'), title: 'CaioSyn' },
    { src: w('twitch-05'), title: 'Icy_Candy' },
    { src: w('twitch-06'), title: 'Lupagee' },
    { src: w('twitch-07'), title: 'Bananatrama' },
  ],
}

export const identity = {
  title: 'Identidade Visual',
  items: [
    {
      name: 'iHeal',
      year: '2023',
      logo: w('iheal-logo'),
      accent: '#1fb89a',
      text: [
        'É um aplicativo mobile desenvolvido para auxiliar no controle e aplicação de medicações.',
        'O desenvolvimento da marca envolveu logo, brandbook e diferentes aplicações para plataformas Android, iOS e Web.',
      ],
      tags: ['Logo', 'Brandbook', 'Android · iOS · Web'],
    },
    {
      name: 'Artificers',
      year: '2021',
      logo: w('artificers-logo'),
      accent: '#c9c9c9',
      text: [
        'Empresa nacional focada no desenvolvimento de arquivos para impressão 3D de modelos para campanhas de RPG.',
        'O desenvolvimento da marca envolveu logo, brandbook, documentação timbrada, cartões de visita e assinatura de e-mail.',
      ],
      tags: ['Logo', 'Brandbook', 'Papelaria', 'Assinatura de e-mail'],
    },
  ],
}

export const mediaKits = {
  title: 'Mídia Kits',
  text: 'Mídia kits para criadores de conteúdo e marcas: números, audiência e personalidade, organizados para fechar parcerias.',
  items: [
    { name: 'Boi Selvagem', images: [w('midia-01')] },
    { name: 'Hunt3ss', images: [w('midia-02'), w('midia-03'), w('midia-04')] },
    { name: 'Itoka', images: [w('midia-05')] },
    { name: 'Nordlys', images: [w('midia-06')] },
    { name: 'Orochinho', images: [w('midia-07')] },
    { name: 'Tom Toledo', images: [w('midia-08'), w('midia-09'), w('midia-10')] },
  ],
}

export const manu = {
  title: 'Manu Vieira',
  years: '2021 — 2023',
  role: 'Social media & assessoria',
  cover: w('manu-cover'),
  logos: w('manu-logos'),
  intro: 'Além da produção de posts diária, dentre minhas responsabilidades como assessora também estavam:',
  list: [
    'Edição de vídeos',
    'Fotografia e gravação',
    'Produção de materiais impressos',
    'Elaboração de IDVs para diferentes projetos',
    'SEO',
    'Reformulação do site para identidade pós-campanha',
  ],
}

export const uiux = {
  title: 'UI/UX Design',
  years: '2023',
  intro:
    'Durante o ano de 2023 iniciei formalmente minha jornada como designer de interfaces digitais.',
  projects: [
    {
      id: 'rastro',
      name: 'Rastro',
      kind: 'App mobile',
      text: 'Outra oportunidade foi o desenvolvimento do app Rastro, que tem como proposta o auxílio na busca por animais abandonados ou perdidos e seu resgate.',
      screens: [w('rastro-01'), w('rastro-02'), w('rastro-03'), w('rastro-04')],
    },
    {
      id: 'sigo',
      name: 'Si.Go',
      kind: 'Redesign · TCC',
      text: 'Para a conclusão do curso, o estudo foi direcionado ao redesign de um aplicativo existente, o Si.Go, utilizado em Florianópolis por usuários do transporte público. O objetivo principal era melhorar a estética e a navegação, tornando a jornada do usuário mais fácil e amigável.',
      screens: [w('sigo-01'), w('sigo-02'), w('sigo-03'), w('sigo-04')],
    },
    {
      id: 'lockon',
      name: 'LockOn',
      kind: 'App + Web dashboard',
      text: 'Começando como estagiária na disciplina de prática profissional supervisionada, desenvolvi como objeto de estudo o aplicativo LockOn, para gerenciamento de senhas: novos cadastros, monitoramento do nível de segurança das contas e administração de todas as senhas cadastradas.',
      image: w('uiux-lockon'),
    },
  ],
}

// Imagens usadas no filme de introdução (ordem do “túnel”).
export const filmImages = [
  w('twitch-02'), w('midia-05'), w('rastro-01'), w('twitch-06'), w('midia-08'),
  w('sigo-02'), w('twitch-07'), w('midia-06'), w('iheal-logo'), w('twitch-01'),
  w('midia-02'), w('rastro-04'), w('twitch-03'), w('artificers-logo'), w('midia-07'),
  w('twitch-05'), w('sigo-01'), w('midia-09'), w('twitch-04'), w('rastro-03'),
]
