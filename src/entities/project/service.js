const {superError} = require('../../utils/error')
const db = require('../../database/models')
const sqlTool = require('../../utils/sqlTool')

module.exports = class {
  static async add(transaction, project) {
    const existedProject = await db.project.findOne({
      where: {name: project.name},
      paranoid: false,
      transaction
    })
    if (existedProject) {
      if (existedProject.deletedAt !== null) {
        existedProject.desc = project.desc || ''
        return existedProject.restore({transaction})
      }
      superError(409, `项目“${project.name}”已经存在。`).throw()
    }
    return db.project.create(project, {
      transaction,
      raw: true
    })
  }

  static async update(transaction, projectId, project) {
    if (project.name) {
      const existedProject = await db.project.findOne({
        where: {name: project.name},
        raw: true,
        attributes: ['id'],
        transaction
      })
      if (existedProject) {
        if (existedProject.id != projectId) {
          superError(409, `项目“${project.name}”已经或曾经存在。`).throw()
        }
      }
    }
    return db.project.update(project, {
      where: {id: projectId},
      transaction
    })
  }

  static async remove(transaction, projectId) {
    return db.project.destroy({
      where: {id: projectId},
      transaction
    })
  }

  static async query(transaction, queryCondition, pageAndOrder) {
    const {orderBy} = pageAndOrder
    const [count, rows] = await Promise.all([
      db.project.count({
        ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
        ...sqlTool.resolveSequelizePageAndOrder(pageAndOrder)
      }),
      db.project.findAll({
        ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
        ...sqlTool.resolveSequelizePageAndOrder(pageAndOrder),
        include: [{
          model: db.liquidityType
        }],
        ...(orderBy? {}: {order: [['id', 'ASC'], [db.liquidityType, 'id', 'ASC']]}),
        transaction
      })
    ])
    return {count, rows: rows.map((_) => _.toJSON())}
  }

  static async addLiquidityType(transaction, projectId, {parentType, type}) {
    const existed = await db.liquidityType.findOne({
      where: {projectId, parentType, type},
      paranoid: false,
      transaction
    })
    if (existed) {
      if (existed.deletedAt !== null) {
        return existed.restore({transaction})
      }
      superError(409, `该项目的“${type}”收入或支出类型已经存在。`).throw()
    }
    return db.liquidityType.create({
      projectId, parentType, type
    }, {transaction})
  }

  static async updateLiquidityType(transaction, liquidityTypeId, {type}) {
    const existed = await db.liquidityType.findOne({
      where: {id: liquidityTypeId},
      transaction
    })
    if (!existed) return
    const duplicated = await db.liquidityType.findOne({
      where: {projectId: existed.projectId, parentType: existed.parentType, type},
      transaction
    })
    if (duplicated) {
      if (duplicated.id == liquidityTypeId) {
        return duplicated
      }
      superError(409, `该项目的“${type}”收入或支出类型已经或曾经存在。`).throw()
    }
    existed.type = type
    return existed.save({transaction})
  }

  static removeLiquidityType(transaction, liquidityTypeId) {
    return db.liquidityType.destroy({
      where: {id: liquidityTypeId},
      transaction
    })
  }
}
