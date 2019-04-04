const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
// const config = require('../config/config')

const db = {}
console.log(path.join(__dirname, '../DB/', 'database.sqlite'))

const sequelize = new Sequelize(
  {
    host: 'localhost',
    dialect: 'sqlite',
    storage: path.join(__dirname, '../DB/', 'database.sqlite')
  }
)
fs
  .readdirSync(__dirname)
  .filter((file) =>
    file !== 'index.js'
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })
Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db