/**
 * Defines a localized Arabic/English string field.
 *
 * Usage inside a schema definition:
 *   name: localizedString({required: true})
 *
 * @param {{required?: boolean}} [options]
 * @returns {object} Mongoose schema definition for an {ar, en} object
 */
export function localizedString({required = false} = {}) {
  return {
    type: {
      ar: {type: String, required, trim: true},
      en: {type: String, required, trim: true},
    },
    _id: false,
  };
}