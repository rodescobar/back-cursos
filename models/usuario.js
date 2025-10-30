const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    usuario: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    email: { type: String, required: true },
    nome: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = usuarioSchema;