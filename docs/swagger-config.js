const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Zazmic-blog API',
    version: '1.0.0',
    description:
      'This is a blog API for [https://nadia.internship.zazmicdemo.com](https://nadia.internship.zazmicdemo.com)',
  },
  basePath: '/',
  components: {},
  security: [],
};

const options = {
  swaggerDefinition,
  apis: [`${__dirname}/**/**/*.yaml`],
};

const swaggerUiOpts = {
  customCss: '.swagger-ui .topbar {display: none}',
  swaggerOptions: {
    filter: true,
    requestInterceptor: (req) => {
      const regex = /XSRF-TOKEN=(.[^;]*)/gi;
      const match = regex.exec(document.cookie);
      /* eslint-disable-next-line */
      req.headers['x-csrf-token'] = match[1];
      return req;
    },
  },
};

module.exports = (app) => {
  app.use(
    '/docs',
    (req, res, next) => {
      req.swaggerDoc = swaggerJSDoc(options);
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(null, swaggerUiOpts),
  );
};
