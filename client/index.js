let fs = require('fs');
require('songbird');
let path = require('path');
let nssocket = require('nssocket');
let current_dir = process.cwd();
let cliArgs = require("command-line-args");
let rimraf = require("rimraf");
let cli = cliArgs([
    { name: "dir", type: String, alias: "d", description: "This argument used to specify the root path for the application" },
]);
let options = cli.parse();
current_dir = options['dir'] || current_dir;
console.log(current_dir);
let handler = {
  'post' : async (msg) => {
    let file_path   = path.resolve(current_dir, msg.path);
    try {
    let result      = await fs.promise.truncate(file_path);
    let writeStream = fs.createWriteStream(file_path, {'flags': 'r+'}).on('error',  (error) => {
      console.log(error);
      res.sendStatus(405);
    }).on('open', () => {
      writeStream.write((new Buffer(msg.data, 'base64')).toString('utf8'));
    });
    } catch (e) {
      console.log(e);
    }
  },
  'delete' : (msg) => {
    let file_path   = path.resolve(current_dir, msg.path);
    if(msg.type == 'file')
    {
       fs.promise.unlink(file_path).catch((error) => { console.log(error); });
    }
    else
    {
      rimraf(file_path, (error) => { 
          console.log('error'); 
      });
    }
  },
  'put' : async (msg) => {
    let file_path   = path.resolve(current_dir, msg.path);
    if(msg.type == 'file')
    {
      try
      {
        let writeStream = fs.createWriteStream(file_path, {'flags': 'wx'}).on('error',  (error) => {
          console.log(error);
        }).on('open', () => {
          writeStream.write((new Buffer(msg.data, 'base64')).toString('utf8'));
        });
      }
      catch (e) {
        console.log(e);
      }
    }
    else
    {
      fs.promise.mkdir(file_path).then( () => {console.log('success creating a folder ' + file_path)}).catch(() => {});
    }
  }
};

var outbound = new nssocket.NsSocket();

outbound.data('sync', function (data) {
  handler[data.method.toLowerCase()](data);
});

outbound.connect(6785);
