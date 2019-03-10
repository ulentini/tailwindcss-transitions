const _ = require('lodash');

module.exports = ({
  transitionPrefix = 'transition',
  willChangePrefix = 'will-change',
  variants = {},
  properties = {},
  durations = {},
  timingFunctions = {},
  delays = {},
  willChange = {},
} = {}) => ({ e, addUtilities }) => {
  const defaultDuration = durations.default || '500ms';
  addUtilities(
    {
      [`.${transitionPrefix}-none`]: { transition: 'none' },
      ...Object.assign(
        {},
        ..._.map(properties, (values, name) => ({
          [`.${e(`${transitionPrefix}-${name}`)}`]: {
            transition: (() => {
              if (!_.isArray(values)) {
                values = [values];
              }
              return values
                .map(
                  value =>
                    `${value} ${defaultDuration}` +
                    `${
                      timingFunctions.default
                        ? ` ${timingFunctions.default}`
                        : ''
                    }` +
                    `${delays.default ? ` ${delays.default}` : ''}`,
                )
                .join(', ');
            })(),
          },
        })),
        ..._.map(durations, (value, name) => {
          if (name === 'default') {
            return null;
          }
          return {
            [`.${e(`${transitionPrefix}-duration-${name}`)}`]: {
              transitionDuration: value,
            },
          };
        }),
        ..._.map(timingFunctions, (value, name) => {
          if (name === 'default') {
            return null;
          }
          return {
            [`.${e(`${transitionPrefix}-timing-${name}`)}`]: {
              transitionTimingFunction: value,
            },
          };
        }),
        ..._.map(delays, (value, name) => {
          if (name === 'default') {
            return null;
          }
          return {
            [`.${e(`${transitionPrefix}-delay-${name}`)}`]: {
              transitionDelay: value,
            },
          };
        }),
        ..._.map(willChange, (value, name) => ({
          [`.${e(`${willChangePrefix}-${name}`)}`]: { willChange: value },
        })),
      ),
    },
    variants,
  );
};
