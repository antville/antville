#!/bin/sh

## uncomment the following line to set JAVA_HOME
#export JAVA_HOME=/usr/lib/j2sdk1.4.0

##--------------------------------------------
## No need to edit anything past here
##--------------------------------------------

## eventually check out files necessary for building with ant:
CVS_ACCESS=:pserver:anonymous@194.232.104.95:/opt/cvs/apps
if ! test -d extra ; then
   cvs -d ${CVS_ACCESS} ex -r HEAD -d extra antville/build/extra
fi
if ! test -d lib ; then
   cvs -d ${CVS_ACCESS} ex -r HEAD -d lib antville/build/lib
fi

if test -z "${JAVA_HOME}" ; then
    echo "ERROR: JAVA_HOME not found in your environment."
    echo "Please, set the JAVA_HOME variable in your environment to match the"
    echo "location of the Java Virtual Machine you want to use."
    exit
fi

BUILDFILE=build.xml

CP="${CLASSPATH}:lib/ant.jar:lib/ant-launcher.jar:lib/jsch.jar:lib/ant-jsch.jar"

${JAVA_HOME}/bin/java -cp ${CP} org.apache.tools.ant.launch.Launcher -buildfile ${BUILDFILE} ${1}

