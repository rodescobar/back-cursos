const mongoose = require('mongoose');

// Deletar todos os cursos do usuário
exports.deletarTodosCursos = async (req, res) => {
    try {
        const userDb = req.userDb;
        const Curso = userDb.model('Curso', require('../models/curso'));
        
        // Remove todos os documentos da coleção de cursos
        await Curso.deleteMany({});

        return res.status(200).json({ msg: "Todos os cursos foram deletados com sucesso" });
    } catch (error) {
        console.error('Erro ao deletar cursos:', error);
        return res.status(500).json({ erro: "Erro ao deletar cursos" });
    }
};

exports.criarCurso = async (req, res) => {
    const { titulo, descricao, imagens, aulas } = req.body;
    const userDb = req.userDb;

    try {
        const Curso = userDb.model('Curso', require('../models/curso'));
        
        const cursoExiste = await Curso.findOne({ titulo });
        if (cursoExiste) {
            return res.status(400).json({ erro: "Curso já existe" });
        }

        const novoCurso = await Curso.create({
            titulo,
            descricao,
            imagens,
            aulas: aulas.map((aula, index) => ({
                ...aula,
                numero: index + 1
            }))
        });

        return res.status(200).json({ msg: "Curso criado com sucesso", curso: novoCurso });
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao criar curso" });
    }
};

exports.listarCursos = async (req, res) => {
    const userDb = req.userDb;

    try {
        const Curso = userDb.model('Curso', require('../models/curso'));
        const cursos = await Curso.find({});
        return res.status(200).json(cursos);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao listar cursos" });
    }
};

exports.buscarCurso = async (req, res) => {
    const { id } = req.params;
    const userDb = req.userDb;

    try {
        const Curso = userDb.model('Curso', require('../models/curso'));
        const curso = await Curso.findById(id);
        
        if (!curso) {
            return res.status(404).json({ erro: "Curso não encontrado" });
        }

        return res.status(200).json(curso);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao buscar curso" });
    }
};

exports.atualizarCurso = async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, imagens, aulas } = req.body;
    const userDb = req.userDb;

    try {
        const Curso = userDb.model('Curso', require('../models/curso'));
        
        const cursoExiste = await Curso.findById(id);
        if (!cursoExiste) {
            return res.status(404).json({ erro: "Curso não encontrado" });
        }

        const cursoAtualizado = await Curso.findByIdAndUpdate(
            id,
            {
                titulo,
                descricao,
                imagens,
                aulas: aulas.map((aula, index) => ({
                    ...aula,
                    numero: index + 1
                }))
            },
            { new: true }
        );

        return res.status(200).json({ msg: "Curso atualizado com sucesso", curso: cursoAtualizado });
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao atualizar curso" });
    }
};

exports.deletarCurso = async (req, res) => {
    const { id } = req.params;
    const userDb = req.userDb;

    try {
        const Curso = userDb.model('Curso', require('../models/curso'));
        
        const curso = await Curso.findById(id);
        if (!curso) {
            return res.status(404).json({ erro: "Curso não encontrado" });
        }

        await Curso.findByIdAndDelete(id);
        return res.status(200).json({ msg: "Curso deletado com sucesso" });
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao deletar curso" });
    }
};