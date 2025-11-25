import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    const params = ctx.params;

    console.log('**************************', params);

    ctx.body = params;
  },
});

export default controller;
