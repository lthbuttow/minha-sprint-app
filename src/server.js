require('./config/loadEnv');
const authService = require('./service/authService');

authService.assertConfiguration();

const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Aplicação disponível em http://localhost:${port}`));
