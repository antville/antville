@echo off

:## uncomment the following line to set JAVA_HOME:
REM set JAVA_HOME=c:\programme\jdk13

:## --------------------------------------------
:## No need to edit anything past here
:## --------------------------------------------

set TARGET=%1%

:## eventually check out files necessary for building with ant:
set CVS_ACCESS=:pserver:anonymous@194.232.104.95:/opt/cvs/apps
if not exist extra (
   cvs -d %CVS_ACCESS% ex -r HEAD -d extra antville/build/extra
)
if not exist lib (
   cvs -d %CVS_ACCESS% ex -r HEAD -d lib antville/build/lib
)

if "%JAVA_HOME%" == "" goto javahomeerror

set BUILDFILE=build.xml

set CP="%CLASSPATH%;lib/ant.jar;lib/ant-launcher.jar;lib/jsch.jar;lib/ant-jsch.jar"

"%JAVA_HOME%\bin\java.exe" -cp %CP% org.apache.tools.ant.launch.Launcher -buildfile %BUILDFILE% %TARGET%

goto end

:## -----------ERROR-------------
:javahomeerror
echo "ERROR: JAVA_HOME not found in your environment."
echo "Please, set the JAVA_HOME variable in your environment to match the"
echo "location of the Java Virtual Machine you want to use."

:end

