const firstNotNull = (...args) => {
  for (var i = 0, len = args.length; i < len; i++) {
    if (args[i] != null) {
      return args[i];
    }
  }
};

export { firstNotNull };
