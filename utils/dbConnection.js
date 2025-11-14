const mongoose = require('mongoose');

// Pool de conexões (cache)
const connections = new Map();

/**
 * Obtém ou cria uma conexão para um banco específico
 * Reutiliza conexões existentes para evitar esgotar o pool
 */
const getConnection = async (dbName) => {
    // Se já existe conexão ativa para este banco, reutiliza
    if (connections.has(dbName)) {
        const conn = connections.get(dbName);
        
        // Verifica se a conexão ainda está ativa
        if (conn.readyState === 1) { // 1 = connected
            return conn;
        } else {
            // Remove conexão inválida
            connections.delete(dbName);
        }
    }

    // Cria nova conexão
    const baseUri = process.env.MONGODB_URI;
    const userUri = baseUri.replace(/\/[^\/]*\?/, `/${dbName}?`);
    
    const connection = mongoose.createConnection(userUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Máximo de conexões no pool por banco
        minPoolSize: 2,  // Mínimo de conexões mantidas
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
    });

    // Aguarda a conexão estar pronta
    await connection.asPromise();

    // Armazena no cache
    connections.set(dbName, connection);

    // Listeners para debug (opcional, pode remover em produção)
    connection.on('error', (err) => {
        console.error(`Erro na conexão do banco ${dbName}:`, err);
        connections.delete(dbName);
    });

    connection.on('disconnected', () => {
        console.log(`Banco ${dbName} desconectado`);
        connections.delete(dbName);
    });

    return connection;
};

/**
 * Obtém a conexão central (banco padrão de usuários)
 */
const getCentralConnection = async () => {
    // Extrai o nome do banco padrão da URI
    const match = process.env.MONGODB_URI.match(/\/([^\/\?]+)\?/);
    const defaultDbName = match ? match[1] : 'test';
    
    return getConnection(defaultDbName);
};

/**
 * Fecha todas as conexões (usar no shutdown do servidor)
 */
const closeAllConnections = async () => {
    console.log(`Fechando ${connections.size} conexões...`);
    
    const closePromises = [];
    for (const [dbName, connection] of connections.entries()) {
        closePromises.push(
            connection.close().then(() => {
                console.log(`Conexão ${dbName} fechada`);
            }).catch(err => {
                console.error(`Erro ao fechar ${dbName}:`, err);
            })
        );
    }
    
    await Promise.all(closePromises);
    connections.clear();
    console.log('Todas as conexões fechadas');
};

/**
 * Retorna estatísticas das conexões ativas
 */
const getConnectionStats = () => {
    const stats = [];
    for (const [dbName, connection] of connections.entries()) {
        stats.push({
            database: dbName,
            state: connection.readyState,
            host: connection.host,
            name: connection.name
        });
    }
    return stats;
};

module.exports = {
    getConnection,
    getCentralConnection,
    closeAllConnections,
    getConnectionStats
};
