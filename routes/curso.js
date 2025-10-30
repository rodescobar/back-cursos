const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/curso');
const auth = require('../middleware/auth');

router.use(auth);

router.delete('/deletar-todos', cursoController.deletarTodosCursos);
router.post('/', cursoController.criarCurso);
router.get('/', cursoController.listarCursos);
router.get('/:id', cursoController.buscarCurso);
router.put('/:id', cursoController.atualizarCurso);
router.delete('/:id', cursoController.deletarCurso);

module.exports = router;