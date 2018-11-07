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
  .listen(process.env.PORT || 4000).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  })

})();
