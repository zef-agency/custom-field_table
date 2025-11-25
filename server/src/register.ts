import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: 'table-field',
    plugin: 'table-field',
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: true,
    },
  });
};

export default register;
