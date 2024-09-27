import aiosqlite

class Database:
    def __init__(self):
        self.connection = None

    async def connect(self):
        self.connection = await aiosqlite.connect('database/db.sqlite')
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        ''')
        await self.connection.commit()

    async def disconnect(self):
        await self.connection.close()

    async def get_all_services(self):
        cursor = await self.connection.execute('SELECT * FROM services')
        services = await cursor.fetchall()
        return [{'name': row[1]} for row in services]

    async def add_service(self, service):
        await self.connection.execute('INSERT INTO services (name) VALUES (?)', (service.name,))
        await self.connection.commit()

    async def delete_service(self, service_name):
        await self.connection.execute('DELETE FROM services WHERE name = ?', (service_name,))
        await self.connection.commit()
