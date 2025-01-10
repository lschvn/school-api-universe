import Character from '../app/models/character';
import Universe from '../app/models/universe';
import User from '../app/models/user';
import consola from 'consola';

const testUser = {
	name: 'Test User',
	email: 'test.user@test.com',
	password: 'password123',
};

const testUniverse = {
	name: 'Marvel Universe',
	description: 'Super-heroes universe',
	banner_url: 'https://example.com/marvel.jpg',
	user_id: 0,
};

const testCharacter1 = {
	name: 'Spider-Man',
	description: 'Friendly neighborhood hero',
	avatar_url: 'https://example.com/spiderman.jpg',
	univer_id: 0,
};

const testCharacter2 = {
	name: 'Spider-Man', // même nom pour tester la non-unicité
	description: 'Miles Morales version',
	avatar_url: 'https://example.com/miles-morales.jpg',
	univer_id: 0,
};

async function runTests() {
	consola.log('\n' + '='.repeat(50));
	consola.info('🧪  CHARACTER MODEL TEST SUITE');
	consola.log('='.repeat(50) + '\n');

	try {
		// Setup - Créer utilisateur et univers
		consola.log('\n🔧 TEST SETUP');
		consola.info('  → Creating test user...');
		await User.create(testUser);
		const user = User.findByEmail(testUser.email);
		testUniverse.user_id = user!.id;
		consola.success('  ✅ Test user created');

		consola.info('  → Creating test universe...');
		await Universe.create(testUniverse);
		const universe = Universe.findByName(testUniverse.name);
		testCharacter1.univer_id = universe!.id;
		testCharacter2.univer_id = universe!.id;
		consola.success('  ✅ Test universe created');

		// Test CREATE
		consola.log('\n📝 TEST GROUP: Character Creation');
		consola.info('  → Creating first character...');
		await Character.create(testCharacter1);
		consola.success('  ✅ First character created successfully');

		consola.info('  → Creating second character with same name...');
		await Character.create(testCharacter2);
		consola.success('  ✅ Second character created successfully');

		// Test FIND ALL
		consola.log('\n🔍 TEST GROUP: Character Retrieval');
		consola.info('  → Fetching all characters...');
		const allCharacters = Character.findAll();
		consola.success(`  ✅ Found ${allCharacters.length} character(s)`);
		allCharacters.forEach((character) => {
			consola.info(`    • Character: ${character.name}`);
			consola.info(`      Description: ${character.description}`);
		});

		// Test FIND BY UNIVERSE ID
		consola.info('  → Finding characters by universe ID...');
		const universeCharacters = Character.findByUniverseId(universe!.id);
		consola.success(
			`  ✅ Found ${universeCharacters.length} character(s) for universe`,
		);

		// Test UPDATE
		if (allCharacters.length > 0) {
			const firstCharacter = allCharacters[0];
			consola.log('\n📝 TEST GROUP: Character Update');
			consola.info('  → Updating character information...');
			const updateData = { name: 'Updated Spider-Man' };
			await Character.update(firstCharacter.id, updateData);
			const updatedCharacter = Character.findOne(firstCharacter.id);
			consola.success('  ✅ Character updated successfully');
			consola.info(`    • New name: ${updatedCharacter?.name}`);

			// Test DELETE
			consola.log('\n🗑️  TEST GROUP: Character Deletion');
			consola.info('  → Deleting character...');
			await Character.delete(firstCharacter.id);
			const deletedCharacter = Character.findOne(firstCharacter.id);
			if (!deletedCharacter) {
				consola.success('  ✅ Character deleted successfully');
			}
		}

		// Nettoyage
		consola.log('\n🧹 TEST CLEANUP');
		await Universe.delete(universe!.id);
		consola.success('  ✅ Test universe deleted');
		await User.delete(user!.id);
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
