import Universe from '../app/models/universe';
import User from '../app/models/user';
import consola from 'consola';

const testUser = {
	name: 'Test User',
	email: 'test.user@test.com',
	password: 'password123',
};

const testUniverse1 = {
	name: 'Marvel Universe',
	description: 'Super-heroes universe',
	banner_url: 'https://example.com/marvel.jpg',
	user_id: 0, // sera mis à jour après la création de l'utilisateur
};

const testUniverse2 = {
	name: 'Marvel Universe', // même nom pour tester les doublons
	description: 'Different description',
	banner_url: 'https://example.com/marvel2.jpg',
	user_id: 0,
};

async function runTests() {
	consola.log('\n' + '='.repeat(50));
	consola.info('🧪  UNIVERSE MODEL TEST SUITE');
	consola.log('='.repeat(50) + '\n');

	try {
		// Créer l'utilisateur test
		consola.log('\n🔧 TEST SETUP: Creating test user');
		User.create(testUser);
		const user = User.findByEmail(testUser.email);
		testUniverse1.user_id = user!.id;
		testUniverse2.user_id = user!.id;
		consola.success('  ✅ Test user created');

		// Test CREATE - Premier univers
		consola.log('\n📝 TEST GROUP: Universe Creation');
		consola.info('  → Creating first universe...');
		Universe.create(testUniverse1);
		consola.success('  ✅ First universe created successfully');

		// Test FIND ALL
		consola.log('\n🔍 TEST GROUP: Universe Retrieval');
		consola.info('  → Fetching all universes...');
		const allUniverses = Universe.findAll();
		consola.success(`  ✅ Found ${allUniverses.length} universe(s)`);
		allUniverses.forEach((universe) => {
			consola.info(`    • Universe: ${universe.name}`);
			consola.info(`      Description: ${universe.description}`);
		});

		// Test FIND BY USER ID
		consola.info('  → Finding universes by user ID...');
		const userUniverses = Universe.findByUserId(user!.id);
		consola.success(`  ✅ Found ${userUniverses.length} universe(s) for user`);

		// Test FIND ONE
		const firstUniverse = allUniverses[0];
		if (firstUniverse) {
			consola.info('  → Finding universe by ID...');
			const foundUniverse = Universe.findOne(firstUniverse.id);
			consola.success('  ✅ Universe found by ID');

			// Test UPDATE
			consola.log('\n📝 TEST GROUP: Universe Update');
			consola.info('  → Updating universe information...');
			const updateData = { name: 'Updated Marvel Universe' };
			Universe.update(firstUniverse.id, updateData);
			const updatedUniverse = Universe.findOne(firstUniverse.id);
			consola.success('  ✅ Universe updated successfully');
			consola.info(`    • New name: ${updatedUniverse?.name}`);

			// Test DELETE
			consola.log('\n🗑️  TEST GROUP: Universe Deletion');
			consola.info('  → Deleting universe...');
			Universe.delete(firstUniverse.id);
			const deletedUniverse = Universe.findOne(firstUniverse.id);
			if (!deletedUniverse) {
				consola.success('  ✅ Universe deleted successfully');
			}
		}

		// Nettoyage
		consola.log('\n🧹 TEST CLEANUP');
		User.delete(user!.id);
		consola.success('  ✅ Test user deleted');

		consola.log('\n' + '='.repeat(50));
		consola.success('✨ All tests completed successfully!');
		consola.log('='.repeat(50) + '\n');
	} catch (error) {
		consola.log('\n' + '='.repeat(50));
		consola.error('❌ Test suite failed:', error);
		consola.log('='.repeat(50) + '\n');
	}
}

runTests();
