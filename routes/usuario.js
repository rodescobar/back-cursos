const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario');
const auth = require('../middleware/auth');

// Rotas públicas
router.post('/registro', usuarioController.registro);
router.post('/login', usuarioController.login);

// Rotas protegidas
router.use(auth);
router.get('/perfil', usuarioController.getDadosUsuario);
router.put('/atualizar', usuarioController.atualizarDados);
router.put('/alterar-senha', usuarioController.alterarSenha);

module.exports = router;