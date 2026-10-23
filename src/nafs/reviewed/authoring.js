// Small authoring helpers. Arithmetic audit lives separately in tests.
export const ar = value => String(value).replace(/(?<=[0-9٠-٩])\.(?=[0-9٠-٩])/g, '٫').replace(/[0-9]/g, c => '٠١٢٣٤٥٦٧٨٩'[c]);
export const q = (skill, variant, cognitiveLevel, data) => ({id:`${skill}-${variant}`,skill,cognitiveLevel,...data});
