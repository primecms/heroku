import { sequelize } from './sequelize';
import { seed } from './seed';
import { server } from './server';

console.log()
console.log('initializing');

(async () => {
  await sequelize.sync({ force: true });

  console.log('seeding');
  await seed();

  console.log('starting server...\n');
  (await server())
  .listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  })

})();
