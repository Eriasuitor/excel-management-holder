'use strict'
// eslint-disable-next-line no-unused-vars
const {Sequelize, Model, DataTypes} = require('sequelize')
const LiquidityParentType = require('../../enum/liquidity_parent_type')

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  const liquidityType = sequelize.define('liquidityType', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    projectId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    parentType: {
      type: DataTypes.ENUM(Object.values(LiquidityParentType)),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(32),
      allowNull: false
    }
  }, {
    indexes: [
      {fields: ['projectId', 'parentType', 'type'], type: 'UNIQUE'}
    ],
    paranoid: true
  })
  liquidityType.associate = function(models) {
    liquidityType.belongsTo(models.project, {onDelete: 'RESTRICT'})
  }
  return liquidityType
}
