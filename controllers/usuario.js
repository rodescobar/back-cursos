const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getCentralConnection, getConnection } = require('../utils/dbConnection');

// Schema do usuário para o banco central
const usuarioSchema = new mongoose.Schema({
    usuario: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    email: { type: String, required: true },
    nome: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Função para obter o modelo de usuário
const getUsuarioModel = async () => {
    const centralConnection = await getCentralConnection();
    return centralConnection.model('Usuario', usuarioSchema);
};

// Registrar novo usuário
exports.registro = async (req, res) => {
    const { usuario, senha, email, nome } = req.body;
    
    try {
        const UsuarioCentral = await getUsuarioModel();
        
        // Verifica se o usuário já existe no banco central
        const usuarioExiste = await UsuarioCentral.findOne({ usuario });
        
        if (usuarioExiste) {
            return res.status(400).json({ erro: "Usuário já existe" });
        }

        // Se não existe, cria o usuário no banco central
        const hashedPassword = await bcrypt.hash(senha, 10);
        await new UsuarioCentral({
            usuario,
            senha: hashedPassword,
            email,
            nome
        }).save();

        // Cria o banco específico do usuário (apenas para inicializar)
        // A conexão será gerenciada pelo pool
        await getConnection(usuario);

        return res.status(200).json({ msg: "Usuário criado com sucesso" });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({ erro: "Erro ao criar usuário" });
    }
};

// Login
exports.login = async (req, res) => {
    const { usuario, senha } = req.body;
    
    try {
        const UsuarioCentral = await getUsuarioModel();
        
        // Busca o usuário no banco central
        const user = await UsuarioCentral.findOne({ usuario });
        
        if (!user) {
            return res.status(401).json({ erro: "Usuário ou senha inválidos" });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: "Usuário ou senha inválidos" });
        }

        // Definir tempo de expiração (24 horas em segundos)
        const expiresIn = 24 * 60 * 60;
        const timestamp = Math.floor(Date.now() / 1000);
        const expires_at = timestamp + expiresIn;

        const token = jwt.sign({ 
            usuario: user.usuario,
            nome: user.nome,
            email: user.email
        }, process.env.JWT_SECRET, { 
            expiresIn: `${expiresIn}s`
        });
        
        return res.status(200).json({ 
            token,
            expires_in: expiresIn,
            expires_at,
            timestamp,
            usuario: {
                nome: user.nome,
                email: user.email,
                usuario: user.usuario
            }
        });
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        return res.status(500).json({ erro: "Erro ao realizar login" });
    }
};

// Recuperar dados do usuário
exports.getDadosUsuario = async (req, res) => {
    try {
        const UsuarioCentral = await getUsuarioModel();
        const user = await UsuarioCentral.findOne({ usuario: req.usuario }).select('-senha');
        
        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao recuperar dados:', error);
        return res.status(500).json({ erro: "Erro ao recuperar dados do usuário" });
    }
};

// Alterar dados do usuário
exports.atualizarDados = async (req, res) => {
    const { nome, email } = req.body;
    
    try {
        const UsuarioCentral = await getUsuarioModel();
        const user = await UsuarioCentral.findOne({ usuario: req.usuario });
        
        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        user.nome = nome || user.nome;
        user.email = email || user.email;

        await user.save();

        return res.status(200).json({ 
            msg: "Dados atualizados com sucesso",
            usuario: {
                nome: user.nome,
                email: user.email,
                usuario: user.usuario
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        return res.status(500).json({ erro: "Erro ao atualizar dados" });
    }
};

// Alterar senha
exports.alterarSenha = async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;
    
    try {
        const UsuarioCentral = await getUsuarioModel();
        const user = await UsuarioCentral.findOne({ usuario: req.usuario });
        
        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha atual incorreta" });
        }

        user.senha = await bcrypt.hash(novaSenha, 10);
        await user.save();

        return res.status(200).json({ msg: "Senha alterada com sucesso" });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        return res.status(500).json({ erro: "Erro ao alterar senha" });
    }
};