'use strict'
// eslint-disable-next-line no-unused-vars
const {Sequelize, Model, DataTypes} = require('sequelize')

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  const documentSummary = sequelize.define('documentSummary', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    financialSourceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    month: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    indexes: [
      {fields: ['financialSourceId', 'year', 'month'], type: 'UNIQUE'}
    ]
  })
  documentSummary.associate = function(models) {
    documentSummary.belongsTo(models.financialSource, {onDelete: 'RESTRICT'})
  }
  return documentSummary
}
