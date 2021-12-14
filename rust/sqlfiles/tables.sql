CREATE TABLE users (
	uid INT NOT NULL AUTO_INCREMENT,
	uusername TINYTEXT NOT NULL,
	upassword TINYTEXT NOT NULL,
	uranking INT NOT NULL,
	uemail TINYTEXT,
	uverified INT NOT NULL,
	PRIMARY KEY (uid)
) ENGINE = InnoDB;

CREATE TABLE cardtypes (
	ctid INT NOT NULL,
	ctname TINYTEXT NOT NULL,
	PRIMARY KEY (ctid)
) ENGINE = InnoDB;

CREATE TABLE cards (
	cid INT NOT NULL,
	cname TINYTEXT NOT NULL,
	ctid INT NOT NULL,
	cimage TINYTEXT NOT NULL,
	PRIMARY KEY (cid),
	FOREIGN KEY (ctid) REFERENCES cardtypes(ctid)
) ENGINE = InnoDB;

CREATE TABLE cardframes (
	cfid INT NOT NULL,
	cfname TINYTEXT NOT NULL,
	cfimagefront TINYTEXT NOT NULL,
	cfimageback TINYTEXT NOT NULL,
	PRIMARY KEY (cfid)
) ENGINE = InnoDB;

CREATE TABLE cardunlocks (
	cuid INT NOT NULL AUTO_INCREMENT,
	uid INT NOT NULL,
	cid INT NOT NULL,
	cfid INT NOT NULL,
	cuquality INT NOT NULL,
	culevel INT NOT NULL,
	PRIMARY KEY (cuid),
	FOREIGN KEY (uid) REFERENCES users(uid),
	FOREIGN KEY (cid) REFERENCES cards(cid),
	FOREIGN KEY (cfid) REFERENCES cardframes(cfid)
) ENGINE = InnoDB;

CREATE TABLE friends (
	frid INT AUTO_INCREMENT,
	uidone INT NOT NULL,
	uidtwo INT NOT NULL,
	frstatus INT NOT NULL,
	PRIMARY KEY (frid),
	FOREIGN KEY (uidone) REFERENCES users(uid),
	FOREIGN KEY (uidtwo) REFERENCES users(uid)
) ENGINE = InnoDB;

CREATE TABLE tradecards (
	tcid INT AUTO_INCREMENT,
	uidone INT NOT NULL,
	uidtwo INT NOT NULL,
	cuid INT NOT NULL,
	PRIMARY KEY (tcid),
	FOREIGN KEY (cuid) REFERENCES cardunlocks(cuid),
	FOREIGN KEY (uidone) REFERENCES users(uid),
	FOREIGN KEY (uidtwo) REFERENCES users(uid)
) ENGINE = InnoDB;

CREATE TABLE trades (
	tid INT NOT NULL AUTO_INCREMENT,
	uidone INT NOT NULL,
	uidtwo INT NOT NULL,
	tstatusone INT NOT NULL,
	tstatustwo INT NOT NULL,
	tlasttrade DATETIME,
	PRIMARY KEY(tid),
	FOREIGN KEY (uidone) REFERENCES users(uid),
	FOREIGN KEY (uidtwo) REFERENCES users(uid),
	UNIQUE(uidone, uidtwo)
) ENGINE = InnoDB;

CREATE TABLE notifications (
	nid INT NOT NULL AUTO_INCREMENT,
	uid INT NOT NULL,
	ntitle TINYTEXT NOT NULL,
	nmessage TEXT NOT NULL,
	nurl TEXT NOT NULL,
	ntime DATETIME NOT NULL,
	PRIMARY KEY (nid),
	FOREIGN KEY (uid) REFERENCES users(uid)
) ENGINE = InnoDB;

CREATE TABLE cardeffects (
	ceid INT NOT NULL,
	ceimage TINYTEXT NOT NULL,
	ceopacity FLOAT NOT NULL,
	PRIMARY KEY (ceid)
) ENGINE = InnoDB;

CREATE TABLE packdata (
	pdid INT NOT NULL AUTO_INCREMENT,
	pdamount INT NOT NULL,
	pdtime DATETIME NOT NULL,
	UNIQUE(pdtime),
	PRIMARY KEY (pdid)
) ENGINE = InnoDB;

CREATE TABLE tradesuggestions (
	tsid INT NOT NULL AUTO_INCREMENT,
	uidone INT NOT NULL,
	uidtwo INT NOT NULL,
	cuid INT NOT NULL,
	PRIMARY KEY(tsid),
	FOREIGN KEY (uidone) REFERENCES users(uid),
	FOREIGN KEY (uidtwo) REFERENCES users(uid),
	FOREIGN KEY (cuid) REFERENCES cardunlocks(cuid)
) ENGINE = InnoDB;

CREATE TABLE verificationkeys (
	uid INT NOT NULL,
	vkkey TEXT NOT NULL,
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES users(uid)
) ENGINE = InnoDB;

CREATE TABLE packtimes (
	uid INT NOT NULL,
	ptlastopened DATETIME,
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES users(uid)
) ENGINE = InnoDB;

CREATE TABLE achievements (
	aid INT NOT NULL,
	aimage TEXT NOT NULL,
	atext TEXT NOT NULL,
	PRIMARY KEY (aid)
) ENGINE = InnoDB;

CREATE TABLE achievementunlocks (
	auid INT NOT NULL AUTO_INCREMENT,
	uid INT NOT NULL,
	aid INT NOT NULL,
	PRIMARY KEY (auid),
	FOREIGN KEY (uid) REFERENCES users(uid),
	FOREIGN KEY (aid) REFERENCES achievements(aid)
) ENGINE = InnoDB;
