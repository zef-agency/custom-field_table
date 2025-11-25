import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

export default {
  register(app: any) {
    /*     app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    }); */

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    app.customFields.register({
      name: 'table-field',
      pluginId: PLUGIN_ID, // the custom field is created by a color-picker plugin
      type: 'json', // the color will be stored as a string
      intlLabel: {
        id: `${PLUGIN_ID}.table-field.label`,
        defaultMessage: 'Custom table',
      },
      intlDescription: {
        id: `${PLUGIN_ID}.table-field.description`,
        defaultMessage: 'A flexible table field',
      },
      icon: PluginIcon, // don't forget to create/import your icon component
      components: {
        Input: async () =>
          import('./components/input').then((module) => ({
            default: module.Input,
          })),
      },
      options: {
        // declare options here
      },
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
