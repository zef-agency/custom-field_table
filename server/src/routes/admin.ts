export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/get-columns',
      handler: 'controller.index',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
