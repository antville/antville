#!/bin/sh

#JAVA_HOME=/usr/lib/java
#HOP_HOME=/usr/local/helma

JAVA_OPTIONS="-server -Xmx256m -Djava.awt.headless=true -Dfile.encoding=utf-8"

HTTP_PORT=8080
#XMLRPC_PORT=8081
#AJP13_PORT=8009
#RMI_PORT=5050
#CONFIG_FILE=./etc/jetty.xml

if [ "$JAVA_HOME" ]; then
   JAVACMD="$JAVA_HOME/bin/java"
   # Check if java command is executable
   if [ ! -x $JAVACMD ]; then
      echo "Warning: JAVA_HOME variable may be set incorrectly:"
      echo "         No executable found at $JAVACMD"
   fi
else
   JAVACMD=java
fi

INSTALL_DIR="${0%/*}"
cd $INSTALL_DIR
INSTALL_DIR=$PWD

if [ -z "$HOP_HOME" ]; then
  ## try to get HOP_HOME from script file and pwd
  ## strip everyting behind last slash
  HOP_HOME="${0%/*}"
  cd $HOP_HOME
  HOP_HOME=$PWD
else
  cd $HOP_HOME
fi
echo "Starting Helma in directory $HOP_HOME"

if [ "$CONFIG_FILE" ]; then
   SWITCHES="$SWITCHES -c $CONFIG_FILE"
   echo Using configuration file $CONFIG_FILE
else
   if [ "$HTTP_PORT" ]; then
      SWITCHES="$SWITCHES -w $HTTP_PORT"
      echo Starting HTTP server on port $HTTP_PORT
   fi
   if [ "$XMLRPC_PORT" ]; then
      SWITCHES="$SWITCHES -x $XMLRPC_PORT"
      echo Starting XML-RPC server on port $XMLRPC_PORT
   fi
   if [ "$AJP13_PORT" ]; then
      SWITCHES="$SWITCHES -jk $AJP13_PORT"
      echo Starting AJP13 listener on port $AJP13_PORT
   fi
   if [ "$RMI_PORT" ]; then
      SWITCHES="$SWITCHES -p $RMI_PORT"
      echo Starting RMI server on port $RMI_PORT
   fi
   if [ "$HOP_HOME" ]; then
      SWITCHES="$SWITCHES -h $HOP_HOME"
   fi
fi

$JAVACMD $JAVA_OPTIONS -jar "$INSTALL_DIR/launcher.jar" $SWITCHES
