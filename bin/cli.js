const request = require('request');
const prompt = require('prompt');
const argv = require('minimist')(process.argv.slice(2));
const spawn = require('child_process').spawn;


function git_url(org_name) {
  return "https://api.github.com/orgs/" + org_name + "/repos";
};


function get_repos(username, password, org_name, cb) {
  let params, urls;
  urls = [];
  params = {
    url: git_url(org_name),
    auth: {
      user: username,
      pass: password
    },
    json: true,
    headers: {
      'User-Agent': 'Git Clone Org'
    }
  };
  request(params, function(err, res, body) {
    if (body) {
    let i, len, obj;
    for (i = 0, len = body.length; i < len; i++) {
      obj = body[i];
      urls.push(obj['clone_url']);
    }
    cb(urls);
  }
  });
};


function git_clone_org(org, callback, callback_final) {
  let options = [
    {
      name: 'username',
      description: 'Username for github.com',
      required: true
    }, {
      name: 'password',
      description: 'Password (will not be echoed)',
      hidden: true,
      required: true
    }
  ];
  if (!org){
    options.push({
      name: 'org',
      description: 'Name of GitHub organization',
      required: true
    })
  }
  prompt.start();
  prompt.get(options, function(err, res) {
    if(res){
      let auth = {};
      auth.username = res.username;
      auth.password = res.password;
      auth.org = org || auth.org;
      callback(auth.username, auth.password, auth.org, callback_final);
    }
  });
};

function clone(repos){
  let i, len;
  for (i = 0, len = repos.length; i < len; i++) {
    url = repos[i];
    let cloner = spawn('git', ['clone', url]);
    cloner.stdout.on('data', function(data) {
      console.log(data.toString());
    });
    cloner.stderr.on('data', function(data) {
      console.error(data.toString());
    });
    cloner.on('exit', function(code) {
      if (code !== 0) {
        console.error("Exited with code " + code);
      }
    });
  }
};

if (require.main === module) {
  git_clone_org(argv['_'][0], get_repos, clone);
}
