import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
} from 'docx';
import { saveAs } from 'file-saver';

const EMPRESA = {
  nome: 'Impacto Criativo',
  cnpj: '00.000.000/0001-00', // Substitua pelo CNPJ real
  endereco: 'Rua Exemplo, 123 - Bairro - Cidade/UF',
  telefone: '(00) 00000-0000',
  email: 'contato@impactocriativo.com.br',
  responsavel: 'Wesley Rocha',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const heading = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '177BCA', space: 4 },
    },
    children: [
      new TextRun({ text, bold: true, font: 'Calibri', size: 24, color: '0E1012' }),
    ],
  });

const bodyLine = (runs) =>
  new Paragraph({
    spacing: { before: 120, after: 120 },
    children: runs.map(({ text, bold = false, color = '333333' }) =>
      new TextRun({ text, bold, color, font: 'Calibri', size: 22 })
    ),
  });

const body = (text, bold = false, color = '555555') =>
  new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [new TextRun({ text, bold, color, font: 'Calibri', size: 22 })],
  });

const blank = () => new Paragraph({ text: '' });

const divider = () =>
  new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 6 } },
    spacing: { before: 200, after: 200 },
  });

// Gera uma linha de dado apenas se o valor existir
const fieldLine = (label, value) => {
  if (!value || String(value).trim() === '') return null;
  return bodyLine([
    { text: `${label}: `, bold: true },
    { text: String(value) },
  ]);
};

// Filtra nulos do array de parágrafos
const compact = (arr) => arr.filter(Boolean);

// ─── Formatação de valor ────────────────────────────────────────────────────

