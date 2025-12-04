export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
});
