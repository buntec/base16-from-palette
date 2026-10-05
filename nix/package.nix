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
  npmDepsHash = "sha256-KCsq6hHtDJ93ynKphA28AZ/pR7BcIFzrRe8Mnt6AIXY=";
  dontNpmBuild = true;
  doCheck = true;
  checkPhase = ''
    runHook preCheck
    npm test
    runHook postCheck
  '';
  meta = {
    description = "Generate Base16 and Base24 schemes from Color Hunt, Coolors, and other palettes";
    mainProgram = "base16-from-palette";
  };
}
