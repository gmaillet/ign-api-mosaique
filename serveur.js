const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const debug = require('debug');

const PORT = 8081;

const app = express();

global.dir_cache = 'cache';
// on charge les mtd du cache, en fonction de l'option de démarrage (test ou pas)
// pour test, option "--cache_test"
if (process.argv.indexOf('--cache_test') > 0) {
  global.dir_cache = 'cache_test';
}
debug.log(`using cache directory: ${global.dir_cache}`);

const wmts = require('./routes/wmts');
const graph = require('./routes/graph');

app.cache_mtd = JSON.parse(fs.readFileSync(`${global.dir_cache}/cache_mtd.json`));

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  debug.log(req.method, ' ', req.path, ' ', req.body);
  debug.log(`received at ${Date.now()}`);
  next();
});

const options = {
  customCss: '.swagger-ui .topbar { display: none }',
};

const swaggerDocument = YAML.load('./doc/swagger.yml');

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.use('/', wmts);
app.use('/', graph);

module.exports = app.listen(PORT, () => {
  debug.log(`URL de l'api : http://localhost:${PORT} \nURL de la documentation swagger : http://localhost:${PORT}/doc`);
});
