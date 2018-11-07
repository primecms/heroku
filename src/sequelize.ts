import { Sequelize } from 'sequelize-typescript';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  database: 'prime-sq',
  username: 'birkir',
  password: '',
  modelPaths: [`${__dirname}/models`],
  logging: false,
});
