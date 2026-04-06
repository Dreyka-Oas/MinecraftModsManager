const SUPPORTED_LOADERS = ["fabric", "forge", "neoforge"];

const toTargets = (loaders) =>
  loaders.flatMap((loader) =>
    loader.versions.map((version) => ({
      id: `${loader.name}/${version}`,
      loader: loader.name,
      version
    }))
  );

const selectableTargets = (loaders) => toTargets(loaders).filter((t) => SUPPORTED_LOADERS.includes(t.loader));

module.exports = { SUPPORTED_LOADERS, selectableTargets };
