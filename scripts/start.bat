@echo off
::!/bin/bash

::Ports configuration
setx HTTP_PORT "3001" 
setx P2P_PORT "6001" 

::MongoDB configuration
setx DB_NAME "teelkey" 
setx DB_URL "mongodb://localhost:27017" 

::Peering configuration
setx OFFLINE "1" 
setx NO_DISCOVERY "1" 

::Disabling notifications
setx NOTIFICATIONS "0" 

::trace / debug / info / warn
setx LOG_LEVEL "debug" 

::groups blocks during replay output to lower screen spam
setx REPLAY_OUTPUT "100" 

::default peers to connect with on startup
setx PEERS ""

::your user and keys (only useful for active node owners)
setx NODE_OWNER "observer-node"
setx NODE_OWNER_PUB "22BgwzFfgepRU3xBHvkBPZmgwy2syjNagopAoKpzb65p2" 
setx NODE_OWNER_PRIV "H6xtpcnQFCRQPvnxknjqySzVdYPXojkvTgbR8wTVp1jd"

::src path
cd "C:\Users\hight\Desktop\teelkey\src"
start cmd /C node --stack-size=65500 main
