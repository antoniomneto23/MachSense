document.addEventListener('DOMContentLoaded', function () {
    const $ = function (id) { return document.getElementById(id); };

    const telaLogin = $('login-screen');
    const app = $('app');
    const topbar = $('topbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const views = { dashboard: $('view-dashboard'), usuarios: $('view-usuarios') };

    const loginForm = $('login-form');
    const loginErro = $('login-error');
    const loginBotao = $('login-submit');

    const listaUsuarios = $('usuarios-lista');
    const painelForm = $('usuario-form-panel');
    const usuarioForm = $('usuario-form');
    const usuarioErro = $('usuario-error');
    const usuarioBotao = $('usuario-submit');

    let usuarioLogado = null;
    let editandoId = null;

    function mostrarErro(caixa, mensagem) {
        caixa.querySelector('p').textContent = mensagem;
        caixa.hidden = false;
    }

    function esconderErro(caixa) {
        caixa.hidden = true;
    }

    /* ===================== SESSÃO / TELAS ===================== */

    function iniciais(nome) {
        const partes = nome.trim().split(/\s+/);
        const primeira = partes[0].charAt(0);
        const segunda = partes.length > 1 ? partes[partes.length - 1].charAt(0) : partes[0].charAt(1);

        return (primeira + segunda).toUpperCase();
    }

    function atualizarSidebar() {
        $('user-nome').textContent = usuarioLogado.nome;
        $('user-avatar').textContent = iniciais(usuarioLogado.nome);
    }

    function entrar(usuario) {
        usuarioLogado = usuario;
        atualizarSidebar();
        telaLogin.hidden = true;
        app.hidden = false;
        mostrarView('dashboard');
    }

    function sair() {
        MachSenseSessao.encerrar();
        usuarioLogado = null;
        app.hidden = true;
        telaLogin.hidden = false;
        loginForm.reset();
        esconderErro(loginErro);
    }

    $('logout').addEventListener('click', function (e) {
        e.preventDefault();
        sair();
    });

    /* ===================== NAVEGAÇÃO ===================== */

    function mostrarView(nome) {
        Object.keys(views).forEach(function (chave) {
            views[chave].hidden = chave !== nome;
        });
        topbar.hidden = nome !== 'dashboard';

        navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.dataset.view === nome);
        });

        if (nome === 'usuarios') {
            fecharForm();
            renderUsuarios();
        }
    }

    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            if (link.dataset.view) {
                mostrarView(link.dataset.view);
            }
        });
    });

    /* ===================== LOGIN ===================== */

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        esconderErro(loginErro);

        const usuario = $('usuario').value.trim();
        const senha = $('senha').value;

        if (usuario === '' || senha === '') {
            mostrarErro(loginErro, 'Informe usuário e senha.');
            return;
        }

        const textoBotao = loginBotao.textContent;
        loginBotao.disabled = true;
        loginBotao.textContent = 'Acessando...';

        try {
            const encontrado = await MachSenseStore.autenticar(usuario, senha);

            if (!encontrado) {
                mostrarErro(loginErro, 'Usuário ou senha inválidos. Verifique os dados e tente novamente.');
                return;
            }

            MachSenseSessao.iniciar(encontrado.id, $('lembrar').checked);
            $('senha').value = '';
            entrar(encontrado);
        } catch (err) {
            mostrarErro(loginErro, err.message);
        } finally {
            loginBotao.disabled = false;
            loginBotao.textContent = textoBotao;
        }
    });

    /* ===================== CRUD DE USUÁRIOS ===================== */

    function celula(texto, classe) {
        const td = document.createElement('td');
        td.textContent = texto;
        if (classe) {
            td.className = classe;
        }
        return td;
    }

    function botao(texto, acao, id) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'link';
        b.textContent = texto;
        b.dataset.acao = acao;
        b.dataset.id = id;
        return b;
    }

    function linhaUsuario(u) {
        const tr = document.createElement('tr');
        const acoes = document.createElement('td');
        const excluir = botao('Excluir', 'excluir', u.id);

        if (usuarioLogado && u.id === usuarioLogado.id) {
            excluir.disabled = true;
            excluir.title = 'Você não pode excluir o usuário logado';
        }

        acoes.append(botao('Editar', 'editar', u.id), ' ', excluir);
        tr.append(
            celula(u.nome),
            celula(u.usuario, 'mono'),
            celula(new Date(u.criadoEm).toLocaleString('pt-BR'), 'mono'),
            acoes
        );

        return tr;
    }

    async function renderUsuarios() {
        const lista = await MachSenseStore.listar();
        listaUsuarios.replaceChildren(...lista.map(linhaUsuario));
    }

    function abrirForm(usuario) {
        editandoId = usuario ? usuario.id : null;

        $('t-usuario-form').textContent = usuario ? 'Editar usuário' : 'Novo usuário';
        $('u-nome').value = usuario ? usuario.nome : '';
        $('u-usuario').value = usuario ? usuario.usuario : '';
        $('u-senha').value = '';
        $('u-senha-hint').textContent = usuario
            ? 'Deixe em branco para manter a senha atual. Mínimo de 6 caracteres.'
            : 'Mínimo de 6 caracteres.';

        esconderErro(usuarioErro);
        painelForm.hidden = false;
        $('u-nome').focus();
    }

    function fecharForm() {
        editandoId = null;
        usuarioForm.reset();
        esconderErro(usuarioErro);
        painelForm.hidden = true;
    }

    $('usuario-novo').addEventListener('click', function () {
        abrirForm(null);
    });

    $('usuario-cancelar').addEventListener('click', fecharForm);

    usuarioForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        esconderErro(usuarioErro);

        const dados = {
            nome: $('u-nome').value,
            usuario: $('u-usuario').value,
            senha: $('u-senha').value
        };

        usuarioBotao.disabled = true;

        try {
            if (editandoId === null) {
                await MachSenseStore.criar(dados);
            } else {
                const atualizado = await MachSenseStore.atualizar(editandoId, dados);

                if (usuarioLogado && atualizado.id === usuarioLogado.id) {
                    usuarioLogado = atualizado;
                    atualizarSidebar();
                }
            }

            fecharForm();
            await renderUsuarios();
        } catch (err) {
            mostrarErro(usuarioErro, err.message);
        } finally {
            usuarioBotao.disabled = false;
        }
    });

    listaUsuarios.addEventListener('click', async function (e) {
        const alvo = e.target.closest('button[data-acao]');
        if (!alvo || alvo.disabled) {
            return;
        }

        const id = Number(alvo.dataset.id);

        try {
            const usuario = await MachSenseStore.buscar(id);
            if (!usuario) {
                await renderUsuarios();
                return;
            }

            if (alvo.dataset.acao === 'editar') {
                abrirForm(usuario);
            } else if (window.confirm('Excluir o usuário "' + usuario.usuario + '"?')) {
                await MachSenseStore.remover(id);
                if (editandoId === id) {
                    fecharForm();
                }
                await renderUsuarios();
            }
        } catch (err) {
            window.alert(err.message);
        }
    });

    /* ===================== INICIALIZAÇÃO ===================== */

    async function iniciar() {
        try {
            await MachSenseStore.iniciar();

            const sessao = MachSenseSessao.atual();
            const usuario = sessao && sessao.usuarioId ? await MachSenseStore.buscar(sessao.usuarioId) : null;

            if (usuario) {
                entrar(usuario);
                return;
            }
        } catch (err) {
            mostrarErro(loginErro, err.message);
            return;
        }

        sair();
    }

    iniciar();
});
