const cssMatcher = require('jest-matcher-css');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const defaultConfig = require('tailwindcss/defaultConfig')();
const transitionsPlugin = require('./index.js');

const disabledModules = {};
Object.keys(defaultConfig.modules).forEach(module => {
  disabledModules[module] = false;
});

const transitionPrefix = 'transition';
const willChangePrefix = 'will-change';

const generatePluginCss = (options = {}) => {
  return postcss(
    tailwindcss({
      modules: disabledModules,
      plugins: [transitionsPlugin(options)],
    }),
  )
    .process('@tailwind utilities;', {
      from: undefined,
    })
    .then(result => {
      return result.css;
    });
};

expect.extend({
  toMatchCss: cssMatcher,
});

test('options are not required', () => {
  return generatePluginCss({
    transitionPrefix,
    willChangePrefix,
  }).then(css => {
    expect(css).toMatchCss(`
      .${transitionPrefix}-none {
        transition: none;
      }
    `);
  });
});

test('there is a default duration value', () => {
  return generatePluginCss({
    transitionPrefix,
    willChangePrefix,
    properties: {
      transform: 'transform',
    },
  }).then(css => {
    expect(css).toMatchCss(`
      .${transitionPrefix}-none {
        transition: none;
      }
      .${transitionPrefix}-transform {
        transition: transform 500ms;
      }
    `);
  });
});

test('the default duration can be changed', () => {
  return generatePluginCss({
    transitionPrefix,
    willChangePrefix,
    properties: {
      transform: 'transform',
    },
    durations: {
      default: '100ms',
    },
  }).then(css => {
    expect(css).toMatchCss(`
      .${transitionPrefix}-none {
        transition: none;
      }
      .${transitionPrefix}-transform {
        transition: transform 100ms;
      }
    `);
  });
});

test('a default timing function and a default delay can be set', () => {
  return generatePluginCss({
    transitionPrefix,
    willChangePrefix,
    properties: {
      transform: 'transform',
    },
    durations: {
      default: '100ms',
    },
    timingFunctions: {
      default: 'linear',
    },
    delays: {
      default: '200ms',
    },
  }).then(css => {
    expect(css).toMatchCss(`
      .${transitionPrefix}-none {
        transition: none;
      }
      .${transitionPrefix}-transform {
        transition: transform 100ms linear 200ms;
      }
    `);
  });
});

test('all the options are working together as they should', () => {
  return generatePluginCss({
    transitionPrefix,
    willChangePrefix,
    properties: {
      opacity: 'opacity',
      'opacity-and-color': ['opacity', 'color'],
    },
    durations: {
      default: '100ms',
      '200': '200ms',
      '300': '300ms',
      '400': '400ms',
      '500': '500ms',
    },
    timingFunctions: {
      default: 'linear',
      ease: 'ease',
    },
    delays: {
      none: '0s',
    },
    willChange: {
      opacity: 'opacity',
      transform: 'transform',
    },
  }).then(css => {
    expect(css).toMatchCss(`
      .${transitionPrefix}-none {
        transition: none;
      }
      .${transitionPrefix}-opacity {
        transition: opacity 100ms linear;
      }
      .${transitionPrefix}-opacity-and-color {
        transition: opacity 100ms linear, color 100ms linear;
      }
      .${transitionPrefix}-duration-200 {
        transition-duration: 200ms;
      }
      .${transitionPrefix}-duration-300 {
        transition-duration: 300ms;
      }
      .${transitionPrefix}-duration-400 {
        transition-duration: 400ms;
      }
      .${transitionPrefix}-duration-500 {
        transition-duration: 500ms;
      }
      .${transitionPrefix}-timing-ease {
        transition-timing-function: ease;
      }
      .${transitionPrefix}-delay-none {
        transition-delay: 0s;
      }
      .${willChangePrefix}-opacity {
        will-change: opacity;
      }
      .${willChangePrefix}-transform {
        will-change: transform;
      }
    `);
  });
});

test('variants are supported', () => {
  return generatePluginCss({
    transitionPrefix,
    willChangePrefix,
    variants: ['hover', 'active'],
  }).then(css => {
    expect(css).toMatchCss(`
      .${transitionPrefix}-none {
        transition: none;
      }
      .hover\\:${transitionPrefix}-none:hover {
        transition: none;
      }
      .active\\:${transitionPrefix}-none:active {
        transition: none;
      }
    `);
  });
});

test('custom prefixes are supported', () => {
  const customTransitionPrefix = 'custom-transition';
  const customWillChangePrefix = 'custom-will-change';

  return generatePluginCss({
    transitionPrefix: customTransitionPrefix,
    willChangePrefix: customWillChangePrefix,
    properties: {
      transform: 'transform',
    },
    willChange: {
      opacity: 'opacity',
      transform: 'transform',
    },
  }).then(css => {
    expect(css).toMatchCss(`
      .${customTransitionPrefix}-none {
        transition: none;
      }
      .${customTransitionPrefix}-transform {
        transition: transform 500ms;
      }
      .${customWillChangePrefix}-opacity {
        will-change: opacity;
      }
      .${customWillChangePrefix}-transform {
        will-change: transform;
      }
    `);
  });
});
