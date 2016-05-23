#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2));
const spawn = require('child_process').spawn;
const inquirer = require('inquirer');
const axios = require('axios');


function git_url(org_name) {
  return "https://api.github.com/orgs/" + org_name + "/repos";
}


function get_clone_repos(info) {
  let http_params = {
    url: git_url(info.org),
    auth: {
      username: info.username,
      password: info.password
    },
    headers: {
      'User-Agent': 'Git Clone Org'
    }
  };

  let fetcher = axios.create();

  fetcher
    .request(http_params)
    .then(function(response) {
      if(response['data']){
        if (response.data.message){
          console.error(response.data.message);
        }else{
          let links = [];
          response.data.forEach(repo => links.push(repo['clone_url']));
          confirm_clone(links);
        }
      }
    });
}


function confirm_clone(links) {
  let confirm = true;
  inquirer
    .prompt({
      name: 'confirm',
      message: 'Got ' + links.length + ' repo(s). Confirm clone',
      default: true,
      type: 'confirm'
    })
    .then(function(res) {
      if(res.confirm)
        links.forEach(link => clone(link));
      else
        console.log('Clone cancelled!')
    });
  return confirm;
}


function git_clone_org(org) {
  let options = [
    {
      name: 'username',
      message: 'Username for github.com',
      type: 'input',
      default: process.env.GITHUB_USER || ''
    }, {
      name: 'password',
      message: 'Password (will not be echoed)',
      type: 'password',
      default: process.env.GITHUB_PASSWORD || '****'
    }
  ];

  if (!org){
    options.push({
      name: 'org',
      message: 'Name of GitHub organization',
      type: 'input'
    });
  }
  inquirer
    .prompt(options)
    .then(function(res) {
      if(res){
        let auth = res;
        auth.org = org || res.org;
        get_clone_repos(auth);
      }
    });
}

function clone(url){
  let cloner = spawn('git', ['clone', url]);
  
  cloner.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  
  cloner.stderr.on('data', function(data) {
    console.error(data.toString());
  });
  
  cloner.on('exit', function(code) {
    if (code !== 0)
      console.error("Exited with code " + code);
    else
      console.log("Cloned repo successfully");
  });
}

if (require.main === module) {
  git_clone_org(argv['_'][0]);
}
