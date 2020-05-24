#!/usr/bin/env sh
# Do - The Simplest Build Tool on Earth.
# Documentation and examples see https://github.com/8gears/do

# Get all variables in .env
source .env

#set -e -u # -e "Automatic exit from bash shell script on error"  -u "Treat unset variables and parameters as errors"
set -u # with -e nvm doesn't seem to work correctly

build() {
  # Make nvm available
  . ~/.nvm/nvm.sh

  nvm use
  npm run build
}

dev() {
  # Make nvm available
  . ~/.nvm/nvm.sh

  nvm use
  npm start
}

serve() {
  build

  cd build
  python ../server.py
}

deploy() {
  START=$(date +%s)

  build

  lftp -c "set sftp:auto-confirm yes; open $HOST$ROOT -u $USER,$PASSWORD -p $PORT; glob -a rm -r -f *; mirror -R --parallel=2 -v build/ ./"

  END=$(date +%s)
  DIFF=$(( $END - $START ))
  echo "## Duration: $DIFF seconds"
}

"$@"

[ "$#" -gt 0 ] || printf "Usage:\n\t./do.sh %s\n" "($(compgen -A function | grep '^[^_]' | paste -sd '|' -))"
