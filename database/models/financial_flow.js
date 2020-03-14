'use strict'
// eslint-disable-next-line no-unused-vars
const {Sequelize, Model, DataTypes} = require('sequelize')
/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  const financialFlow = sequelize.define('financial_flow', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    financialSourceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    abstract: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    humanReadableId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: '会计提供的凭证号'
    },
    incomeAmount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    expenseAmount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    generatedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false
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
  financialFlow.associate = function(models) {
    financialFlow.belongsTo(models.financialSource, {onDelete: 'RESTRICT'})
  }
  return financialFlow
}
