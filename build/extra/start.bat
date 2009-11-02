@echo off

set JAVA_HOME=
set HOP_HOME=
set HTTP_PORT=
set XMLRPC_PORT=
set AJP13_PORT=
set RMI_PORT=
set CONFIG_FILE=
set OPTIONS=

set HTTP_PORT=8080
rem set XMLRPC_PORT=8081
rem set AJP13_PORT=8009
rem set RMI_PORT=5050
rem set CONFIGFILE=./etc/jetty.xml

rem set HOP_HOME="c:\program files\helma"
rem set JAVA_HOME="c:\program files\java"

set JAVA_OPTIONS="-server -Xmx256m -Djava.awt.headless=true -Dfile.encoding=utf-8"

set INSTALL_DIR=%~d0%~p0

if "%JAVA_HOME%"=="" goto default
   set JAVACMD=%JAVA_HOME%\bin\java
   goto end
:default
   set JAVACMD=java
:end

if "%HOP_HOME%"=="" (
   set HOP_HOME=%INSTALL_DIR%
)
cd %HOP_HOME%

if not "%CONFIG_FILE%"="" (
	echo Using configuration file %CONFIG_FILE%
	set OPTION=%OPTIONS% -c %CONFIG_FILE%
	goto java
)
if not "%HTTP_PORT%"=="" (
   echo Starting HTTP server on port %HTTP_PORT%
   set OPTIONS=%OPTIONS% -w %HTTP_PORT%
)
if not "%XMLRPC_PORT%"=="" (
   echo Starting XML-RPC server on port %XMLRPC_PORT%
   set OPTIONS=%OPTIONS% -x %XMLRPC_PORT%
)
if not "%AJP13_PORT%"=="" (
   echo Starting AJP13 listener on port %AJP13_PORT%
   set OPTIONS=%OPTIONS% -jk %AJP13_PORT%
)
if not "%RMI_PORT%"=="" (
   echo Starting RMI server on port %RMI_PORT%
   set OPTIONS=%OPTIONS% -p %RMI_PORT%
)
if not "%HOP_HOME%"=="" (
   echo Serving applications from %HOP_HOME%
   set OPTIONS=%OPTIONS% -h "%HOP_HOME%
)

:java
%JAVACMD% %JAVA_OPTIONS% -jar "%INSTALL_DIR%\launcher.jar" %OPTIONS%
