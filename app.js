// Inicialização
document.addEventListener('DOMContentLoaded', function () {
 document.getElementById('tela-entrada').style.display = 'block';
 document.getElementById('tela-inicial').style.display = 'none';
 document.getElementById('cadastrar-venda').style.display = 'none';
 document.getElementById('ver-vendas').style.display = 'none';
 document.getElementById('estoque').style.display = 'none';
 document.getElementById('configuracoes').style.display = 'none';
 carregarDados();
 atualizarListaSabores();
 atualizarListaVendas();
 atualizarEstoque();
});

// Funções de Navegação
function mostrarTela(idTela) {
 const telas = document.querySelectorAll('.tela');
 telas.forEach(tela => {
  if (tela.style.display !== 'none') {
   tela.classList.add('tela-saindo');
   setTimeout(() => {
    tela.style.display = 'none';
    tela.classList.remove('tela-saindo');
   }, 350);
  } else {
   tela.classList.remove('tela-entrando');
  }
 });
 setTimeout(() => {
  const novaTela = document.getElementById(idTela);
  novaTela.style.display = 'block';
  novaTela.classList.add('tela-entrando');
  setTimeout(() => novaTela.classList.remove('tela-entrando'), 400);
  if (idTela === 'tela-inicial') {
   mostrarDataHojeMenu();
   mostrarAlertaEstoqueBaixo();
  }
  if (idTela === 'ver-vendas') {
   atualizarListaVendas();
  }
  if (idTela === 'dashboard') {
   renderizarCalendarioDashboard();
   mostrarLoaderDashboard();
   setTimeout(mostrarDashboardDia, 700);
  }
 }, 350);
}

// Gerenciamento de Dados
let dados = {
 sabores: [],
 vendas: [],
 estoque: {}
};

function carregarDados() {
 const dadosSalvos = localStorage.getItem('geladinhosDados');
 if (dadosSalvos) {
  dados = JSON.parse(dadosSalvos);
 }
}

function salvarDados() {
 localStorage.setItem('geladinhosDados', JSON.stringify(dados));
}

// Gerenciamento de Sabores
function atualizarListaSabores() {
 const select = document.getElementById('sabor-venda');
 select.innerHTML = '<option value="">Selecione o sabor</option>';

 dados.sabores.forEach(sabor => {
  const option = document.createElement('option');
  option.value = sabor.id;
  option.textContent = `${sabor.nome} - R$ ${sabor.preco.toFixed(2)}`;
  select.appendChild(option);
 });
}

function salvarNovoSabor() {
 const nome = document.getElementById('novo-sabor').value;
 const preco = parseFloat(document.getElementById('preco-sabor').value);
 const estoque = parseInt(document.getElementById('estoque-inicial').value);

 if (!nome || isNaN(preco) || isNaN(estoque)) {
  alert('Por favor, preencha todos os campos corretamente!');
  return;
 }

 const novoId = Date.now().toString();
 const novoSabor = {
  id: novoId,
  nome: nome,
  preco: preco,
  estoque: estoque
 };

 dados.sabores.push(novoSabor);
 dados.estoque[novoId] = estoque;
 salvarDados();

 document.getElementById('novo-sabor').value = '';
 document.getElementById('preco-sabor').value = '';
 document.getElementById('estoque-inicial').value = '';

 atualizarListaSabores();
 atualizarEstoque();
 alert('Sabor cadastrado com sucesso!');
}

// Gerenciamento de Vendas
function calcularTotal() {
 const saborId = document.getElementById('sabor-venda').value;
 const quantidade = parseInt(document.getElementById('quantidade-venda').value);
 const precoUnitario = parseFloat(document.getElementById('preco-unitario').value);

 if (saborId && !isNaN(quantidade) && !isNaN(precoUnitario)) {
  document.getElementById('total-venda').value = `R$ ${(precoUnitario * quantidade).toFixed(2)}`;
 }
}

document.getElementById('sabor-venda').addEventListener('change', function () {
 const saborId = this.value;
 if (saborId) {
  const sabor = dados.sabores.find(s => s.id === saborId);
  if (sabor) {
   document.getElementById('preco-unitario').value = sabor.preco;
   calcularTotal();
  }
 }
});

document.getElementById('quantidade-venda').addEventListener('input', calcularTotal);
document.getElementById('preco-unitario').addEventListener('input', calcularTotal);

