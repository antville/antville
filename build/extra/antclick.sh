#!/bin/sh
# Shell script for starting Helma with a JDK-like virtual machine.

# To add JAR files to the classpath, simply place them into the
# lib/ext directory.

# uncomment to set JAVA_HOME variable
# JAVA_HOME=/usr/lib/java

# uncomment to set HOP_HOME, otherwise we get it from the script path
# HOP_HOME=/usr/local/helma

# options to pass to the Java virtual machine
# JAVA_OPTIONS="-server -Xmx128m"

# Set TCP ports for Helma servers
# (comment/uncomment to de/activate)
HTTP_PORT=8080
# XMLRPC_PORT=8081
# AJP13_PORT=8009
# RMI_PORT=5050

###########################################################
###### No user configuration needed below this line #######
###########################################################

# if JAVA_HOME variable is set, use it. Otherwise, Java executable
# must be contained in PATH variable.
if [ "$JAVA_HOME" ]; then
   JAVACMD="$JAVA_HOME/bin/java"
else
   JAVACMD=java
fi


# If JAVA_HOME is set, check if java command is executable
if [ $JAVA_HOME -a ! -x $JAVACMD ] ; then
   echo "Warning: JAVA_HOME variable may be set incorrectly:"
   echo "         No executable found at $JAVACMD"
fi

# Get the Helma installation directory
INSTALL_DIR="${0%/*}"
cd $INSTALL_DIR
INSTALL_DIR=$PWD

# get HOP_HOME variable if it isn't set
if [ -z "$HOP_HOME" ]; then
  # try to get HOP_HOME from script file and pwd
  # strip everyting behind last slash
  HOP_HOME="${0%/*}"
  cd $HOP_HOME
  HOP_HOME=$PWD
else
  cd $HOP_HOME
fi
echo "Starting Helma in directory $HOP_HOME"

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

# Invoke the Java VM
$JAVACMD $JAVA_OPTIONS -jar "$INSTALL_DIR/launcher.jar" $SWITCHES
