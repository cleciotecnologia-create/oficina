/**
 * Servidor e Construtor de Payload Pix EMV-QRCPS Oficial
 */

function buildCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    const b = payload.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      const bit = ((b >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xFFFF;
  const crcHex = crc.toString(16).toUpperCase();
  return crcHex.padStart(4, '0');
}

interface PixData {
  chave: string;
  beneficiario: string;
  cidade: string;
  valor?: number;
  descricao?: string;
  txid?: string;
}

export function generatePixPayload({
  chave,
  beneficiario,
  cidade,
  valor,
  descricao,
  txid = '***'
}: PixData): string {
  const f = (tag: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${tag}${len}${value}`;
  };

  // 1. Chave e Merchant Account Information
  const gui = f('00', 'br.gov.bcb.pix');
  const key = f('01', chave.trim());
  const desc = descricao ? f('02', descricao.substring(0, 40)) : '';
  const merchantAccountInfo = f('26', `${gui}${key}${desc}`);

  const parts = [
    f('00', '01'), // Payload Format Indicator
    merchantAccountInfo,
    f('52', '0000'), // Merchant Category Code (padrão Iso)
    f('53', '986'), // Currency BRL
  ];

  if (valor && valor > 0) {
    parts.push(f('54', valor.toFixed(2))); // Transaction Amount
  }

  // Sanitize names to avoid accented characters which might cause size calculation issues in EMV
  const cleanName = beneficiario
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, 25);

  const cleanCity = cidade
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .substring(0, 15);

  parts.push(f('58', 'BR')); // Country Code
  parts.push(f('59', cleanName || 'OFICINA AUTOTECH'));
  parts.push(f('60', cleanCity || 'SAO PAULO'));

  // TxID
  const cleanTxid = txid
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 25) || '***';
  parts.push(f('62', f('05', cleanTxid)));

  const payloadBeforeCRC = parts.join('') + '6304';
  const crc = buildCRC16(payloadBeforeCRC);
  
  return `${payloadBeforeCRC}${crc}`;
}
