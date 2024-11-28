#!/bin/bash

# Exit on any error
set -e

# Exit on pipe failure
set -o pipefail

# Exit on undefined variable
# set -u

get_yes_no() {
    local prompt="$1"
    local answer
    
    while true; do
        read -rp "$prompt (y/n): " answer
        case $(echo "$answer" | tr '[:upper:]' '[:lower:]') in
            y|yes) return 0 ;;
            n|no)  return 1 ;;
            *) echo "Please answer yes or no" ;;
        esac
    done
}

main() {
    if [ -z "$1" ]; then
        echo "Error: Please provide Heroku remote as an argument!"
        exit 1
    fi

    echo "Deploying to Heroku remote => $1" 
    echo ""
    echo "Reminders:"
    echo "1. Make sure Heroku CLI is installed before using this tool: https://devcenter.heroku.com/articles/heroku-cli"
    echo "2. Make sure to connect Heroku remote repository to this local repository: heroku git:remote -a <HEROKU APP NAME> -r <NAME OF REMOTE TO CREATE>"
    echo ""
    echo ""

    if get_yes_no "Log in to Heroku?"; then
        heroku login
    else
        echo "Assuming you have already logged in..."
        echo ""
    fi
    
    if get_yes_no "Push to Heroku deploy branch?"; then
        git push "$1" main
    else
        echo "Deployment cancelled."
        echo ""
    fi
}

main "$@"
