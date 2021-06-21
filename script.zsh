#run with zsh or source command
kill -9 `lsof -i TCP:3000 | awk '/LISTEN/{print $2}'`
cat "run with zsh or source command"
