const app = require('../app')
const request = require('supertest')
const assert = require('power-assert')
const db = require('../database/models')
const LiquidityParentType = require('../enum/liquidity_parent_type')


const projects = [{
  name: '个人成长基金',
  desc: '个人成长基金的使用情况',
  liquidityParentTypes: [{
    parentType: LiquidityParentType.EXPENSE,
    type: '吃饭'
  }, {
    parentType: LiquidityParentType.INCOME,
    type: '打工'
  }, {
    parentType: LiquidityParentType.EXPENSE,
    type: '喝水'
  }, {
    parentType: LiquidityParentType.EXPENSE,
    type: '打工'
  }]
}, {
  name: '活动经费',
  desc: '团队经常使用的活动经费',
  liquidityParentTypes: []
}]

const addProjects = async function() {
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]
    await request(app).post('/projects').send({
      name: project.name,
      desc: project.desc
    }).expect(201)
  }
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]
    await request(app).post('/projects').send({
      name: project.name,
      desc: project.desc
    }).expect(409)
    const created = await db.project.findOne({
      where: {name: projects[i].name},
      raw: true,
      attributes: ['id']
    })
    projects[i].id = created.id
  }
}

const cleanProjects = async function() {
  await db.document.destroy({where: {}})
  await cleanLiquidityType()
  return db.project.destroy({where: {}, force: true})
}

const addLiquidityTypes = async function() {
  for (let i = 0; i < projects.length; i++) {
    for (let j = 0; j < projects[i].liquidityParentTypes.length; j++) {
      await request(app).post(`/projects/${projects[i].id}/liquidity-types`)
          .send({
            parentType: projects[i].liquidityParentTypes[j].parentType,
            type: projects[i].liquidityParentTypes[j].type
          })
          .expect(201)
    }
  }
  for (let i = 0; i < projects.length; i++) {
    for (let j = 0; j < projects[i].liquidityParentTypes.length; j++) {
      await request(app).post(`/projects/${projects[i].id}/liquidity-types`)
          .send({
            parentType: projects[i].liquidityParentTypes[j].parentType,
            type: projects[i].liquidityParentTypes[j].type
          })
          .expect(409)
      const created = await db.liquidityType.findOne({
        where: {
          projectId: projects[i].id,
          parentType: projects[i].liquidityParentTypes[j].parentType,
          type: projects[i].liquidityParentTypes[j].type
        },
        raw: true,
        attributes: ['id']
      })
      projects[i].liquidityParentTypes[j].id = created.id
    }
  }
}

const cleanLiquidityType = async function() {
  return db.liquidityType.destroy({where: {}, force: true})
}

describe('project', async function() {
  beforeEach(async function() {
    await cleanProjects()
  })

  it('can add project', async function() {
    await addProjects()
  })

  it('can update project', async function() {
    await addProjects()
    const project = projects[0]
    project.name = '更改后的项目名称'
    await request(app).put(`/projects/${project.id}`).send({
      name: project.name
    }).expect(200)
    const updated = await db.project.findByPk(project.id, {raw: true})
    assert.equal(updated.name, project.name)

    await request(app).put(`/projects/${projects[1].id}`).send({
      name: projects[0].name
    }).expect(409)
    await request(app).put(`/projects/${projects[1].id}`).send({
      name: projects[1].name
    }).expect(200)
  })

  const removeProject = async function(id) {
    return request(app).delete(`/projects/${id}`).send().expect(204)
  }
  it('can delete project', async function() {
    await addProjects()
    await removeProject(projects[0].id)
    const project = await db.project.findByPk(projects[0].id)
    assert.equal(project, null)
    const [[project2]] = await db.sequelize.query(`
      SELECT * FROM projects WHERE id = ${projects[0].id}
    `)
    assert.equal(project2.name, projects[0].name)
  })

  it('can add again after delete', async function() {
    await addProjects()
    await removeProject(projects[0].id)
    await request(app).post('/projects').send({
      name: projects[0].name,
      desc: projects[0].desc
    }).expect(201)

    await request(app).post('/projects').send({
      name: projects[1].name,
      desc: projects[1].desc
    }).expect(409)
  })

  it('can be query', async function() {
    await addProjects()
    await removeProject(projects[0].id)
    const {body: queryResult} = await request(app).get('/projects').expect(200)
    assert(queryResult.count, 1)
    assert(queryResult.rows[0].id, projects[1].id)
  })

  describe('liquidity type', async function() {
    beforeEach(async function() {
      await addProjects()
      await addLiquidityTypes()
    })

    it('can add liquidity type', async function() {
    })

    it('can update liquidity type', async function() {
      await request(app)
          .put(`/projects/${projects[0].id}/liquidity-types/${projects[0].liquidityParentTypes[0].id}`)
          .send({parentType: LiquidityParentType.INCOME, type: '吃饭和请人吃饭'})
          .expect(400)
      projects[0].liquidityParentTypes[0].type = '吃饭和请人吃饭'
      await request(app)
          .put(`/projects/${projects[0].id}/liquidity-types/${projects[0].liquidityParentTypes[0].id}`)
          .send({type: projects[0].liquidityParentTypes[0].type})
          .expect(200)
      const updated = await db.liquidityType.findByPk(projects[0].liquidityParentTypes[0].id)
      assert.equal(updated.type, projects[0].liquidityParentTypes[0].type)

      await request(app)
          .put(`/projects/${projects[0].id}/liquidity-types/${projects[0].liquidityParentTypes[0].id}`)
          .send({type: projects[0].liquidityParentTypes[1].type})
          .expect(409)
      await request(app)
          .put(`/projects/${projects[0].id}/liquidity-types/${projects[0].liquidityParentTypes[0].id}`)
          .send({type: projects[0].liquidityParentTypes[0].type})
          .expect(200)
    })

    const removeLiquidityType = function(liquidityTypeId) {
      return request(app).delete(`/projects/aa/liquidity-types/${liquidityTypeId}`).expect(204)
    }

    it('can remove liquidity type', async function() {
      await removeLiquidityType(projects[0].liquidityParentTypes[0].id)
      assert.equal(await db.liquidityType.findByPk(projects[0].liquidityParentTypes[0].id), null)
      assert.notEqual(await db.liquidityType.findByPk(projects[0].liquidityParentTypes[0].id, {paranoid: false}), null)
    })

    it('can add again after being removed', async function() {
      await removeLiquidityType(projects[0].liquidityParentTypes[0].id)

      await request(app).post(`/projects/${projects[0].id}/liquidity-types`)
          .send({
            parentType: projects[0].liquidityParentTypes[0].parentType,
            type: projects[0].liquidityParentTypes[0].type
          })
          .expect(201)

      await request(app).post(`/projects/${projects[0].id}/liquidity-types`)
          .send({
            parentType: projects[0].liquidityParentTypes[1].parentType,
            type: projects[0].liquidityParentTypes[1].type
          })
          .expect(409)
      assert.notEqual(await db.liquidityType.findByPk(projects[0].liquidityParentTypes[0].id), null)
    })
  })
})

module.exports = {
  projects,
  addProjects,
  cleanProjects,
  addLiquidityTypes,
  cleanLiquidityType
}
