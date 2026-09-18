<?php

require_once __DIR__ . '/db.php';

/**
 * Estrutura de cadastro do usuário do sistema MachSense.
 *
 * O usuário é fixo/pré-cadastrado (seed) — não há tela pública
 * de cadastro. Esta classe define a entidade e as operações
 * necessárias para autenticação e manutenção do cadastro.
 */
class Usuario
{
    public ?int $id;
    public string $nome;
    public string $email;
    public string $senha; // hash (password_hash)

    public function __construct(string $nome, string $email, string $senha, ?int $id = null)
    {
        $this->id = $id;
        $this->nome = $nome;
        $this->email = $email;
        $this->senha = $senha;
    }

    /**
     * Cadastra um novo usuário (uso interno / seed — não exposto
     * em tela pública).
     */
    public static function cadastrar(string $nome, string $email, string $senhaTextoPuro): bool
    {
        global $pdo;

        $hash = password_hash($senhaTextoPuro, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare(
            'INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)'
        );

        return $stmt->execute([
            ':nome'  => $nome,
            ':email' => $email,
            ':senha' => $hash,
        ]);
    }

    /**
     * Busca um usuário pelo e-mail.
     */
    public static function buscarPorEmail(string $email): ?array
    {
        global $pdo;

        $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $usuario = $stmt->fetch();

        return $usuario ?: null;
    }

    /**
     * Valida as credenciais informadas no login.
     */
    public static function autenticar(string $email, string $senhaTextoPuro): ?array
    {
        $usuario = self::buscarPorEmail($email);

        if (!$usuario) {
            return null;
        }

        if (!password_verify($senhaTextoPuro, $usuario['senha'])) {
            return null;
        }

        return $usuario;
    }
}
