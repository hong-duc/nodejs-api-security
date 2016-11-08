/*
Created		27-Oct-16
Modified		28-Oct-16
Project		
Model			
Company		
Author		
Version		
Database		PostgreSQL 8.1 
*/


/* Create Tables */


Create table "account"
(
	"idaccount" Integer NOT NULL,
	"username" Text,
	"passhash" Text,
	"email" Text,
	"isactivite" Boolean,
	"createdate" Date,
	"updatedate" Date,
 primary key ("idaccount")
) Without Oids;


Create table "Login"
(
	"idlogin" Integer NOT NULL,
	"idaccount" Integer NOT NULL,
	"ip" Text,
	"timelogin" Date,
	"timelogout" Date,
	"brower" Text,
 primary key ("idlogin")
) Without Oids;


Create table "ChangePass"
(
	"idChange" Integer NOT NULL,
	"idaccount" Integer NOT NULL,
	"LastPass" Text,
	"NewPass" Text,
	"TimeChange" Text,
	"IP" Text,
	"Brower" Text,
 primary key ("idChange")
) Without Oids;


Create table "dsbrower"
(
	"idbrower" Char(1) NOT NULL,
	"idaccount" Integer NOT NULL,
	"namebrower" Text,
	"os" Text,
	"version" Text,
	"platform" Text,
 primary key ("idbrower")
) Without Oids;


/* Create Foreign Keys */

Alter table "Login" add  foreign key ("idaccount") references "account" ("idaccount") on update restrict on delete restrict;

Alter table "ChangePass" add  foreign key ("idaccount") references "account" ("idaccount") on update restrict on delete restrict;

Alter table "dsbrower" add  foreign key ("idaccount") references "account" ("idaccount") on update restrict on delete restrict;