const formatValor = (valor) => {
  if (!valor) return null;
  const num = parseFloat(valor);
  if (isNaN(num)) return null;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// ─── Geração do contrato ────────────────────────────────────────────────────

export async function gerarContrato(cliente) {
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const contratoNum = `IC-${Date.now().toString().slice(-6)}`;
  const valorFormatado = formatValor(cliente.valor);

  // Dados do CONTRATANTE — somente os campos preenchidos
  const dadosContratante = compact([
    bodyLine([{ text: 'CONTRATANTE: ', bold: true }, { text: cliente.nome }]),
    fieldLine('E-mail', cliente.email),
    fieldLine('Telefone/WhatsApp', cliente.telefone),
    fieldLine('CPF', cliente.cpf),
    fieldLine('RG', cliente.rg),
  ]);

  // Cláusula de pagamento — dinâmica conforme valor preenchido
  const clausulasPagamento = compact([
    valorFormatado
      ? bodyLine([
          { text: 'Valor total do serviço: ', bold: true },
          { text: valorFormatado, bold: true, color: '1a7a3a' },
        ])
      : body('O valor total do serviço será informado em proposta comercial separada, entregue ao CONTRATANTE por e-mail ou WhatsApp.'),
    blank(),
    body('O pagamento poderá ser realizado via Pix, transferência bancária ou outros meios acordados entre as partes.'),
    body('O não pagamento até a data acordada poderá implicar na suspensão do serviço e/ou na cobrança de multa de 2% ao mês sobre o valor inadimplente, além de juros de 1% ao mês.'),
    valorFormatado
      ? body(`Fica estabelecido que as condições de pagamento (parcelamento, datas de vencimento e demais detalhes) serão acordadas entre as partes e registradas em adendo a este contrato ou via comunicação formal.`)
      : null,
  ]);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '333333' },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1134, bottom: 1440, left: 1134 },
          },
        },
        children: [
          // ── Cabeçalho ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS',
                bold: true,
                font: 'Calibri',
                size: 32,
                color: '0E1012',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: 'Design & Comunicação Visual',
                font: 'Calibri',
                size: 22,
                color: '177BCA',
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `Nº ${contratoNum}  •  ${dataAtual}`,
                font: 'Calibri',
                size: 20,
                color: '888888',
              }),
            ],
          }),

          divider(),

          // ── Cláusula 1ª – DAS PARTES ──
          heading('CLÁUSULA 1ª – DAS PARTES'),

          bodyLine([{ text: 'CONTRATADA: ', bold: true }, { text: EMPRESA.nome }]),
          bodyLine([{ text: 'CNPJ: ', bold: true }, { text: EMPRESA.cnpj }]),
          bodyLine([{ text: 'Endereço: ', bold: true }, { text: EMPRESA.endereco }]),
          bodyLine([{ text: 'Telefone: ', bold: true }, { text: EMPRESA.telefone }]),
          bodyLine([{ text: 'E-mail: ', bold: true }, { text: EMPRESA.email }]),
          bodyLine([{ text: 'Representada por: ', bold: true }, { text: EMPRESA.responsavel }]),

          blank(),

          // Dados dinâmicos do contratante
          ...dadosContratante,

          blank(),
          body(
            'As partes acima identificadas têm entre si justo e contratado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente instrumento.',
          ),

          divider(),

          // ── Cláusula 2ª – DO OBJETO ──
          heading('CLÁUSULA 2ª – DO OBJETO'),

          bodyLine([
            { text: 'Serviço Contratado: ', bold: true },
            { text: cliente.pedido || 'A definir', color: '177BCA' },
          ]),
          ...(valorFormatado
            ? [bodyLine([
                { text: 'Valor do Serviço: ', bold: true },
                { text: valorFormatado, bold: true, color: '1a7a3a' },
              ])]
            : []
          ),
          blank(),
          body(
            'A CONTRATADA obriga-se a prestar os serviços de design e comunicação visual descritos acima, incluindo criação, desenvolvimento e entrega dos materiais acordados, de acordo com o briefing fornecido pelo CONTRATANTE.',
          ),
          body(
            'Detalhes e especificações adicionais serão formalizados em briefing enviado por e-mail e/ou WhatsApp, constituindo parte integrante deste contrato.',
          ),
          ...(cliente.detalhes
            ? [
                blank(),
                bodyLine([
                  { text: 'Observações / Detalhes do serviço: ', bold: true },
                  { text: cliente.detalhes, color: '555555' },
                ]),
              ]
            : []
          ),
          ...(cliente.observacoes
            ? [
                bodyLine([
                  { text: 'Notas adicionais: ', bold: true },
                  { text: cliente.observacoes, color: '555555' },
                ]),
              ]
            : []
          ),

          divider(),

          // ── Cláusula 3ª – DO PRAZO ──
          heading('CLÁUSULA 3ª – DO PRAZO'),

          body('O prazo de entrega do serviço será acordado entre as partes no momento da contratação, via comunicação por e-mail ou WhatsApp.'),
          body('O prazo de entrega será contado a partir do recebimento do pagamento e/ou da aprovação do briefing, o que ocorrer por último.'),
          body('Alterações no briefing após o início da execução poderão acarretar em prorrogação do prazo de entrega, a ser comunicada com antecedência.'),

          divider(),

          // ── Cláusula 4ª – DO PREÇO E FORMA DE PAGAMENTO ──
          heading('CLÁUSULA 4ª – DO PREÇO E FORMA DE PAGAMENTO'),

          ...clausulasPagamento,

          divider(),

          // ── Cláusula 5ª – DAS REVISÕES ──
          heading('CLÁUSULA 5ª – DAS REVISÕES E APROVAÇÕES'),

          body('Estão incluídas até 3 (três) rodadas de revisão para cada peça criativa, salvo acordo diferente estabelecido em proposta.'),
          body('Revisões adicionais poderão ser realizadas mediante pagamento de valor a ser acordado entre as partes.'),
          body('Após a aprovação final pelo CONTRATANTE, quaisquer alterações serão tratadas como novo serviço.'),

          divider(),

          // ── Cláusula 6ª – DIREITOS AUTORAIS ──
          heading('CLÁUSULA 6ª – DOS DIREITOS AUTORAIS'),

          body('Os direitos autorais sobre os materiais criados permanecem com a CONTRATADA até o pagamento integral do serviço. Após a quitação, os direitos de uso comercial são transferidos ao CONTRATANTE.'),
          body('A CONTRATADA reserva-se o direito de utilizar os trabalhos realizados em portfólio e materiais de divulgação, salvo solicitação expressa de confidencialidade pelo CONTRATANTE.'),

          divider(),

          // ── Cláusula 7ª – RESPONSABILIDADES ──
          heading('CLÁUSULA 7ª – DAS RESPONSABILIDADES'),

          body('7.1 – São obrigações da CONTRATADA: executar os serviços com qualidade e dentro do prazo acordado; comunicar o CONTRATANTE sobre qualquer impedimento; apresentar alternativas criativas alinhadas ao briefing.'),
          body('7.2 – São obrigações do CONTRATANTE: fornecer todas as informações necessárias para execução do serviço; realizar pagamento conforme acordado; aprovar ou solicitar ajustes dentro dos prazos estabelecidos.'),

          divider(),

          // ── Cláusula 8ª – RESCISÃO ──
          heading('CLÁUSULA 8ª – DA RESCISÃO'),

          body('Este contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 7 (sete) dias corridos.'),
          body('Em caso de rescisão por parte do CONTRATANTE após o início dos trabalhos, será devida à CONTRATADA a remuneração proporcional ao trabalho já executado.'),
          body('Em caso de rescisão por parte da CONTRATADA sem justificativa, os valores já pagos serão devolvidos ao CONTRATANTE proporcionalmente.'),

          divider(),

          // ── Cláusula 9ª – FORO ──
          heading('CLÁUSULA 9ª – DO FORO'),

          body('As partes elegem o foro da comarca de domicílio do CONTRATANTE para dirimir quaisquer dúvidas ou conflitos oriundos do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.'),

          divider(),
          blank(),
          blank(),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'Por estarem assim justos e contratados, firmam o presente instrumento em 2 (duas) vias de igual teor e forma.',
                font: 'Calibri',
                size: 22,
                color: '555555',
                italics: true,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: `Local e data: _________________________, ${dataAtual}`,
                font: 'Calibri',
                size: 22,
                color: '333333',
              }),
            ],
          }),

          // ── Assinaturas ──
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideH: { style: BorderStyle.NONE },
              insideV: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  // ── Assinatura CONTRATADA ──
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.BOTTOM,
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 800 },
                        border: {
                          top: { style: BorderStyle.SINGLE, size: 6, color: '177BCA', space: 4 },
                        },
                        children: [
                          new TextRun({ text: EMPRESA.nome, bold: true, font: 'Calibri', size: 22, color: '0E1012' }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'CONTRATADA', font: 'Calibri', size: 20, color: '177BCA', bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: EMPRESA.responsavel, font: 'Calibri', size: 20, color: '888888' }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: `CNPJ: ${EMPRESA.cnpj}`, font: 'Calibri', size: 18, color: '888888' }),
                        ],
                      }),
                    ],
                  }),

                  // Espaço central
                  new TableCell({
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [new Paragraph({ text: '' })],
                  }),

                  // ── Assinatura CONTRATANTE ──
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.BOTTOM,
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: compact([
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 800 },
                        border: {
                          top: { style: BorderStyle.SINGLE, size: 6, color: '177BCA', space: 4 },
                        },
                        children: [
                          new TextRun({ text: cliente.nome, bold: true, font: 'Calibri', size: 22, color: '0E1012' }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'CONTRATANTE', font: 'Calibri', size: 20, color: '177BCA', bold: true }),
                        ],
                      }),
                      cliente.cpf
                        ? new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({ text: `CPF: ${cliente.cpf}`, font: 'Calibri', size: 18, color: '888888' }),
                            ],
                          })
                        : null,
                      cliente.rg
                        ? new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({ text: `RG: ${cliente.rg}`, font: 'Calibri', size: 18, color: '888888' }),
                            ],
                          })
                        : null,
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: cliente.email, font: 'Calibri', size: 18, color: '888888' }),
                        ],
                      }),
                    ]),
                  }),
                ],
              }),
            ],
          }),

          blank(),
          blank(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const nomeArquivo = `Contrato_${cliente.nome.replace(/\s+/g, '_')}_${contratoNum}.docx`;
  saveAs(blob, nomeArquivo);
}
