'use strict'
// eslint-disable-next-line no-unused-vars
const {Sequelize, Model, DataTypes} = require('sequelize')

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  const financialSource = sequelize.define('financialSource', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    desc: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    initialStock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    indexes: [
      {fields: ['name'], type: 'UNIQUE'}
    ],
    paranoid: true
  })
  financialSource.associate = function(models) {
  }
  return financialSource
}
