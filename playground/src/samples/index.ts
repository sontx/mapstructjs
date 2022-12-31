/* eslint-disable import/no-webpack-loader-syntax */

export interface Index {
  label: string;
  content: string;
}

export const SAMPLES: Index[] = [
  { label: 'Basic usage', content: require('!raw-loader!./basic').default },
  { label: 'Exclude source properties', content: require('!raw-loader!./exclude-props').default },
  { label: 'Include source properties', content: require('!raw-loader!./include-props').default },
  {
    label: 'Basic usage with @Property',
    content: require('!raw-loader!./basic-usage-with-property-annotation').default,
  },
  { label: 'Transform fields', content: require('!raw-loader!./transform-fields').default },
  { label: 'Handle creating target object', content: require('!raw-loader!./handle-creating-target-object').default },
  { label: 'Link with other object mappers', content: require('!raw-loader!./link-mappers').default },
  { label: 'Link with other object services', content: require('!raw-loader!./link-services').default },
  { label: 'Provide linked services', content: require('!raw-loader!./provide-linked-services').default },
  { label: 'Before hook', content: require('!raw-loader!./before-hook').default },
  { label: 'After hook', content: require('!raw-loader!./after-hook').default },
  { label: 'Hook uses linked services', content: require('!raw-loader!./hook-uses-linked-services').default },
];
