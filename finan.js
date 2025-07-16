class Financas {
  constructor() {
    this.lancamentos = JSON.parse(localStorage.getItem("lancamentos") || "[]");
    this.tabela = document.getElementById("tabelaLancamentos");
    this.receitasEl = document.getElementById("totalReceitas");
    this.despesasEl = document.getElementById("totalDespesas");
    this.saldoEl = document.getElementById("saldo");
    this.renderTabela();
    this.atualizarResumo();
  }

  adicionar(lancamento) {
    this.lancamentos.push(lancamento);
    this.salvar();
    this.renderTabela();
    this.atualizarResumo();
  }

  salvar() {
    localStorage.setItem("lancamentos", JSON.stringify(this.lancamentos));
  }

  limpar() {
    this.lancamentos = [];
    this.salvar();
    this.renderTabela();
    this.atualizarResumo();
  }

  renderTabela() {
    this.tabela.innerHTML = "";
    this.lancamentos.forEach(l => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${l.descricao}</td>
        <td>${l.tipo}</td>
        <td>R$ ${parseFloat(l.valor).toFixed(2)}</td>
      `;
      this.tabela.appendChild(linha);
    });
  }

  atualizarResumo() {
    const receitas = this.lancamentos.filter(l => l.tipo === "receita").reduce((acc, l) => acc + parseFloat(l.valor), 0);
    const despesas = this.lancamentos.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + parseFloat(l.valor), 0);
    const saldo = receitas - despesas;

    this.receitasEl.textContent = `R$ ${receitas.toFixed(2)}`;
    this.despesasEl.textContent = `R$ ${despesas.toFixed(2)}`;
    this.saldoEl.textContent = `R$ ${saldo.toFixed(2)}`;
  }

  exportarParaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Controle de Finanças", 14, 20);

    const rows = this.lancamentos.map(l => [
      l.descricao,
      l.tipo,
      `R$ ${parseFloat(l.valor).toFixed(2)}`
    ]);

    doc.autoTable({
      head: [["Descrição", "Tipo", "Valor"]],
      body: rows,
    startY: 30
  });

  doc.save("financas.pdf");
}

  exportarParaExcel() {
  const dados = this.lancamentos.map(l => ({
    Descrição: l.descricao,
    Tipo: l.tipo,
    Valor: Number(l.valor)
  }));

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(dados, {
    header: ["Descrição", "Tipo", "Valor"]
  });

  // Ajusta largura das colunas
  worksheet["!cols"] = [
    { wch: 30 }, // Descrição
    { wch: 15 }, // Tipo
    { wch: 12 }  // Valor
  ];

  // Aplica estilo monetário (reais) na coluna "Valor"
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cellRef = XLSX.utils.encode_cell({ c: 2, r: R }); // Coluna C (Valor)
    if (worksheet[cellRef]) {
      worksheet[cellRef].t = "n"; // tipo número
      worksheet[cellRef].z = 'R$ #,##0.00'; // formato moeda
    }
  }

  // Cria o livro e adiciona a planilha com nome personalizado
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resumo Financeiro");

  // Salva
  XLSX.writeFile(workbook, "controle-financas.xlsx");
}
}

const app = new Financas();

document.getElementById("formLancamento").addEventListener("submit", e => {
  e.preventDefault();
  const descricao = document.getElementById("descricao").value;
  const valor = document.getElementById("valor").value;
  const tipo = document.getElementById("tipo").value;

  app.adicionar({ descricao, valor, tipo });
  e.target.reset();
});

document.getElementById("limpar").addEventListener("click", () => {
  if (confirm("Tem certeza que deseja limpar todos os dados?")) {
    app.limpar();
  }
});

document.getElementById("exportarPdf").addEventListener("click", () => app.exportarParaPDF());
document.getElementById("exportarExcel").addEventListener("click", () => app.exportarParaExcel());


