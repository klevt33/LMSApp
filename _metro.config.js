module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
        hermesParser: true, // this line enables Hermes on Android
      },
    }),
  },
};
