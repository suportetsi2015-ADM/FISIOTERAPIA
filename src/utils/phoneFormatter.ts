/**
 * Utilitário de formatação de números de telefone para o padrão brasileiro:
 * Exemplo: (92) 98104-5023 ou (92) 3234-5678
 */

export function formatPhoneBR(phone?: string | null): string {
  if (!phone) return '';
  const str = String(phone).trim();
  const digits = str.replace(/\D/g, '');
  if (!digits) return str;

  // Se vier com o código internacional 55 (Brasil) e tiver 12 ou 13 dígitos
  let clean = digits;
  if (clean.startsWith('55') && (clean.length === 12 || clean.length === 13)) {
    clean = clean.slice(2);
  }

  // Celular com DDD (11 dígitos): (92) 98104-5023
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }

  // Fixo com DDD (10 dígitos): (92) 3234-5678
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }

  // Celular sem DDD (9 dígitos): assume DDD padrão de Manaus-AM (92)
  if (clean.length === 9) {
    return `(92) ${clean.slice(0, 5)}-${clean.slice(5)}`;
  }

  // Fixo sem DDD (8 dígitos): assume DDD padrão de Manaus-AM (92)
  if (clean.length === 8) {
    return `(92) ${clean.slice(0, 4)}-${clean.slice(4)}`;
  }

  // Caso tenha formato parcial durante digitação ou comprimento atípico
  if (clean.length > 2 && clean.length <= 6) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  }
  if (clean.length > 6 && clean.length < 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }

  return str;
}

/**
 * Aplica máscara de telefone enquanto o usuário digita no input: (XX) XXXXX-XXXX
 */
export function maskPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
