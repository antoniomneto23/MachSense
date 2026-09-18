<?php

session_start();
require_once __DIR__ . '/includes/Usuario.php';

$erro = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $senha = trim($_POST['senha'] ?? '');

    if ($email === '' || $senha === '') {
        $erro = 'Preencha e-mail e senha.';
    } else {
        $usuario = Usuario::autenticar($email, $senha);

        if ($usuario) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nome'] = $usuario['nome'];

            header('Location: dashboard.php');
            exit;
        }

        $erro = 'E-mail ou senha inválidos.';
    }
}

$_SESSION['login_erro'] = $erro;
header('Location: index.php');
exit;
