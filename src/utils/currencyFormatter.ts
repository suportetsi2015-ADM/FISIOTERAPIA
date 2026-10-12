/**
 * Utilitário oficial de formatação de valores monetários (Real Brasileiro - R$):
 * Padrão rigoroso com separação de milhar por ponto (.) e casas decimais por vírgula (,):
 * Exemplo: 2690 -> R$ 2.690,00
 *          5380 -> R$ 5.380,00
 *          2110 -> R$ 2.110,00
 *          2690.5 -> R$ 2.690,50
 *          520  -> R$ 520,00
 */
export function formatCurrencyBRL(val: number | undefined | null): string {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${formattedInt},${decPart}`;
}

export function formatBRL(val: number | undefined | null): string {
  return formatCurrencyBRL(val);
}
