let pkgs = import <nixpkgs> {};

in pkgs.stdenv.mkDerivation rec {
  name = "vinylwhere";

  buildInputs = with pkgs; [
    nodejs-9_x
  ];
}
