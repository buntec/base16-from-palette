{
  lib,
  buildNpmPackage,
}:
buildNpmPackage {
  pname = "base16-from-palette";
  version = "0.1.0";
  src = lib.fileset.toSource {
    root = ../.;
    fileset = lib.fileset.unions [
      ../package.json
      ../package-lock.json
      ../bin
      ../src
      ../test
    ];
  };
  npmDepsHash = "sha256-TxiM9KdHhr6vqTRD88ZD1LkUoCpaMAWR1Hak+ad6ozU=";
  dontNpmBuild = true;
  doCheck = true;
  checkPhase = ''
    runHook preCheck
    npm test
    runHook postCheck
  '';
  meta = {
    description = "Generate Base16 and Base24 schemes from Color Hunt, Coolors, and other palettes";
    license = lib.licenses.mit;
    mainProgram = "base16-from-palette";
  };
}
