'use strict'
// eslint-disable-next-line no-unused-vars
const {Sequelize, Model, DataTypes} = require('sequelize')

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  const document = sequelize.define('document', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    projectId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    financialSourceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    humanReadableId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: '会计提供的凭证号'
    },
    abstract: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    liquidityTypeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    generatedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    handler: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: ''
    },
    remark: {
      type: DataTypes.STRING(256),
      allowNull: false,
      defaultValue: ''
    }
  }, {
    indexes: [
    ]
  })
  document.associate = function(models) {
    document.belongsTo(models.financialSource, {onDelete: 'RESTRICT'})
    document.belongsTo(models.liquidityType, {onDelete: 'RESTRICT'})
    document.belongsTo(models.project, {onDelete: 'RESTRICT'})
  }
  return document
}
