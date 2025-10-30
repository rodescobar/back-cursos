const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Pega a string de conexão base do .env
        const baseUri = process.env.MONGODB_URI;
        // Remove o último parâmetro (se houver) e adiciona o nome do banco do usuário
        const userUri = baseUri.replace(/\/[^\/]*\?/, `/${decoded.usuario}?`);
        
        // Conecta ao banco de dados do usuário
        const userDb = mongoose.createConnection(userUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Adiciona a conexão do banco do usuário ao objeto req
        req.userDb = userDb;
        req.usuario = decoded.usuario;
        
        next();
    } catch (error) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
};