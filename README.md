# Proxy Server

This is a Drop box  clone  for Node.js submitted as the [assignment week1](http://courses.codepath.com/courses/intro_to_nodejs/week/1#!assignment) requirement for CodePath.

Time spent: 3

Completed:

* [] Required: Use the CWD as the root of your file path.
* [] Required: Setup an HTTP server listening on port 8000.
* [] Required: Implement an HTTP route for /path/to/file.js
* [] Required: (GET) Return the contents of $CWD/path/to/file.js: fs.readFile(filePath).
* [] Required: (GET) Stream the contents: fs.createReadStream(filePath).
* [] Required: (HEAD) Return an empty body wtih the following headers:  Content-Length, Content-Type.
* [] Required: (GET) Include these headers when sending the GET response.
* [] Required: (PUT) Success: Save the request body's content to the specified path.
* [] Required: (PUT) Failure: Return 405 Method Not Allowed if the file exists.
* [] Required: (POST) Success: Update the file with the contents of the request body.
* [] Required: (POST) Failure: Return 405 Method Not Allowed if the file does not exist. 
* [] Required: (DELETE) Delete the specified file: fs.unlink(path.join(ROOT_DIR, filePath)) .
* [] Required: Implement an HTTP route for /path/to/directory .
* [] Required: (GET) Return a JSON encoded array of the names of contained files.
* [] Required: (HEAD) Return an empty body with accurate Content-Type and Content-Length headers .
* [] Required: (GET) Include these headers when sending the GET response.
* [] Required: (PUT) Success: Create a directory at the specified path. Ignore body contents. 
* [] Required: (PUT) Return 405 Method Not Allowed if the file or directory exists.
* [] Required: (POST) Return 405 Method Not Allowed.
* [] Required: (DELETE) Delete the specified directory and all its contents using the rimraf package.
* [] Required: If passed, the value of the dir argument should be used instead of the CWD.
* [] Required: Add TCP support.
* [] Required: (Client) Use the CWD as the root of your file path: process.cwd().
* [] Required: (Client) Connect to the server using TCP (See the server "Add TCP Support" recommendations above).
* [] Required: (Client) Connect to the server using TCP (See the server "Add TCP Support" recommendations above).
* [] Required: Use --dir as the root, default to process.cwd().


-![Alt text](/image/drop_box_usage.gif?raw=true "Check Usage section")

## Starting the Server

```bash
cd server/
npm start
```

## Starting the client

```bash
cd client/
npm start -- --dir dir_to_sync
```

## Features

### Creating a file :

```bash
curl -v -X PUT http://127.0.0.1:8000/file.txt -d "hello self" 
```


### Creating a folder :

```bash
curl -v -X PUT http://127.0.0.1:8000/folder_name
```

### Updating  a file :

```bash
curl -v -X POST http://127.0.0.1:8000/file.txt -d "hello self" 
```

### Deleting  a file or a folder :

```bash
curl -v -X DELETE http://127.0.0.1:8000/file.txt 
```

### Configuration:

#### CLI Arguments:

The following CLI arguments are supported:

##### `--dir`

Folder path to store files and sync with the server in the client case

