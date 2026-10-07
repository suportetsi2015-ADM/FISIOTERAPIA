/**
 * Utilitário de conversão de valores numéricos em moeda para extenso em Português do Brasil (BRL).
 * Utilizado para emissão de Recibos Oficiais e Folha de Pagamento conforme legislação brasileira.
 */

const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const DEZ_A_DEZENOVE = [
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove'
];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos'
];

function converterGrupo(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';

  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  const partes: string[] = [];

  if (c > 0) partes.push(CENTENAS[c]);

  if (d === 1) {
    partes.push(DEZ_A_DEZENOVE[u]);
  } else {
    if (d > 1) partes.push(DEZENAS[d]);
    if (u > 0) partes.push(UNIDADES[u]);
  }

  return partes.join(' e ');
}

export function numeroPorExtensoBRL(valor: number): string {
  if (typeof valor !== 'number' || isNaN(valor) || valor === 0) {
    return 'zero reais';
  }

  const valorAbs = Math.abs(valor);
  const inteiros = Math.floor(valorAbs);
  const centavos = Math.round((valorAbs - inteiros) * 100);

  const partesTexto: string[] = [];

  if (inteiros > 0) {
    const milhoes = Math.floor(inteiros / 1000000);
    const milhares = Math.floor((inteiros % 1000000) / 1000);
    const unidades = inteiros % 1000;

    if (milhoes > 0) {
      const txt = converterGrupo(milhoes);
      partesTexto.push(milhoes === 1 ? 'um milhão' : `${txt} milhões`);
    }

    if (milhares > 0) {
      const txt = converterGrupo(milhares);
      partesTexto.push(milhares === 1 ? 'um mil' : `${txt} mil`);
    }

    if (unidades > 0) {
      partesTexto.push(converterGrupo(unidades));
    }

    const textoReais = partesTexto.join(', ');
    const sufixoReal = inteiros === 1 ? 'real' : 'reais';
    partesTexto.length = 0;
    partesTexto.push(`${textoReais} ${sufixoReal}`);
  }

  if (centavos > 0) {
    const textoCentavos = converterGrupo(centavos);
    const sufixoCentavo = centavos === 1 ? 'centavo' : 'centavos';
    if (inteiros > 0) {
      partesTexto.push(`e ${textoCentavos} ${sufixoCentavo}`);
    } else {
      partesTexto.push(`${textoCentavos} ${sufixoCentavo}`);
    }
  }

  return partesTexto.join(' ');
}
