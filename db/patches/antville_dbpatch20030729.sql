######################################################
##                                                  ##
##   I M P O R T A N T   N O T E :                  ##
##                                                  ##
##   Be sure now to point your browser to           ##
##   http://localhost:8080/antville/convertSites    ##
##   (you might need to change this URL according   ##
##   to your local settings) BEFORE proceeding      ##
##   with patching the database using this file.    ##
##   Otherwise all of your sites' preferences       ##
##   will get lost!                                 ##
##                                                  ##
######################################################

use antville;
alter table AV_SITE
   drop column SITE_BGCOLOR,
   drop column SITE_TEXTFONT,
   drop column SITE_TEXTCOLOR,
   drop column SITE_TEXTSIZE,
   drop column SITE_LINKCOLOR,
   drop column SITE_ALINKCOLOR,
   drop column SITE_VLINKCOLOR,
   drop column SITE_TITLEFONT,
   drop column SITE_TITLECOLOR,
   drop column SITE_TITLESIZE,
   drop column SITE_SMALLFONT,
   drop column SITE_SMALLCOLOR,
   drop column SITE_SMALLSIZE,
   drop column SITE_HASDISCUSSIONS,
   drop column SITE_USERMAYCONTRIB,
   drop column SITE_SHOWDAYS,
   drop column SITE_SHOWARCHIVE,
   drop column SITE_LANGUAGE,
   drop column SITE_COUNTRY,
   drop column SITE_TIMEZONE,
   drop column SITE_LONGDATEFORMAT,
   drop column SITE_SHORTDATEFORMAT,
   drop column SITE_TAGLINE;