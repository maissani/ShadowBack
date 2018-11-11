import Sequelize from 'sequelize';

let sequelize;

sequelize = new Sequelize('shadowback', null, null, {
dialect: 'sqlite',
storage: './shadowback.sqlite'
});

const models = {
  User: sequelize.import('./user'),
  Product: sequelize.import('./product'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;