// Funções para Modal de Exclusão
function abrirModalExclusao() {
 const modal = document.getElementById('modal-excluir-sabor');
 const listaSabores = document.querySelector('.lista-sabores-excluir');

 // Limpa a lista atual
 listaSabores.innerHTML = '';

 // Adiciona cada sabor à lista
 dados.sabores.forEach(sabor => {
  const div = document.createElement('div');
  div.className = 'item-sabor-excluir';
  div.innerHTML = `
            <input type="checkbox" id="sabor-${sabor.id}" value="${sabor.id}">
            <div class="info-sabor">
                <h3>${sabor.nome}</h3>
                <p>Preço: R$ ${sabor.preco.toFixed(2)} | Estoque: ${sabor.estoque}</p>
            </div>
        `;
  listaSabores.appendChild(div);
 });

 // Mostra a modal
 modal.style.display = 'block';
}

function fecharModalExclusao() {
 const modal = document.getElementById('modal-excluir-sabor');
 modal.style.display = 'none';
}

function confirmarExclusaoSabores() {
 const checkboxes = document.querySelectorAll('.lista-sabores-excluir input[type="checkbox"]:checked');
 if (checkboxes.length === 0) {
  alert('Selecione pelo menos um sabor para excluir!');
  return;
 }
 if (confirm(`Tem certeza que deseja excluir ${checkboxes.length} sabor(es) selecionado(s)?`)) {
  // Remove os sabores selecionados
  checkboxes.forEach(checkbox => {
   const saborId = checkbox.value;
   // Remove do array de sabores
   dados.sabores = dados.sabores.filter(s => s.id !== saborId);
   // Remove do estoque
   delete dados.estoque[saborId];
  });
  // Salva as alterações no localStorage
  salvarDados();
  // Atualiza todas as listas e campos relacionados
  atualizarListaSabores();
  atualizarEstoque();
  atualizarListaVendas();
  // Limpa seleção do campo de venda se o sabor foi removido
  document.getElementById('sabor-venda').value = '';
  document.getElementById('preco-unitario').value = '';
  document.getElementById('total-venda').value = '';
  // Fecha a modal
  fecharModalExclusao();
  // Mostra mensagem de sucesso
  alert('Sabores excluídos com sucesso!');
 }
}

// Atualiza a função removerSaborSelecionado para abrir a modal
function removerSaborSelecionado() {
 abrirModalExclusao();
}

function animarEntrada() {
 const telaEntrada = document.getElementById('tela-entrada');
 telaEntrada.style.animation = 'fadeInZoom 0.7s reverse';
 setTimeout(() => {
  telaEntrada.style.display = 'none';
  document.getElementById('tela-inicial').style.display = 'block';
  mostrarDataHojeMenu();
 }, 600);
}

function salvarVenda() {
 const saborId = document.getElementById('sabor-venda').value;
 const quantidade = parseInt(document.getElementById('quantidade-venda').value);
 const precoUnitario = parseFloat(document.getElementById('preco-unitario').value);

 if (!saborId || isNaN(quantidade) || quantidade <= 0 || isNaN(precoUnitario) || precoUnitario <= 0) {
  toastFeedback('Preencha todos os campos corretamente!', 'erro');
  return;
 }

 const sabor = dados.sabores.find(s => s.id === saborId);
 if (sabor.estoque < quantidade) {
  toastFeedback('Quantidade indisponível em estoque!', 'erro');
  return;
 }

 if (document.getElementById('modo-treinamento') && document.getElementById('modo-treinamento').checked) {
  toastFeedback('Venda simulada (modo treinamento)!', 'sucesso');
  return;
 }

 // Data no formato dd/mm/yyyy com zero à esquerda
 const agora = new Date();
 const dia = String(agora.getDate()).padStart(2, '0');
 const mes = String(agora.getMonth() + 1).padStart(2, '0');
 const ano = agora.getFullYear();
 const dataVenda = `${dia}/${mes}/${ano}`;

 // Cria a nova venda
 const novaVenda = {
  id: Date.now().toString(),
  data: dataVenda,
  saborId: saborId,
  saborNome: sabor.nome,
  quantidade: quantidade,
  precoUnitario: precoUnitario,
  total: precoUnitario * quantidade
 };

 // Atualiza os dados
 dados.vendas.push(novaVenda);
 sabor.estoque -= quantidade;
 salvarDados();

 // Limpa os campos
 document.getElementById('sabor-venda').value = '';
 document.getElementById('quantidade-venda').value = '';
 document.getElementById('preco-unitario').value = '';
 document.getElementById('total-venda').value = '';

 // Atualiza as telas
 atualizarListaVendas();
 atualizarEstoque();
 toastFeedback('Venda registrada com sucesso!', 'sucesso');
}

