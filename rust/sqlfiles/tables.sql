CREATE TABLE users (
	uid INT NOT NULL AUTO_INCREMENT,
	uusername TINYTEXT NOT NULL,
	upassword TINYTEXT NOT NULL,
	uranking INT NOT NULL,
	uemail TINYTEXT NOT NULL,
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
	tid INT AUTO_INCREMENT,
	uidone INT NOT NULL,
	uidtwo INT NOT NULL,
	cuid INT NOT NULL,
	PRIMARY KEY (tid),
	FOREIGN KEY (cuid) REFERENCES cardunlocks(cuid),
	FOREIGN KEY (uidone) REFERENCES users(uid),
	FOREIGN KEY (uidtwo) REFERENCES users(uid)
) ENGINE = InnoDB;

CREATE TABLE trades (
	tmid INT NOT NULL AUTO_INCREMENT,
	uidone INT NOT NULL,
	uidtwo INT NOT NULL,
	tmstatusone INT NOT NULL,
	tmstatustwo INT NOT NULL,
	tmlasttrade DATETIME NOT NULL,
	PRIMARY KEY(tmid),
	FOREIGN KEY (uidone) REFERENCES users(uid),
	FOREIGN KEY (uidtwo) REFERENCES users(uid)
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
	bid INT NOT NULL,
	bimage TEXT NOT NULL,
	btext TEXT NOT NULL,
	PRIMARY KEY (bid)
) ENGINE = InnoDB;

CREATE TABLE achievementunlocks (
	buid INT NOT NULL AUTO_INCREMENT,
	uid INT NOT NULL,
	bid INT NOT NULL,
	PRIMARY KEY (buid),
	FOREIGN KEY (uid) REFERENCES users(uid),
	FOREIGN KEY (bid) REFERENCES achievements(bid)
) ENGINE = InnoDB;
