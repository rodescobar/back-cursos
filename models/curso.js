const mongoose = require('mongoose');

const aulaSchema = new mongoose.Schema({
    numero: { type: Number, required: true },
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    tempo: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const cursoSchema = new mongoose.Schema({
    titulo: { type: String, required: true, unique: true },
    descricao: { type: String, required: true },
    imagens: [{ type: String }],
    aulas: [aulaSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = cursoSchema;