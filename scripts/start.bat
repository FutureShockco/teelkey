@echo off
::!/bin/bash

::Ports configuration
setx HTTP_PORT "3001" 
setx P2P_PORT "6001" 

::MongoDB configuration
setx DB_NAME "teelkey" 
setx DB_URL "mongodb://localhost:27017" 

::Peering configuration
::setx OFFLINE "0" 
::setx NO_DISCOVERY "0" 

::Disabling notifications
::setx NOTIFICATIONS "0" 

::trace / debug / info / warn
setx LOG_LEVEL "trace" 

::groups blocks during replay output to lower screen spam
setx REPLAY_OUTPUT "1" 

::default peers to connect with on startup
setx PEERS ""
::setx PEERS "ws://134.209.175.86:6001"
::your user and keys (only useful for active node owners)
setx NODE_OWNER "master"
setx NODE_OWNER_PUB "iYafLsLU8qvsGS8TuU2TyNMjRz6jQVR3XaER4Gswrkn4" 
setx NODE_OWNER_PRIV "6a8ZCRXaKixGUC1yZGLhuhkUta8cv2EysXuh9aqK2pgw"

::src path
cd "C:\Users\hight\Desktop\teelkey\src"
start cmd /C node --stack-size=65500 main
