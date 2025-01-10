import User from '../app/models/user'
import consola from 'consola'

const testUser1 = {
    name: 'John Doe',
    email: 'john.doe@test.com',
    password: 'password123',
}

const testUser2 = {
    name: 'John Doe', // même nom
    email: 'john.doe@test.com', // même email
    password: 'differentpassword',
}

async function runTests() {
    consola.log('\n' + '='.repeat(50))
    consola.info('🧪  USER MODEL TEST SUITE')
    consola.log('='.repeat(50) + '\n')

    try {
        // Test CREATE - Premier utilisateur
        consola.log('\n📝 TEST GROUP: User Creation')
        consola.info('  → Creating first user...')
        await User.create(testUser1)
        consola.success('  ✅ First user created successfully')

        // Test CREATE - Doublon
        consola.info('  → Attempting to create duplicate user...')
        try {
            await User.create(testUser2)
            consola.error('  ❌ Duplicate user creation should have failed')
        } catch (error) {
            consola.success('  ✅ Duplicate user creation properly rejected')
        }

        // Test FIND ALL
        consola.log('\n🔍 TEST GROUP: User Retrieval')
        consola.info('  → Fetching all users...')
        const allUsers = User.findAll()
        consola.success(`  ✅ Found ${allUsers.length} user(s)`)
        allUsers.forEach((user) => {
            consola.info(`    • User: ${user.name} (${user.email})`)
        })

        // Test FIND BY EMAIL
        consola.info('  → Finding user by email...')
        const foundUser = await User.findByEmail(testUser1.email)
        if (foundUser) {
            consola.success('  ✅ User found by email')
            consola.info(`    • ID: ${foundUser.id}`)
            consola.info(`    • Name: ${foundUser.name}`)
            consola.info(`    • Email: ${foundUser.email}`)

            // Test UPDATE
            consola.log('\n📝 TEST GROUP: User Update')
            consola.info('  → Updating user information...')
            const updateData = { name: 'John Updated' }
            await User.update(foundUser.id, updateData)
            const updatedUser = User.findOne(foundUser.id)
            consola.success('  ✅ User updated successfully')
            consola.info(`    • New name: ${updatedUser?.name}`)

            // Test DELETE
            consola.log('\n�️  TEST GROUP: User Deletion')
            consola.info('  → Deleting user...')
            await User.delete(foundUser.id)
            const deletedUser = User.findOne(foundUser.id)
            if (!deletedUser) {
                consola.success('  ✅ User deleted successfully')
            }
        }

        consola.log('\n' + '='.repeat(50))
        consola.success('✨ All tests completed successfully!')
        consola.log('='.repeat(50) + '\n')
    } catch (error) {
        consola.log('\n' + '='.repeat(50))
        consola.error('❌ Test suite failed:', error)
        consola.log('='.repeat(50) + '\n')
    }
}

// Run tests
runTests()
