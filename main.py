#!/usr/bin/env python3
"""
Clones all the repos in a github organization.
"""

import requests
import argparse
import subprocess
import sys
import getpass


GITHUB_URL = "https://api.github.com/orgs/{0}/repos"


def get_repos(url=None, username=None, password=None):
    """
    Get a list of all repos from the supplied URL
    """
    if url and username and password:
        response = requests.get(url, auth=(username, password))
        json_decoded = response.json()
        try:
            repos = [item['clone_url'] for item in json_decoded]
        except:
            print("Possibly wrong password")
            return False
        return repos
    else:
        return False


def clone_repos(repos_list=None):
    """
    Clones all the repos in the provided list
    """
    if repos_list:
        returns = [subprocess.call(["git", "clone", repo]) for repo in repos_list]
        if any(returns):
            return True
        else:
            return False
    else:
        return True


def cli():
    parser = argparse.ArgumentParser(add_help=False, prog="git clone-org")
    parser.add_argument("org_name", nargs=1, type=str)
    arguments = parser.parse_args()

    if arguments.org_name:
        user = input("Username for github.com: ")
        password = getpass.getpass("Password for {0} (won't be echoed):".format(user))
        repos = get_repos(GITHUB_URL.format(arguments.org_name[0]), user, password)

        if not repos:
            return 255
        if clone_repos(repos):
            return 255
    else:
        return 255

    return 0


if __name__ == "__main__":
    sys.exit(cli())