/* =========================================================
   MachSense — script.js
   Controle de acesso (protótipo) e alternância de telas.
   ========================================================= */

// Credenciais padrão do protótipo (substituir por autenticação de backend)
const CREDENCIAIS = {
  usuario: 'admin',
  senha: '123456',
};

const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const campoUsuario = document.getElementById('usuario');
const campoSenha = document.getElementById('senha');
const lembrar = document.getElementById('lembrar');
const botaoSair = document.getElementById('logout');
const lastUpdate = document.getElementById('last-update');

let usuarioLogado = null;
let relogio = null;

// ---------- Telas ----------
function mostrarDashboard() {
  loginScreen.hidden = true;
  appScreen.hidden = false;
  iniciarRelogio();
}

function mostrarLogin() {
  appScreen.hidden = true;
  loginScreen.hidden = false;
  loginError.hidden = true;
  campoSenha.value = '';
  campoSenha.focus();
  pararRelogio();
}

// ---------- Autenticação (protótipo) ----------
function validarCredenciais(usuario, senha) {
  return usuario === CREDENCIAIS.usuario && senha === CREDENCIAIS.senha;
}

function marcarErro() {
  loginError.hidden = false;
  [campoUsuario, campoSenha].forEach((campo) => {
    campo.closest('.field').classList.add('field-invalid');
    campo.classList.add('is-shaking');
    setTimeout(() => campo.classList.remove('is-shaking'), 300);
  });
  campoSenha.select();
}

function limparErro() {
  loginError.hidden = true;
  [campoUsuario, campoSenha].forEach((campo) => {
    campo.closest('.field').classList.remove('field-invalid');
  });
}

loginForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const usuario = campoUsuario.value.trim();
  const senha = campoSenha.value;

  if (!validarCredenciais(usuario, senha)) {
    marcarErro();
    return;
  }

  usuarioLogado = usuario;
  limparErro();

  if (lembrar.checked) {
    sessionStorage.setItem('machsense_usuario', usuarioLogado);
  }

  mostrarDashboard();
});

[campoUsuario, campoSenha].forEach((campo) => {
  campo.addEventListener('input', limparErro);
});

botaoSair.addEventListener('click', (evento) => {
  evento.preventDefault();
  usuarioLogado = null;
  sessionStorage.removeItem('machsense_usuario');
  mostrarLogin();
});

// ---------- Relógio de "última atualização" ----------
function formatarHora(data) {
  const partes = [data.getHours(), data.getMinutes(), data.getSeconds()];
  return partes.map((n) => String(n).padStart(2, '0')).join(':');
}

function iniciarRelogio() {
  pararRelogio();
  const atualizar = () => {
    lastUpdate.textContent = `Hoje, ${formatarHora(new Date())} (live)`;
  };
  atualizar();
  relogio = setInterval(atualizar, 1000);
}

function pararRelogio() {
  if (relogio !== null) {
    clearInterval(relogio);
    relogio = null;
  }
}

// ---------- Inicialização ----------
const sessaoSalva = sessionStorage.getItem('machsense_usuario');

if (sessaoSalva) {
  usuarioLogado = sessaoSalva;
  mostrarDashboard();
} else {
  mostrarLogin();
}
