@PUSHD "%~dp0"
esbuild index.js --bundle --format=esm --outfile=bundle.js --loader:.webp=dataurl --loader:.png=dataurl %*
@POPD