#!/usr/bin/env bash
if hash install 2>/dev/null; then
    sudo install -m 755 ./main.py /usr/local/bin/git-clone-org
else
    sudo cp ./main.py /usr/local/bin/git-clone-org
    sudo chmod 755 /usr/local/bin/git-clone-org
fi