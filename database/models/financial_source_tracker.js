'use strict'
// eslint-disable-next-line no-unused-vars
const {Sequelize, Model, DataTypes} = require('sequelize')

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  const financialSourceTracker = sequelize.define('financialSourceTracker', {
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
    monthlyCarryoverAmount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    income: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    expense: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    indexes: [
      {fields: ['financialSourceId', 'year', 'month'], type: 'UNIQUE'}
    ]
  })
  financialSourceTracker.associate = function(models) {
    financialSourceTracker.belongsTo(models.financialSource, {onDelete: 'RESTRICT'})
  }
  return financialSourceTracker
}
