let pkgs = import <nixpkgs> {};

in pkgs.stdenv.mkDerivation rec {
  name = "vinylwhere";

  buildInputs = with pkgs; [
    fish
    jq
    nodejs-9_x
    pup
    awscli
  ];
}
