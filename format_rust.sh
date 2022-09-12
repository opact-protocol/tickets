if ! command -v cargo &> /dev/null
then
    echo "The required package cargo could not be found aborting. Please install rust"
    exit

else
  cd packages/contracts && cargo fmt --all && cd ..
fi