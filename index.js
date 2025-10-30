require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

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

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    w: "majority"
}).then(() => {
    console.log('Conectado ao MongoDB Atlas com sucesso!');
}).catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
});

// Rotas
app.use('/usuario', require('./routes/usuario'));
app.use('/cursos', require('./routes/curso'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});