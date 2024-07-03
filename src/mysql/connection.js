import mysql from 'mysql2/promise';

// Create a MySQL database connection
const connectToDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
        console.log("Successfully connected to MySQL database");
        return connection;
    } catch (error) {
        console.error('Failed to connect to MySQL database:', error);
        return null;
    }
};

export default connectToDatabase;