function formatarDataDDMM(dataString) {
 // dataString pode ser no formato local (ex: 05/07/2024)
 const partes = dataString.split('/');
 if (partes.length >= 2) {
  return partes[0].padStart(2, '0') + '/' + partes[1].padStart(2, '0');
 }
 return dataString;
}

function mostrarDataHoje() {
 const hoje = new Date();
 const dia = String(hoje.getDate()).padStart(2, '0');
 const mes = String(hoje.getMonth() + 1).padStart(2, '0');
 document.getElementById('data-hoje').textContent = `Hoje: ${dia}/${mes}`;
}

function atualizarListaVendas() {
 mostrarDataHoje();
 const hoje = new Date().toLocaleDateString();
 const vendasHoje = dados.vendas.filter(v => v.data === hoje);
 const tbody = document.getElementById('lista-vendas-corpo');
 tbody.innerHTML = '';

 let totalHoje = 0;

 vendasHoje.forEach(venda => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
            <td>${formatarDataDDMM(venda.data)}</td>
            <td>${venda.saborNome}</td>
            <td>${venda.quantidade}</td>
            <td>R$ ${venda.total.toFixed(2)}</td>
        `;
  tbody.appendChild(tr);
  totalHoje += venda.total;
 });

 document.getElementById('total-vendido-hoje').textContent = `R$ ${totalHoje.toFixed(2)}`;
}

// Gerenciamento de Estoque
function atualizarEstoque() {
 const listaEstoque = document.getElementById('lista-estoque');
 listaEstoque.innerHTML = '';

 dados.sabores.forEach(sabor => {
  const div = document.createElement('div');
  div.className = 'item-estoque';
  div.innerHTML = `
            <h3>${sabor.nome}</h3>
            <p>Quantidade: ${sabor.estoque}</p>
            <p>Preço: R$ ${sabor.preco.toFixed(2)}</p>
            ${sabor.estoque < 10 ? '<p class="estoque-baixo"><i class="fas fa-exclamation-triangle"></i> Estoque Baixo!</p>' : ''}
            <button class="btn-grande azul" onclick="adicionarEstoque('${sabor.id}')">
                <i class="fas fa-plus"></i>
                Adicionar Estoque
            </button>
        `;
  listaEstoque.appendChild(div);
 });
}

function adicionarEstoque(saborId) {
 const sabor = dados.sabores.find(s => s.id === saborId);
 if (!sabor) {
  alert('Sabor não encontrado!');
  return;
 }
 let quantidade = prompt(`Adicionar estoque para ${sabor.nome}\nQuantidade atual: ${sabor.estoque}\nDigite a quantidade a adicionar:`);
 if (quantidade === null) return; // Cancelado
 quantidade = quantidade.replace(/[^0-9]/g, ''); // Aceita só números
 if (!quantidade || isNaN(quantidade) || parseInt(quantidade) <= 0) {
  alert('Digite um valor válido!');
  return;
 }
 sabor.estoque += parseInt(quantidade);
 if (sabor.estoque < 0) sabor.estoque = 0;
 salvarDados();
 atualizarEstoque();
 atualizarListaSabores();
 alert('Estoque atualizado com sucesso!');
}

function mostrarFormNovoSaborEstoque() {
 document.getElementById('btn-mostrar-form-novo-sabor').style.display = 'none';
 document.getElementById('form-novo-sabor-estoque').style.display = 'block';
}

function esconderFormNovoSaborEstoque() {
 document.getElementById('btn-mostrar-form-novo-sabor').style.display = 'block';
 document.getElementById('form-novo-sabor-estoque').style.display = 'none';
}

function adicionarNovoSaborEstoque() {
 const nome = document.getElementById('estoque-nome-sabor').value.trim();
 const preco = parseFloat(document.getElementById('estoque-valor-sabor').value);
 const quantidade = parseInt(document.getElementById('estoque-quantidade-sabor').value);

 if (!nome || isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade < 0) {
  alert('Preencha todos os campos corretamente!');
  return;
 }

 // Verifica se já existe sabor com esse nome
 if (dados.sabores.some(s => s.nome.toLowerCase() === nome.toLowerCase())) {
  alert('Já existe um sabor com esse nome!');
  return;
 }

 const novoId = Date.now().toString();
 const novoSabor = {
  id: novoId,
  nome: nome,
  preco: preco,
  estoque: quantidade
 };
 dados.sabores.push(novoSabor);
 dados.estoque[novoId] = quantidade;
 salvarDados();
 atualizarListaSabores();
 atualizarEstoque();
 // Limpa os campos
 document.getElementById('estoque-nome-sabor').value = '';
 document.getElementById('estoque-valor-sabor').value = '';
 document.getElementById('estoque-quantidade-sabor').value = '';
 esconderFormNovoSaborEstoque();
 alert('Novo sabor adicionado ao estoque!');
}

// Backup
function fazerBackup() {
 const dadosBackup = JSON.stringify(dados, null, 2);
 const blob = new Blob([dadosBackup], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `backup-geladinhos-${new Date().toISOString().split('T')[0]}.json`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

function mostrarDataHojeMenu() {
 const hoje = new Date();
 const dia = String(hoje.getDate()).padStart(2, '0');
 const mes = String(hoje.getMonth() + 1).padStart(2, '0');
 const el = document.getElementById('data-hoje-menu');
 if (el) {
  el.textContent = `Hoje: ${dia}/${mes}`;
 }
}

function alternarModoDark() {
 const body = document.body;
 const checkbox = document.getElementById('modo-dark');
 if (checkbox.checked) {
  body.classList.add('dark-mode');
  localStorage.setItem('modoDark', '1');
  document.getElementById('label-modo').textContent = 'Modo Claro';
 } else {
  body.classList.remove('dark-mode');
  localStorage.setItem('modoDark', '0');
  document.getElementById('label-modo').textContent = 'Modo Escuro';
 }
}

function abrirSuporte() {
 window.open('https://wa.me/5517992250729', '_blank');
}

// Ao carregar, aplica o modo salvo
window.addEventListener('DOMContentLoaded', function () {
 const modoDark = localStorage.getItem('modoDark');
 const checkbox = document.getElementById('modo-dark');
 if (modoDark === '1') {
  document.body.classList.add('dark-mode');
  if (checkbox) checkbox.checked = true;
  if (document.getElementById('label-modo')) document.getElementById('label-modo').textContent = 'Modo Claro';
 } else {
  document.body.classList.remove('dark-mode');
  if (checkbox) checkbox.checked = false;
  if (document.getElementById('label-modo')) document.getElementById('label-modo').textContent = 'Modo Escuro';
 }
});

function abrirModalExcluirEstoque() {
 const modal = document.getElementById('modal-excluir-estoque');
 const lista = document.getElementById('lista-estoque-excluir');
 lista.innerHTML = '';
 dados.sabores.forEach(sabor => {
  const div = document.createElement('div');
  div.className = 'item-sabor-excluir';
  div.innerHTML = `
            <input type="checkbox" id="excluir-estoque-${sabor.id}" value="${sabor.id}">
            <div class="info-sabor">
                <h3>${sabor.nome}</h3>
                <p>Preço: R$ ${sabor.preco.toFixed(2)} | Estoque: ${sabor.estoque}</p>
            </div>
        `;
  lista.appendChild(div);
 });
 modal.style.display = 'block';
}

function fecharModalExcluirEstoque() {
 document.getElementById('modal-excluir-estoque').style.display = 'none';
}

function confirmarExclusaoEstoque() {
 const checkboxes = document.querySelectorAll('#lista-estoque-excluir input[type="checkbox"]:checked');
 if (checkboxes.length === 0) {
  alert('Selecione pelo menos um estoque para excluir!');
  return;
 }
 if (confirm(`Tem certeza que deseja excluir ${checkboxes.length} estoque(s) selecionado(s)?`)) {
  checkboxes.forEach(checkbox => {
   const saborId = checkbox.value;
   dados.sabores = dados.sabores.filter(s => s.id !== saborId);
   delete dados.estoque[saborId];
  });
  salvarDados();
  atualizarListaSabores();
  atualizarEstoque();
  fecharModalExcluirEstoque();
  alert('Estoque(s) excluído(s) com sucesso!');
 }
}

function mostrarAlertaEstoqueBaixo() {
 const div = document.getElementById('alerta-estoque-baixo');
 const estoquesCriticos = dados.sabores.filter(s => s.estoque <= 10);
 if (estoquesCriticos.length === 0) {
  div.style.display = 'none';
  div.innerHTML = '';
  return;
 }
 let html = '<div class="alerta-estoque-baixo"><i class="fas fa-exclamation-triangle"></i> Atenção! Estoque baixo ou zerado para:<ul>';
 estoquesCriticos.forEach(sabor => {
  if (sabor.estoque === 0) {
   html += `<li><b>${sabor.nome}</b> <span style='color:#e74c3c;'>(Zerado)</span></li>`;
  } else {
   html += `<li><b>${sabor.nome}</b> (Restam ${sabor.estoque})</li>`;
  }
 });
 html += '</ul></div>';
 div.innerHTML = html;
 div.style.display = 'block';
}

// Calendário customizado para o dashboard
const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
let calendarioAno = (new Date()).getFullYear();
let calendarioMes = (new Date()).getMonth();
let calendarioDiaSelecionado = (new Date()).getDate();

function renderizarCalendarioDashboard() {
 const hoje = new Date();
 const dataSelecionada = new Date(calendarioAno, calendarioMes, calendarioDiaSelecionado);
 // Lado esquerdo
 let html = `<div class='calendario-dashboard'>
        <div class='calendario-lado-esq'>
            <div class='calendario-dia-grande'>${String(dataSelecionada.getDate()).padStart(2, '0')}</div>
            <div class='calendario-dia-semana'>${nomesDias[dataSelecionada.getDay()]}</div>
            <div class='calendario-mes-ano'>${nomesMeses[dataSelecionada.getMonth()]}<br>${dataSelecionada.getFullYear()}</div>
        </div>
        <div class='calendario-lado-dir'>
            <div class='calendario-mes-nav'>
                <button onclick='mudarMesCalendario(-1)' title='Mês anterior'>&lt;</button>
                <span class='calendario-mes-nome'>${nomesMeses[calendarioMes]} ${calendarioAno}</span>
                <button onclick='mudarMesCalendario(1)' title='Próximo mês'>&gt;</button>
            </div>
            <table><thead><tr>`;
 for (let d = 0; d < 7; d++) html += `<th>${nomesDias[d]}</th>`;
 html += `</tr></thead><tbody><tr>`;
 // Dias do mês
 const primeiroDia = new Date(calendarioAno, calendarioMes, 1).getDay();
 const diasNoMes = new Date(calendarioAno, calendarioMes + 1, 0).getDate();
 let dia = 1;
 for (let i = 0; i < 6; i++) { // até 6 linhas
  for (let j = 0; j < 7; j++) {
   if ((i === 0 && j < primeiroDia) || dia > diasNoMes) {
    html += `<td class='calendario-dia-vazio'></td>`;
   } else {
    let classe = '';
    if (dia === calendarioDiaSelecionado && calendarioMes === dataSelecionada.getMonth() && calendarioAno === dataSelecionada.getFullYear()) {
     classe = 'calendario-dia-selecionado';
    }
    html += `<td class='${classe}' onclick='selecionarDiaCalendario(${dia})'>${String(dia).padStart(2, '0')}</td>`;
    dia++;
   }
  }
  if (dia > diasNoMes) break;
  html += '</tr><tr>';
 }
 html += '</tr></tbody></table></div></div>';
 document.getElementById('dashboard-agenda').innerHTML = html;
}

function mudarMesCalendario(delta) {
 calendarioMes += delta;
 if (calendarioMes < 0) {
  calendarioMes = 11;
  calendarioAno--;
 } else if (calendarioMes > 11) {
  calendarioMes = 0;
  calendarioAno++;
 }
 // Se o dia selecionado não existe no novo mês, ajusta
 const diasNoMes = new Date(calendarioAno, calendarioMes + 1, 0).getDate();
 if (calendarioDiaSelecionado > diasNoMes) calendarioDiaSelecionado = diasNoMes;
 renderizarCalendarioDashboard();
 mostrarDashboardDia();
}

function selecionarDiaCalendario(dia) {
 calendarioDiaSelecionado = dia;
 renderizarCalendarioDashboard();
 mostrarDashboardDia();
}

// Sobrescrever mostrarDashboardDia para usar o calendário customizado
function mostrarDashboardDia() {
 const dia = calendarioDiaSelecionado;
 const mes = calendarioMes + 1;
 const ano = calendarioAno;
 const dataLocal = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
 const conteudo = document.getElementById('dashboard-conteudo');
 // Filtrar vendas do dia
 const vendasDia = dados.vendas.filter(v => v.data === dataLocal);
 if (vendasDia.length === 0) {
  conteudo.innerHTML = '<p style="text-align:center;color:#888;">Nenhuma venda registrada neste dia.</p>';
  return;
 }
 // Indicadores
 const totalVendido = vendasDia.reduce((soma, v) => soma + v.total, 0);
 const totalVendas = vendasDia.length;
 // Vendas por sabor
 const vendasPorSabor = {};
 vendasDia.forEach(v => {
  if (!vendasPorSabor[v.saborNome]) vendasPorSabor[v.saborNome] = 0;
  vendasPorSabor[v.saborNome] += v.quantidade;
 });
 // Mais vendido
 let maisVendido = '-';
 let maxQtd = 0;
 for (const sabor in vendasPorSabor) {
  if (vendasPorSabor[sabor] > maxQtd) {
   maisVendido = sabor;
   maxQtd = vendasPorSabor[sabor];
  }
 }
 // Montar cards
 let html = `<div class='dashboard-cards'>
        <div class='dashboard-card'><h3>Total Vendido</h3><div class='valor'>R$ ${totalVendido.toFixed(2)}</div></div>
        <div class='dashboard-card'><h3>Qtd. de Vendas</h3><div class='valor'>${totalVendas}</div></div>
        <div class='dashboard-card'><h3>Mais Vendido</h3><div class='valor'>${maisVendido}</div></div>
    </div>`;
 // Gráfico de pizza gourmet
 html += gerarGraficoPizzaDashboard(vendasPorSabor);
 conteudo.innerHTML = html;
}

function gerarGraficoPizzaDashboard(vendasPorSabor) {
 const sabores = Object.keys(vendasPorSabor);
 const total = Object.values(vendasPorSabor).reduce((a, b) => a + b, 0);
 if (sabores.length === 0 || total === 0) return '';
 // Cores gourmet
 const cores = ['#6dc77a', '#3b5998', '#f7b267', '#e57373', '#b0b7c3', '#4caf50', '#22304a', '#e67e22'];
 let angles = [];
 let start = 0;
 sabores.forEach((s, i) => {
  const val = vendasPorSabor[s];
  const angle = (val / total) * 360;
  angles.push({ start, end: start + angle, cor: cores[i % cores.length], nome: s, val });
  start += angle;
 });
 // SVG pizza gourmet
 let svg = `<div class='dashboard-grafico'><svg width='180' height='180' viewBox='0 0 36 36' style='transform:rotate(-90deg);'>`;
 if (sabores.length === 1) {
  // Círculo completo gourmet
  svg += `<circle cx='18' cy='18' r='16' fill='${angles[0].cor}' stroke='#fff' stroke-width='2'></circle>`;
 } else {
  angles.forEach(a => {
   const r = 16;
   const x1 = 18 + r * Math.cos(Math.PI * a.start / 180);
   const y1 = 18 + r * Math.sin(Math.PI * a.start / 180);
   const x2 = 18 + r * Math.cos(Math.PI * a.end / 180);
   const y2 = 18 + r * Math.sin(Math.PI * a.end / 180);
   const large = a.end - a.start > 180 ? 1 : 0;
   svg += `<path d='M18,18 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z' fill='${a.cor}' stroke='#fff' stroke-width='1.5'></path>`;
  });
 }
 svg += `</svg><div class='grafico-legenda'>`;
 angles.forEach(a => {
  svg += `<span><span class='cor-legenda' style='background:${a.cor}'></span> ${a.nome} <b>(${a.val})</b></span>`;
 });
 svg += `</div></div>`;
 return svg;
}

// Toast de feedback
function toastFeedback(msg, tipo = 'sucesso') {
 const toast = document.getElementById('toast-feedback');
 toast.textContent = msg;
 toast.className = 'toast-feedback toast-visivel' + (tipo === 'erro' ? ' toast-erro' : '');
 setTimeout(() => {
  toast.className = 'toast-feedback';
 }, 2500);
}

// Loader gourmet
function mostrarLoaderDashboard() {
 document.getElementById('dashboard-conteudo').innerHTML = `<div class='loader-gourmet'><div class='loader-circulo'></div></div>`;
} 