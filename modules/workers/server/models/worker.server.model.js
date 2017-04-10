'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Worker Schema
 */
var WorkerSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Por favor, preencha o nome do trabalhador'
    //trim: true
  },
  lastname: {
    type: String,
    default: '',
    required: 'Por favor, preencha o sobrenome do trabalhador'
    //trim: true
  },
  dataNascimento: {
    type: Date
  },
  CPF: {
    type: String, 
    required: 'Por favor, preencha o CPF do trabalhador', 
    unique: 'O CPF fornecido já está cadastrado no sistema'
  },
  PIS: {
    type: String, 
    required: 'Por favor, preencha o PIS do trabalhador', 
    unique: 'O número de PIS fornecdio já está cadastrado no sistema'
  },
  matricula: {
    type: String, 
    unique: 'O número de matrícula fornecido já está cadastrado no sistema'
  },
  email: {
    type: String, 
    unique: 'O e-mail fornecido já está cadastrado no sistema'
  },
  alocacao: {
    dataAdmissao: {
      type: Date, 
      required: 'O campo de Data de Admissão deve ser preenchido'
    },
    dataInicioEfetivo: Date, //é usada apenas na escala 12x36h
    cargo: {
      type: Schema.Types.ObjectId, 
      ref: 'Cargo', 
      required: 'O Cargo deve ser preenchido'
    },
    turno: {
      type: Schema.Types.ObjectId, 
      ref: 'Turno', 
      required: 'O Turno deve ser preenchido'
    },
    instituicao: {
      type: Schema.Types.ObjectId, 
      ref: 'Instituicao', 
      required: 'A Instituição deve ser fornecida'
    },
    gestor: {
      type: Boolean
    }
  },
  rhponto: {
    type: Boolean, 
    required: true
  }, //usa o sistema caso TRUE, usa relogio de ponto caso FALSE
  sexoMasculino: {
    type: Boolean, 
    required: true
  },
  ferias: [
    {
      ano: Number, 
      periodo: [
        Date
      ]
    }
  ]
}, {
  
  timestamps: true
});

mongoose.model('Worker', WorkerSchema);
