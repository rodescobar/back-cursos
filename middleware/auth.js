const jwt = require('jsonwebtoken');
const { getConnection } = require('../utils/dbConnection');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Obtém conexão reutilizável do pool
        const userDb = await getConnection(decoded.usuario);

        // Adiciona a conexão do banco do usuário ao objeto req
        req.userDb = userDb;
        req.usuario = decoded.usuario;
        
        next();
    } catch (error) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
};