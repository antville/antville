#!/bin/sh

##
## The Antville Project
## http://code.google.com/p/antville
##
## Copyright 2001-2007 by The Antville People
##
## Licensed under the Apache License, Version 2.0 (the ``License'');
## you may not use this file except in compliance with the License.
## You may obtain a copy of the License at
##
##    http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an ``AS IS'' BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.
##
## $Revision:3333 $
## $LastChangedBy:piefke3000 $
## $LastChangedDate:2007-09-15 01:25:23 +0200 (Sat, 15 Sep 2007) $
## $URL$
##

##--------------------------------------------
## No need to edit anything past here
##--------------------------------------------

if test -z "${ANT_HOME}" ; then
    echo "ERROR: ANT_HOME not found in your environment."
    echo "Please, set the ANT_HOME variable in your environment to match the"
    echo "location of the Apache Ant installation you want to use."
    exit
fi

BUILD_HOME=$(dirname $0)
if [ "${BUILD_HOME:0:1}" != "/" ] ; then
    # convert to absolute path
    BUILD_HOME=${PWD}/${BUILD_HOME}
fi
export BUILD_HOME

if [ -z "$HELMA_HOME" ] ; then
    HELMA_HOME=$BUILD_HOME/../../../
fi

while [ $# -ne 0  ]
do
    ANT_CMD_LINE_ARGS="${ANT_CMD_LINE_ARGS} $1"
    shift
done

${ANT_HOME}/bin/ant -Dhelma.dir="${HELMA_HOME}" -Dbuild.dir="${BUILD_HOME}" -Dbase.dir="${PWD}" -lib "${BUILD_HOME}/lib:${HELMA_HOME}/lib" -propertyfile "${BUILD_HOME}/build.properties" -file "${BUILD_HOME}/build.xml" ${ANT_CMD_LINE_ARGS}

exit
