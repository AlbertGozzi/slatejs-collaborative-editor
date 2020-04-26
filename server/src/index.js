// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');

// Renaming
let app = express();
let server = http.Server(app);
let io = socketIO(server);

// For deployment
app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/', 'index.html'));
});


// Set port for Heroku
let port = process.env.PORT;
if (port == null || port == "") {port = 5000;}
app.set('port', port);

// Starts the server.
server.listen(port, function() {
    console.log(`Starting server on port ${port}`);
});

const initialEditorValue = {
    document: {
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          nodes: [
            {
              object: 'text',
              text: 'A line of text in a paragraph.',
            },
          ],
        },
      ],
    },
};

const groupData = {};

io.on('connection', (socket) => {
    console.log(`Connected ${socket.id}`);

    socket.on('group-id', (groupId) => {
        console.log(`---`);
        console.log(`New user in group [${groupId}]: ${socket.id}`);
        if (!(groupId in groupData)) {
            console.log('First user in group');
            groupData[groupId] = initialEditorValue;
        }
        console.log(`Sending initial value ${JSON.stringify(groupData[groupId].document)}`);
        console.log(`---`);
        io.to(socket.id).emit(`initial-value-${groupId}`, groupData[groupId]);
    });

    socket.on('new-operations', (data) => {
        groupData[data.groupId] = data.value;
        console.log(`Change in group [${data.groupId}]: ${JSON.stringify(groupData[data.groupId].document)}`);
        io.emit(`new-remote-operations-${data.groupId}`, data);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Disconnected ${socket.id}`);
    });
});
