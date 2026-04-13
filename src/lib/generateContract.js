import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';

const EMPRESA = {
  nome: 'Impacto Criativo (Serviços Gráficos)',
  cpf_cnpj: '00.000.000/0001-00', // Substitua pelo CPF ou CNPJ real
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const heading = (text) =>
  new Paragraph({
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({ text, bold: true, font: 'Arial', size: 24, color: '000000' }),
    ],
  });

const body = (text, options = {}) =>
  new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: { before: 120, after: 120 },
    children: [
      new TextRun({ 
        text, 
        bold: options.bold || false, 
        font: 'Arial', 
        size: 22,
        underline: options.underline || false
      })
    ],
  });

const blank = () => new Paragraph({ text: '' });

// ─── Geração do contrato ────────────────────────────────────────────────────

export async function gerarContrato(cliente) {
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22, color: '000000' },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // ── Cabeçalho ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS GRÁFICOS',
                bold: true,
                font: 'Arial',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'GRÁFICA IMPACTO CRIATIVO',
                bold: true,
                font: 'Arial',
                size: 24,
              }),
            ],
          }),

          // ── Partes ──
          body('CONTRATANTE: ' + (cliente.nome || '__________________________________________'), { bold: true }),
          body('CPF: ' + (cliente.cpf || '______________________________________________________'), { bold: true }),
          blank(),
          body('CONTRATADA: ' + EMPRESA.nome, { bold: true }),
          body('CPF: ' + (EMPRESA.cpf_cnpj || '______________________________________________________'), { bold: true }),
          blank(),

          body('As partes acima identificadas têm entre si justo e acordado o presente contrato de prestação de serviços gráficos, mediante as cláusulas e condições abaixo:'),
          blank(),

          // ── Cláusulas ──
          heading('CLÁUSULA 1 – DO OBJETO'),
          body('Prestação de serviços gráficos conforme solicitado pelo contratante' + (cliente.pedido ? ` (${cliente.pedido}).` : '.')),

          heading('CLÁUSULA 2 – DO PAGAMENTO'),
          body('Pagamento de 50% no ato da contratação e 50% na entrega do pedido. A produção só inicia após o pagamento da entrada.'),

          heading('CLÁUSULA 3 – PRAZO DE ENTREGA'),
          body('O prazo será informado no momento do pedido.'),

          heading('CLÁUSULA 4 – CANCELAMENTO'),
          body('Após o início da produção, o valor da entrada não será devolvido.'),

          heading('CLÁUSULA 5 – APROVAÇÃO'),
          body('O cliente é responsável pela conferência da arte antes da impressão.'),

          heading('CLÁUSULA 6 – DISPOSIÇÕES GERAIS'),
          body('O contrato passa a valer após assinatura das partes.'),

          blank(),
          blank(),
          body(`Local e Data: ______________________, ${dataAtual}`),
          blank(),
          blank(),
          body('Assinatura do Contratante: ______________________________'),
          blank(),
          body('Assinatura da Contratada: _____________________________'),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const nomeArquivo = `Contrato_${cliente.nome.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, nomeArquivo);
}
