let express = require('express');
let fs = require('fs');
require('songbird');
let path = require('path');
let getSize = require('get-folder-size');
let mime = require('mime-types');
let app = express();
let rimraf = require('rimraf');
let current_dir = process.cwd();
let events = require('events');
let eventEmitter = new events.EventEmitter();

app.listen(8000);

let cliArgs = require("command-line-args");

let cli = cliArgs([
    { name: "dir", type: String, alias: "d", description: "This argument used to specify the root path for the application" },
]);

let options = cli.parse();
let nssocket = require('nssocket');

current_dir = options['dir'] || current_dir;
app.head('*', (req, res) => { 
    let file_path   = path.resolve(current_dir, req.path.slice(1));
    fs.promise.stat(file_path).then( async (stat) => {
      if(stat.isDirectory())
      { 
        let file_list = await fs.promise.readdir(file_path);
        let text = JSON.stringify(file_list);
        res.set({
           'Content-Length': text.length, 
           'Content-Type': "text/json"
        }).end('');
      }
      else
      {
        res.set({
           'Content-Length': stat.size, 
           'Content-Type': mime.lookup(file_path) || "application/octet-stream"
        }).end('');
      }
    }).catch( 
      (error) => {
        res.sendStatus(400);
      }
    );
});
app.put('*', (req, res) => { 
  let file_path   = path.resolve(current_dir, req.path.slice(1));
  let toSend      = {
      'method' : 'PUT',
      'data'   : '',
      'path'   : req.path.slice(1)
  };
  console.log(file_path);
  if(!path.extname(file_path))
  {
    toSend.type = 'dir';
    fs.promise.mkdir(file_path).then( () => {res.end(); eventEmitter.emit('sync', toSend);}).catch( () => {res.sendStatus(409)});
        
  }
  else
  {
    toSend.type = 'file';
    let writeStream = fs.createWriteStream(file_path, {'flags': 'wx'}).on('error',  (error) => {
        console.log(error);
        res.sendStatus(405);
    }).on('open', () => {
      req.pipe(writeStream).on('finish', () => {
        res.end();
        let readStream = fs.createReadStream(file_path); 
        readStream.on('data', (info) => {
          toSend.data += info.toString('base64');
        }).on('end', () => {
          eventEmitter.emit('sync', toSend);
        });
      });
    });

  }
});
app.post('*', async (req, res) => { 
  let file_path   = path.resolve(current_dir, req.path.slice(1));
  let toSend      = {
      'method' : 'POST',
      'data'   : '',
      'type'   : 'file',
      'path'   : req.path.slice(1)
  };
  if(!path.extname(file_path))
  {
    res.sendStatus(405);
    return;
  }
  try {
    let result      = await fs.promise.truncate(file_path);
    let writeStream = fs.createWriteStream(file_path, {'flags': 'r+'}).on('error',  (error) => {
      console.log(error);
      res.sendStatus(405);
    }).on('open', () => {
      req.pipe(writeStream).on('finish', () => {
        res.end();
        let readStream = fs.createReadStream(file_path); 
        readStream.on('data', (info) => {
          toSend.data += info.toString('base64');
        }).on('end', () => {
          eventEmitter.emit('sync', toSend);
        });
      });
    });
  } catch (e) {
    res.sendStatus(405);
  }
});
app.get('*', async (req, res) => {
  let file_path   = path.resolve(current_dir, req.path.slice(1));
  try
  {
     let stat   = await fs.promise.stat(file_path);
     if(stat.isDirectory())
     {
        (async () => {
          let file_list = await fs.promise.readdir(file_path);
          let text = JSON.stringify(file_list);
          res.end(JSON.stringify(file_list));
        })();
     }
     else
     {
       let stream = fs.createReadStream(file_path).on('error', (error) => {
           res.sendStatus(404);
       });
       stream.pipe(res).on('error', function (error) {
         res.sendStatus(500);
       });
     }
  }
  catch (e) 
  {
    res.sendStatus(404);
    console.log(e);
  }
});
app.delete('*', async (req, res) => { 
  let file_path   = path.resolve(current_dir, req.path.slice(1));
  let toSend      = {
      'method' : 'DELETE',
      'data'   : '',
      'path'   : req.path.slice(1)
  };

  try {
    let status = await fs.promise.stat(file_path);
    if(status.isDirectory())
    {
      console.log(file_path);
      rimraf(file_path, (error) => {
        if(error)
          res.sendStatus(404);
        else
        {
          toSend.type = 'folder';
          eventEmitter.emit('sync', toSend);
          res.sendStatus(200);
        }
      });
    }
    else 
    {
       await fs.promise.unlink(file_path);
       toSend.type = 'file';
       eventEmitter.emit('sync', toSend);
       res.end();
    }
  } catch (e) {
    res.sendStatus(404);
  }
});

let server = nssocket.createServer(function (socket) {
  eventEmitter.on('sync', function(data)
  {
    console.log('data', data);
    console.dir(data);
    try {
      socket.send('sync', data);
    }
    catch (e) {
    }
  });
});

server.listen(6785);
