require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { closeAllConnections } = require('./utils/dbConnection');

const app = express();


app.use(cors());
app.use(express.json());

// Configuração do Swagger UI
const swaggerDocument = YAML.load(path.join(__dirname, 'api/swagger-ui/swagger.yaml'));
const swaggerOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API de Gerenciamento de Cursos",
    swaggerOptions: {
        url: '/api-docs/swagger.json',
        persistAuthorization: true
    }
};

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.use('/api-docs', swaggerUi.setup(swaggerDocument, swaggerOptions));

// Redireciona a raiz para a documentação Swagger
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// Rotas
app.use('/usuario', require('./routes/usuario'));
app.use('/cursos', require('./routes/curso'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Graceful shutdown - fecha todas as conexões ao desligar
process.on('SIGINT', async () => {
    console.log('\nRecebido SIGINT. Encerrando gracefully...');
    
    server.close(async () => {
        console.log('Servidor HTTP fechado');
        await closeAllConnections();
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('\nRecebido SIGTERM. Encerrando gracefully...');
    
    server.close(async () => {
        console.log('Servidor HTTP fechado');
        await closeAllConnections();
        process.exit(0);
    });
});