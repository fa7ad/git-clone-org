#!/usr/bin/env python3
"""
Clones all the repos in a github organization.
"""

from subprocess import call as sys_call
from getpass import getpass
import requests
import argparse
import sys
import re
import os


GITHUB_URL = "https://api.github.com/orgs/{0}/repos"


def get_repos(url=None, username=None, password=None, page=None):
    """
    Get a list of all repos from the supplied URL
    """
    if url and username and password:
        params = {
            'per_page': 100,
            'page': page if page else 1
        }
        response = requests.get(url, auth=(username, password), params=params)
        json_decoded = response.json()
        try:
            repos = [item['clone_url'] for item in json_decoded]
        except:
            print("Possibly wrong password")
            return False
        next_page = None
        header_link = response.headers.get('link');
        if header_link:
            for link in header_link.split(','):
                if re.search('next', link):
                    rx_match = re.search('(?<!per_)page=(\d+)', link)
                    next_page = rx_match.groups()[0]
        return (repos, next_page)
    else:
        return False


def clone_repos(repos_list=None):
    """
    Clones all the repos in the provided list
    """
    if repos_list:
        num_repos = len(repos_list)
        confirm = input("Found {0} repo(s). Clone? [y/n] ".format(num_repos))
        if re.search('(yes|Yes|YES|Y|y)', confirm):
            returns = [sys_call(["git", "clone", repo]) for repo in repos_list]
            return sum(returns)
        else:
            print("Cloning cancelled.")
            return 0
    else:
        return 1


def cli():
    parser = argparse.ArgumentParser(add_help=False, prog="git clone-org")
    parser.add_argument("org_name", nargs=1, type=str)
    arguments = parser.parse_args()

    if arguments.org_name:
        org_name = arguments.org_name[0]
        user = input("Username for github.com: ")
        if user == '':
            user = os.getenv('GITHUB_USER')
        password = getpass("Password for {0} (won't be echoed): ".format(user))
        if password == '':
            password = os.getenv('GITHUB_PASSWORD')
        ret_codes = 0
        next_page = 1
        while True:
            response = get_repos(GITHUB_URL.format(org_name), user,
                password, page=next_page)
            if response:
                (repos, next_page) = response
            else:
                ret_codes += 255
                break
            if repos:
                ret_codes += clone_repos(repos)
            else:
                print('No repos returned. Something probably went wrong.')
                break
            if not next_page:
                break
                
        return ret_codes
    else:
        return 255


if __name__ == "__main__":
    sys.exit(cli())
