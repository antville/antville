#!/bin/sh

## uncomment the following line to set JAVA_HOME
#export JAVA_HOME=/usr/lib/j2sdk1.4.0

##--------------------------------------------
## No need to edit anything past here
##--------------------------------------------
if test -z "${JAVA_HOME}" ; then
    echo "ERROR: JAVA_HOME not found in your environment."
    echo "Please, set the JAVA_HOME variable in your environment to match the"
    echo "location of the Java Virtual Machine you want to use."
    exit
fi

BUILDFILE=build.xml

${JAVA_HOME}/bin/java -cp ant-launcher.jar org.apache.tools.ant.launch.Launcher -buildfile ${BUILDFILE} ${1}

