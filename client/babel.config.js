module.exports = api => {
  const isTest = api.env('test');
  return {
    presets: [
      isTest && '@babel/preset-env',
      isTest && '@babel/preset-react'
    ].filter(Boolean)
  };
};