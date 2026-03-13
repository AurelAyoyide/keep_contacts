export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m', // Access token: short-lived
    refreshExpiresIn: '7d', // Refresh token: long-lived
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  baseUrl: process.env.BASE_URL || 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mail: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || '"Keep Contacts" <noreply@keepcontacts.app>',
  },
});
